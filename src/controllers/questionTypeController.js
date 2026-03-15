const { QuestionType } = require('../models');

// ─── Listar todos los tipos de pregunta ───────────
const getAll = async (_req, res) => {
  try {
    const types = await QuestionType.findAll({ order: [['id', 'ASC']] });
    return res.json({ total: types.length, question_types: types });
  } catch (error) {
    console.error('Error al obtener tipos de pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Obtener un tipo por ID ───────────────────────
const getById = async (req, res) => {
  try {
    const type = await QuestionType.findByPk(req.params.id);

    if (!type) {
      return res.status(404).json({ error: 'Tipo de pregunta no encontrado' });
    }

    return res.json(type);
  } catch (error) {
    console.error('Error al obtener tipo de pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Crear tipo de pregunta ──────────────────────
const create = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El campo "name" es requerido' });
    }

    const type = await QuestionType.create({ name });
    return res.status(201).json(type);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un tipo con ese nombre' });
    }
    console.error('Error al crear tipo de pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Actualizar tipo de pregunta ─────────────────
const update = async (req, res) => {
  try {
    const type = await QuestionType.findByPk(req.params.id);

    if (!type) {
      return res.status(404).json({ error: 'Tipo de pregunta no encontrado' });
    }

    const { name } = req.body;
    await type.update({ name });

    return res.json(type);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un tipo con ese nombre' });
    }
    console.error('Error al actualizar tipo de pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Eliminar tipo de pregunta ───────────────────
const remove = async (req, res) => {
  try {
    const type = await QuestionType.findByPk(req.params.id);

    if (!type) {
      return res.status(404).json({ error: 'Tipo de pregunta no encontrado' });
    }

    await type.destroy();

    return res.json({ mensaje: `Tipo "${type.name}" eliminado correctamente` });
  } catch (error) {
    console.error('Error al eliminar tipo de pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, create, update, remove };
