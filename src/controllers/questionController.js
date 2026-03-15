const { Question, QuestionOption, Category, QuestionType, User, SessionAnswer, GameSession, sequelize } = require('../models');
const { Op } = require('sequelize');

// ─── Obtener siguiente pregunta aleatoria para la sesión actual ─
const getNext = async (req, res) => {
  try {
    const user_id = req.user.id; // viene del token JWT (middleware authenticate)
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Query param requerido: ?session_id=7' });
    }

    // 1. Verificar que la sesión existe y pertenece al usuario
    const session = await GameSession.findByPk(session_id);

    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    if (session.user_id !== user_id) {
      return res.status(403).json({ error: 'No tienes acceso a esta sesión' });
    }

    if (session.ended_at) {
      return res.status(400).json({ error: 'Esta sesión ya fue finalizada' });
    }

    // 2. Obtener IDs de preguntas ya respondidas en ESTA sesión
    const answeredInSession = await SessionAnswer.findAll({
      attributes: ['question_id'],
      where: { session_id },
      raw: true,
    });

    const excludeIds = answeredInSession.map((a) => a.question_id);

    // 3. Buscar una pregunta aleatoria, excluyendo solo las de esta sesión
    const whereClause = {};

    if (excludeIds.length > 0) {
      whereClause.id = { [Op.notIn]: excludeIds };
    }

    const question = await Question.findOne({
      where: whereClause,
      include: [
        { model: QuestionOption, as: 'Options' },
        { model: Category, attributes: ['id', 'name'] },
        { model: QuestionType, attributes: ['id', 'name'] },
      ],
      order: sequelize.literal('RANDOM()'),
    });

    if (!question) {
      return res.status(404).json({
        error: 'No hay más preguntas disponibles',
        detalle: `Ya se respondieron ${excludeIds.length} preguntas en esta sesión.`,
      });
    }

    return res.json({
      session_id: Number(session_id),
      preguntas_respondidas: excludeIds.length,
      question,
    });
  } catch (error) {
    console.error('Error al obtener siguiente pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Obtener todas las preguntas (con opciones) ────
const getAll = async (req, res) => {
  try {
    const { category_id, difficulty_level } = req.query;
    const where = {};

    if (category_id) where.category_id = category_id;
    if (difficulty_level) where.difficulty_level = difficulty_level;

    const questions = await Question.findAll({
      where,
      include: [
        { model: QuestionOption, as: 'Options' },
        { model: Category, attributes: ['id', 'name'] },
        { model: QuestionType, attributes: ['id', 'name'] },
      ],
      order: [['id', 'ASC']],
    });

    return res.json({ total: questions.length, questions });
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Obtener una pregunta por ID ───────────────────
const getById = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id, {
      include: [
        { model: QuestionOption, as: 'Options' },
        { model: Category, attributes: ['id', 'name'] },
        { model: QuestionType, attributes: ['id', 'name'] },
      ],
    });

    if (!question) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    return res.json(question);
  } catch (error) {
    console.error('Error al obtener pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Crear pregunta con opciones (transacción) ────
const create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { category_id, type_id, difficulty_level, prompt_text, media_url, options } = req.body;

    if (!category_id || !type_id || !prompt_text || !options || !options.length) {
      await t.rollback();
      return res.status(400).json({
        error: 'Campos requeridos: category_id, type_id, prompt_text, options[]',
      });
    }

    const question = await Question.create(
      { category_id, type_id, difficulty_level, prompt_text, media_url },
      { transaction: t }
    );

    const optionsData = options.map((opt) => ({
      question_id: question.id,
      content_left: opt.content_left,
      content_right: opt.content_right || null,
      is_correct: opt.is_correct || false,
    }));

    await QuestionOption.bulkCreate(optionsData, { transaction: t });

    await t.commit();

    // Recargar con las opciones incluidas
    const created = await Question.findByPk(question.id, {
      include: [{ model: QuestionOption, as: 'Options' }],
    });

    return res.status(201).json(created);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Actualizar pregunta ──────────────────────────
const update = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      await t.rollback();
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    const { category_id, type_id, difficulty_level, prompt_text, media_url, options } = req.body;

    await question.update(
      { category_id, type_id, difficulty_level, prompt_text, media_url },
      { transaction: t }
    );

    // Si vienen opciones nuevas, reemplazar las existentes
    if (options && options.length) {
      await QuestionOption.destroy({ where: { question_id: question.id }, transaction: t });

      const optionsData = options.map((opt) => ({
        question_id: question.id,
        content_left: opt.content_left,
        content_right: opt.content_right || null,
        is_correct: opt.is_correct || false,
      }));

      await QuestionOption.bulkCreate(optionsData, { transaction: t });
    }

    await t.commit();

    const updated = await Question.findByPk(question.id, {
      include: [{ model: QuestionOption, as: 'Options' }],
    });

    return res.json(updated);
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Eliminar pregunta (y sus opciones en cascada) ─
const remove = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      await t.rollback();
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    await QuestionOption.destroy({ where: { question_id: question.id }, transaction: t });
    await question.destroy({ transaction: t });

    await t.commit();

    return res.json({ mensaje: `Pregunta ${req.params.id} eliminada correctamente` });
  } catch (error) {
    await t.rollback();
    console.error('Error al eliminar pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getNext, getAll, getById, create, update, remove };
