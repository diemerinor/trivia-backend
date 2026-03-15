const { Router } = require('express');
const controller = require('../controllers/categoryController');

const router = Router();

/**
 * GET /api/categories — Listar todas las categorías (activas e inactivas)
 *
 * Respuestas:
 *   200 → { total: 4, categories: [{ id, name, icon_url, is_active }] }  — ordenadas por id ASC
 *   500 → { error }
 */
router.get('/', controller.getAll);

/**
 * GET /api/categories/active — Listar solo las categorías activas
 *
 * Respuestas:
 *   200 → { total: 3, categories: [{ id, name, icon_url, is_active: true }] }  — ordenadas por nombre ASC
 *   500 → { error }
 */
router.get('/active', controller.getActive);

/**
 * POST /api/categories — Crear nueva categoría
 *
 * Body (JSON):
 *   {
 *     "name": "Ciencia",                → string, obligatorio, único
 *     "icon_url": "https://...",        → string, opcional
 *     "is_active": true                 → boolean, opcional, default: true
 *   }
 *
 * Respuestas:
 *   201 → { id, name, icon_url, is_active }  — categoría creada
 *   400 → { error: "El campo 'name' es requerido" } | { error: "Ya existe una categoría con ese nombre" }
 *   500 → { error }
 */
router.post('/', controller.create);

/**
 * PUT /api/categories/:id — Actualizar una categoría
 *
 * Params:
 *   :id → integer, ID de la categoría
 *
 * Body (JSON): misma estructura que POST, todos los campos opcionales.
 *
 * Respuestas:
 *   200 → { id, name, icon_url, is_active }  — categoría actualizada
 *   400 → { error: "Ya existe una categoría con ese nombre" }
 *   404 → { error: "Categoría no encontrada" }
 *   500 → { error }
 */
router.put('/:id', controller.update);

/**
 * DELETE /api/categories/:id — Eliminar una categoría
 *
 * Params:
 *   :id → integer, ID de la categoría
 *
 * Respuestas:
 *   200 → { mensaje: "Categoría 'Ciencia' eliminada correctamente" }
 *   404 → { error: "Categoría no encontrada" }
 *   500 → { error }
 */
router.delete('/:id', controller.remove);

module.exports = router;
