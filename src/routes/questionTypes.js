const { Router } = require('express');
const controller = require('../controllers/questionTypeController');

const router = Router();

/**
 * GET /api/question-types — Listar todos los tipos de pregunta
 *
 * Respuestas:
 *   200 → { total: 3, question_types: [{ id: 1, name: "Opción múltiple" }, { id: 2, name: "Verdadero/Falso" }, ...] }
 *   500 → { error }
 */
router.get('/', controller.getAll);

/**
 * GET /api/question-types/:id — Obtener un tipo por su ID
 *
 * Params:
 *   :id → integer, ID del tipo
 *
 * Respuestas:
 *   200 → { id: 1, name: "Opción múltiple" }
 *   404 → { error: "Tipo de pregunta no encontrado" }
 *   500 → { error }
 */
router.get('/:id', controller.getById);

/**
 * POST /api/question-types — Crear nuevo tipo de pregunta
 *
 * Body (JSON):
 *   {
 *     "name": "Opción múltiple"     → string, obligatorio, único
 *   }
 *
 * Respuestas:
 *   201 → { id: 1, name: "Opción múltiple" }   — tipo creado
 *   400 → { error: "El campo 'name' es requerido" } | { error: "Ya existe un tipo con ese nombre" }
 *   500 → { error }
 */
router.post('/', controller.create);

/**
 * PUT /api/question-types/:id — Actualizar un tipo de pregunta
 *
 * Params:
 *   :id → integer, ID del tipo
 *
 * Body (JSON):
 *   {
 *     "name": "Nuevo nombre"        → string
 *   }
 *
 * Respuestas:
 *   200 → { id: 1, name: "Nuevo nombre" }       — tipo actualizado
 *   400 → { error: "Ya existe un tipo con ese nombre" }
 *   404 → { error: "Tipo de pregunta no encontrado" }
 *   500 → { error }
 */
router.put('/:id', controller.update);

/**
 * DELETE /api/question-types/:id — Eliminar un tipo de pregunta
 *
 * Params:
 *   :id → integer, ID del tipo
 *
 * Respuestas:
 *   200 → { mensaje: "Tipo 'Opción múltiple' eliminado correctamente" }
 *   404 → { error: "Tipo de pregunta no encontrado" }
 *   500 → { error }
 */
router.delete('/:id', controller.remove);

module.exports = router;
