const { Router } = require('express');
const controller = require('../controllers/gameSessionController');
const { authenticate } = require('../middlewares/auth');

const router = Router();

// Todas las rutas de sesiones requieren autenticación
router.use(authenticate);

/**
 * POST /api/sessions — Crear nueva sesión de juego
 *
 * Headers:
 *   Authorization: Bearer <token>   → obligatorio (user_id se extrae del JWT)
 *
 * Body: no requiere body (se puede enviar {} vacío)
 *
 * Respuestas:
 *   201 → { id, user_id, score: 0, started_at, ended_at: null }  — sesión creada
 *   401 → { error: "Token no proporcionado" }
 *   500 → { error }
 */
router.post('/', controller.create);

/**
 * GET /api/sessions/:id — Obtener detalle de una sesión (con usuario, categoría y respuestas)
 *
 * Headers:
 *   Authorization: Bearer <token>   → obligatorio
 *
 * Params:
 *   :id → integer, ID de la sesión
 *
 * Respuestas:
 *   200 → { id, score, started_at, ended_at, User: { id, username }, Category: { id, name }, Answers: [{ id, question_id, is_correct, Question: { id, prompt_text } }] }
 *   401 → { error: "Token no proporcionado" }
 *   403 → { error: "No tienes acceso a esta sesión" }
 *   404 → { error: "Sesión no encontrada" }
 *   500 → { error }
 */
router.get('/:id', controller.getById);

/**
 * GET /api/sessions/me — Listar historial de sesiones del usuario autenticado
 *
 * Headers:
 *   Authorization: Bearer <token>   → obligatorio (user_id se extrae del JWT)
 *
 * Respuestas:
 *   200 → { total: 10, sessions: [{ id, difficulty, score, started_at, ended_at, Category: { id, name } }] }  — ordenadas por fecha DESC
 *   401 → { error: "Token no proporcionado" }
 *   500 → { error }
 */
router.get('/me', controller.getByUser);

/**
 * POST /api/sessions/:id/answers — Registrar respuestas del usuario (cierra la sesión)
 *
 * Params:
 *   :id → integer, ID de la sesión
 *
 * Body (JSON):
 *   {
 *     "answers": [                         → array, obligatorio, mínimo 1 elemento
 *       { "question_id": 5, "is_correct": true  },
 *       { "question_id": 8, "is_correct": false },
 *       { "question_id": 12, "is_correct": true }
 *     ]
 *   }
 *
 * Lógica:
 *   - Guarda cada respuesta en session_answers
 *   - Suma +10 puntos al score por cada respuesta correcta
 *   - Establece ended_at con la fecha/hora actual (cierra la sesión)
 *   - Todo dentro de una transacción (rollback si falla)
 *
 * Respuestas:
 *   201 → { id, score: 20, started_at, ended_at, Answers: [...] }  — sesión cerrada con respuestas
 *   400 → { error: "Se requiere un array 'answers' con [{ question_id, is_correct }]" }
 *   401 → { error: "Token no proporcionado" }
 *   403 → { error: "No tienes acceso a esta sesión" }
 *   404 → { error: "Sesión no encontrada" }
 *   500 → { error }
 */
router.post('/:id/answers', controller.addAnswers);

module.exports = router;
