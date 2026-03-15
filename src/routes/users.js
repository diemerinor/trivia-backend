const { Router } = require('express');
const controller = require('../controllers/userController');

const router = Router();

/**
 * GET /api/users/:id — Obtener perfil de un usuario
 *
 * Params:
 *   :id → integer, ID del usuario
 *
 * Respuestas:
 *   200 → { id, username, email, role, level, total_points, credits, created_at, ActiveSkin: { id, name, image_url }, SubscriptionPlan: { id, name } }
 *         (nunca incluye password_hash)
 *   404 → { error: "Usuario no encontrado" }
 *   500 → { error }
 */
router.get('/:id', controller.getProfile);

/**
 * POST /api/users — Crear nuevo usuario (uso interno/admin, para registro público usar /api/auth/register)
 *
 * Body (JSON):
 *   {
 *     "username": "diego123",        → string, obligatorio, único
 *     "email": "diego@mail.com",     → string, obligatorio, único
 *     "password_hash": "$2b$10...",  → string, obligatorio (hash ya generado)
 *     "role": "player"               → string, opcional, default: "player"
 *   }
 *
 * Respuestas:
 *   201 → { id, username, email, role, level, total_points, credits, created_at }  — sin password_hash
 *   400 → { error: "Campos requeridos: username, email, password_hash" } | { error: "El username o email ya existe" }
 *   500 → { error }
 */
router.post('/', controller.create);

/**
 * PUT /api/users/:id — Actualizar perfil completo
 *
 * Params:
 *   :id → integer, ID del usuario
 *
 * Body (JSON): todos los campos son opcionales, solo se actualizan los enviados.
 *   {
 *     "username": "nuevo_nombre",       → string, único
 *     "email": "nuevo@mail.com",        → string, único
 *     "role": "admin",                  → string
 *     "active_skin_id": 2,              → integer (FK a skins)
 *     "plan_id": 1                      → integer (FK a subscription_plans)
 *   }
 *
 * Respuestas:
 *   200 → { id, username, email, role, ... }  — perfil actualizado, sin password_hash
 *   400 → { error: "El username o email ya existe" }
 *   404 → { error: "Usuario no encontrado" }
 *   500 → { error }
 */
router.put('/:id', controller.update);

/**
 * PATCH /api/users/:id/stats — Actualizar puntos, créditos y/o nivel
 *
 * Params:
 *   :id → integer, ID del usuario
 *
 * Body (JSON): todos los campos son opcionales, solo se actualizan los enviados.
 *   {
 *     "total_points": 1500,     → integer, puntos acumulados
 *     "credits": 50,            → integer, créditos disponibles
 *     "level": 5                → integer, nivel del jugador
 *   }
 *
 * Respuestas:
 *   200 → { id, username, level, total_points, credits, ... }  — stats actualizados
 *   404 → { error: "Usuario no encontrado" }
 *   500 → { error }
 */
router.patch('/:id/stats', controller.updateStats);

module.exports = router;
