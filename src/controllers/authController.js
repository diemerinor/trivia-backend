const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Skin, SubscriptionPlan } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const SALT_ROUNDS = 10;

// ─── Registro de usuario ──────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos: username, email, password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // Verificar si ya existe
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ username, email, password_hash });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash: _, ...userData } = user.toJSON();

    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      user: userData,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El username o email ya existe' });
    }
    console.error('Error en registro:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Inicio de sesión ─────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos: email, password',
      });
    }

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Skin, as: 'ActiveSkin', attributes: ['id', 'name', 'image_url'] },
        { model: SubscriptionPlan, attributes: ['id', 'name'] },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash: _, ...userData } = user.toJSON();

    return res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ─── Obtener usuario actual (desde token) ─────────
const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
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

module.exports = { register, login, me };
