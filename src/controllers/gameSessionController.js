const { GameSession, SessionAnswer, User, Question, sequelize } = require('../models');

// ─── Crear nueva sesión de juego ──────────────────
const create = async (req, res) => {
  try {
    const user_id = req.user.id; // viene del token JWT

    const session = await GameSession.create({
      user_id,
      score: 0,
      started_at: new Date(),
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error('Error al crear sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Obtener sesión por ID (con respuestas) ───────
const getById = async (req, res) => {
  try {
    const session = await GameSession.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'username'] },
        {
          model: SessionAnswer,
          as: 'Answers',
          include: [{ model: Question, attributes: ['id', 'prompt_text'] }],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    // Verificar que la sesión pertenece al usuario autenticado
    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a esta sesión' });
    }

    return res.json(session);
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Listar sesiones del usuario autenticado ─────
const getByUser = async (req, res) => {
  try {
    const sessions = await GameSession.findAll({
      where: { user_id: req.user.id },
      order: [['started_at', 'DESC']],
    });

    return res.json({ total: sessions.length, sessions });
  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Registrar respuestas del usuario ─────────────
const addAnswers = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const sessionId = req.params.id;
    const { answers } = req.body; // [{ question_id, is_correct }]

    if (!answers || !answers.length) {
      await t.rollback();
      return res.status(400).json({
        error: 'Se requiere un array "answers" con [{ question_id, is_correct }]',
      });
    }

    const session = await GameSession.findByPk(sessionId);

    if (!session) {
      await t.rollback();
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    // Verificar que la sesión pertenece al usuario autenticado
    if (session.user_id !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ error: 'No tienes acceso a esta sesión' });
    }

    const answersData = answers.map((a) => ({
      session_id: Number(sessionId),
      question_id: a.question_id,
      is_correct: a.is_correct,
    }));

    await SessionAnswer.bulkCreate(answersData, { transaction: t });

    // Calcular puntaje: +10 por respuesta correcta
    const correctCount = answers.filter((a) => a.is_correct).length;
    const newScore = session.score + correctCount * 10;

    await session.update(
      { score: newScore, ended_at: new Date() },
      { transaction: t }
    );

    await t.commit();

    // Recargar con las respuestas incluidas
    const updated = await GameSession.findByPk(sessionId, {
      include: [{ model: SessionAnswer, as: 'Answers' }],
    });

    return res.status(201).json(updated);
  } catch (error) {
    await t.rollback();
    console.error('Error al registrar respuestas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { create, getById, getByUser, addAnswers };
