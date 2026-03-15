const { Router } = require('express');
const controller = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = Router();

/**
 * POST /api/auth/register — Registrar nuevo usuario
 *
 * Body (JSON):
 *   {
 *     "username": "diego123",        → string, obligatorio, único
 *     "email": "diego@mail.com",     → string, obligatorio, único, formato email
 *     "password": "miClave123"       → string, obligatorio, mínimo 6 caracteres
 *   }
 *
 * Respuestas:
 *   201 → { mensaje, token, user }   — registro exitoso, devuelve JWT y datos del usuario (sin password_hash)
 *   400 → { error }                  — campos faltantes, password muy corta, o email/username duplicado
 *   500 → { error }                  — error interno del servidor
 */
router.post('/register', controller.register);

/**
 * POST /api/auth/login — Iniciar sesión
 *
 * Body (JSON):
 *   {
 *     "email": "diego@mail.com",     → string, obligatorio
 *     "password": "miClave123"       → string, obligatorio
 *   }
 *
 * Respuestas:
 *   200 → { mensaje, token, user }   — login exitoso, devuelve JWT (expira en 7 días) y perfil completo
 *   400 → { error }                  — campos faltantes
 *   401 → { error: "Credenciales incorrectas" } — email no existe o password incorrecto
 *   500 → { error }                  — error interno del servidor
 */
router.post('/login', controller.login);

/**
 * GET /api/auth/me — Obtener perfil del usuario autenticado
 *
 * Headers:
 *   Authorization: Bearer <token_jwt>
 *
 * Respuestas:
 *   200 → { id, username, email, role, level, total_points, credits, ActiveSkin, SubscriptionPlan, ... }
 *   401 → { error: "Token no proporcionado" | "Token inválido o expirado" }
 *   404 → { error: "Usuario no encontrado" }
 *   500 → { error }                  — error interno del servidor
 */
router.get('/me', authenticate, controller.me);

module.exports = router;
