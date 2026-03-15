const { Router } = require('express');
const controller = require('../controllers/questionController');
const { authenticate } = require('../middlewares/auth');

const router = Router();

/**
 * GET /api/questions — Listar todas las preguntas (con opciones, categoría y tipo)
 *
 * Query params (opcionales):
 *   ?category_id=1            → filtrar por categoría
 *   ?difficulty_level=3       → filtrar por dificultad
 *
 * Respuestas:
 *   200 → { total: 5, questions: [{ id, category_id, type_id, difficulty_level, prompt_text, media_url, Options: [...], Category: {...}, QuestionType: {...} }] }
 *   500 → { error }           — error interno del servidor
 */
router.get('/', controller.getAll);

/**
 * GET /api/questions/next — Obtener siguiente pregunta aleatoria para la sesión actual
 *
 * Headers:
 *   Authorization: Bearer <token>   → obligatorio
 *
 * Query params (obligatorio):
 *   ?session_id=7              → integer, ID de la sesión de juego en curso
 *
 * Lógica:
 *   - Verifica que la sesión existe, pertenece al usuario autenticado y no está finalizada.
 *   - Excluye SOLO las preguntas que ya se respondieron en ESTA sesión.
 *   - Devuelve una pregunta aleatoria de cualquier dificultad y categoría.
 *   - Las preguntas pueden repetirse entre sesiones distintas.
 *
 * Respuestas:
 *   200 → { session_id, preguntas_respondidas, question: { id, prompt_text, difficulty_level, Options: [...], Category, QuestionType } }
 *   400 → { error: "Query param requerido: ?session_id=7" }
 *   400 → { error: "Esta sesión ya fue finalizada" }
 *   401 → { error: "Token no proporcionado" }
 *   403 → { error: "No tienes acceso a esta sesión" }
 *   404 → { error: "Sesión no encontrada" }
 *   404 → { error: "No hay más preguntas disponibles", detalle: "..." }
 *   500 → { error }
 */
router.get('/next', authenticate, controller.getNext);

/**
 * GET /api/questions/:id — Obtener una pregunta por su ID
 *
 * Params:
 *   :id → integer, ID de la pregunta
 *
 * Respuestas:
 *   200 → { id, prompt_text, Options: [{ id, content_left, content_right, is_correct }], Category: {...}, QuestionType: {...} }
 *   404 → { error: "Pregunta no encontrada" }
 *   500 → { error }
 */
router.get('/:id', controller.getById);

/**
 * POST /api/questions — Crear pregunta con sus opciones (transacción atómica)
 *
 * Body (JSON):
 *   {
 *     "category_id": 1,                        → integer, obligatorio (FK a categories)
 *     "type_id": 1,                             → integer, obligatorio (FK a question_types)
 *     "difficulty_level": 2,                    → integer, opcional, default: 1
 *     "prompt_text": "¿Cuál es...?",            → string, obligatorio
 *     "media_url": "https://...",               → string, opcional
 *     "options": [                              → array, obligatorio, mínimo 1 elemento
 *       { "content_left": "Marte",    "is_correct": false },
 *       { "content_left": "Júpiter",  "is_correct": true  },
 *       { "content_left": "Saturno",  "content_right": "6to planeta", "is_correct": false }
 *     ]
 *   }
 *
 * Respuestas:
 *   201 → { id, prompt_text, ..., Options: [...] }  — pregunta creada con sus opciones
 *   400 → { error: "Campos requeridos: category_id, type_id, prompt_text, options[]" }
 *   500 → { error }  — rollback automático de la transacción
 */
router.post('/', controller.create);

/**
 * PUT /api/questions/:id — Actualizar pregunta (y reemplazar opciones si se envían)
 *
 * Params:
 *   :id → integer, ID de la pregunta
 *
 * Body (JSON): misma estructura que POST, todos los campos opcionales.
 *   Si se incluye "options", se eliminan las anteriores y se crean las nuevas.
 *
 * Respuestas:
 *   200 → { id, prompt_text, ..., Options: [...] }  — pregunta actualizada
 *   404 → { error: "Pregunta no encontrada" }
 *   500 → { error }
 */
router.put('/:id', controller.update);

/**
 * DELETE /api/questions/:id — Eliminar pregunta y todas sus opciones
 *
 * Params:
 *   :id → integer, ID de la pregunta
 *
 * Respuestas:
 *   200 → { mensaje: "Pregunta 1 eliminada correctamente" }
 *   404 → { error: "Pregunta no encontrada" }
 *   500 → { error }
 */
router.delete('/:id', controller.remove);

module.exports = router;
