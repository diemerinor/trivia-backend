const { Category } = require('../models');

// ─── Listar categorías activas ─────────────────────
const getActive = async (_req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });

    return res.json({ total: categories.length, categories });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Listar todas las categorías ───────────────────
const getAll = async (_req, res) => {
  try {
    const categories = await Category.findAll({ order: [['id', 'ASC']] });
    return res.json({ total: categories.length, categories });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Crear categoría ──────────────────────────────
const create = async (req, res) => {
  try {
    const { name, icon_url, is_active } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El campo "name" es requerido' });
    }

    const category = await Category.create({ name, icon_url, is_active });
    return res.status(201).json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    console.error('Error al crear categoría:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Actualizar categoría ─────────────────────────
const update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const { name, icon_url, is_active } = req.body;
    await category.update({ name, icon_url, is_active });

    return res.json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    console.error('Error al actualizar categoría:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Eliminar categoría ──────────────────────────
const remove = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await category.destroy();

    return res.json({ mensaje: `Categoría "${category.name}" eliminada correctamente` });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getActive, create, update, remove };
