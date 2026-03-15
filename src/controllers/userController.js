const { User, Skin, SubscriptionPlan } = require('../models');

// ─── Obtener perfil de un usuario ──────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Skin, as: 'ActiveSkin', attributes: ['id', 'name', 'image_url'] },
        { model: SubscriptionPlan, attributes: ['id', 'name'] },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Crear nuevo usuario ──────────────────────────
const create = async (req, res) => {
  try {
    const { username, email, password_hash, role } = req.body;

    if (!username || !email || !password_hash) {
      return res.status(400).json({
        error: 'Campos requeridos: username, email, password_hash',
      });
    }

    const user = await User.create({ username, email, password_hash, role });

    // Devolver sin el hash
    const { password_hash: _, ...userData } = user.toJSON();
    return res.status(201).json(userData);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El username o email ya existe' });
    }
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Actualizar puntos y créditos ─────────────────
const updateStats = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { total_points, credits, level } = req.body;

    await user.update({
      total_points: total_points ?? user.total_points,
      credits: credits ?? user.credits,
      level: level ?? user.level,
    });

    const { password_hash: _, ...userData } = user.toJSON();
    return res.json(userData);
  } catch (error) {
    console.error('Error al actualizar stats:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Actualizar perfil completo ───────────────────
const update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { username, email, role, active_skin_id, plan_id } = req.body;

    await user.update({
      username: username ?? user.username,
      email: email ?? user.email,
      role: role ?? user.role,
      active_skin_id: active_skin_id ?? user.active_skin_id,
      plan_id: plan_id ?? user.plan_id,
    });

    const { password_hash: _, ...userData } = user.toJSON();
    return res.json(userData);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El username o email ya existe' });
    }
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getProfile, create, updateStats, update };
