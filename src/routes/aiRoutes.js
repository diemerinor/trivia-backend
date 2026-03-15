const { Router } = require('express');
const controller = require('../controllers/aiController');

const router = Router();

/**
 * POST /api/ai/generate — Generar una pregunta de trivia usando ChatGPT (OpenAI)
 *
 * Body (JSON):
 *   {
 *     "type_id": 1,                    → integer, obligatorio (1-7)
 *     "level": 2,                      → integer, obligatorio (1-4)
 *     "category_name": "Ciencia"       → string, opcional (si no se envía, la IA elige una)
 *   }
 *
 * Tipos de pregunta (type_id):
 *   1 → Selección Múltiple (4 opciones, 1 correcta)
 *   2 → Verdadero o Falso (2 opciones)
 *   3 → Términos Pareados (content_left ↔ content_right, 3-5 pares)
 *   4 → Identificación Visual (4 opciones, pregunta descriptiva de imagen)
 *   5 → Ordenamiento (content_right = posición "1","2","3"..., 3-5 elementos)
 *   6 → Eliminación / Odd One Out (4 opciones, 1 no pertenece al grupo)
 *   7 → Completar Frase (prompt_text contiene "____", 4 opciones)
 *
 * Niveles de dificultad (level):
 *   1 → Muy fácil (niños/principiantes)
 *   2 → Fácil (conocimiento general)
 *   3 → Intermedio (conocimiento específico)
 *   4 → Difícil (conocimiento experto)
 *
 * Respuestas:
 *   201 → {
 *           mensaje, type_id, type_name, difficulty_level, category_name,
 *           question: {
 *             prompt_text: "¿Cuál es...?",
 *             options: [{ content_left, content_right, is_correct }]
 *           }
 *         }
 *   400 → { error: "Campos requeridos: type_id (1-7), level (1-4)" }
 *   400 → { error: "type_id inválido...", tipos: [...] }
 *   400 → { error: "level inválido..." }
 *   502 → { error: "La IA devolvió un formato inválido...", raw_response }
 *   500 → { error: "OPENAI_API_KEY no configurada o inválida" }
 *   500 → { error: "Error interno al contactar la IA" }
 */
router.post('/generate', controller.generateQuestion);

module.exports = router;
