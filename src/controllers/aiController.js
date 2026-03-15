const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Mapa de tipos de pregunta ────────────────────
const TYPE_INSTRUCTIONS = {
  1: {
    name: 'Selección Múltiple',
    rules: `Genera una pregunta con EXACTAMENTE 4 opciones. Solo UNA opción debe ser correcta (is_correct: true).
    Usa "content_left" para el texto de cada opción. "content_right" debe ser null.`,
  },
  2: {
    name: 'Verdadero o Falso',
    rules: `Genera una afirmación que pueda ser verdadera o falsa. Debe tener EXACTAMENTE 2 opciones:
    - { "content_left": "Verdadero", "content_right": null, "is_correct": true/false }
    - { "content_left": "Falso", "content_right": null, "is_correct": true/false }
    Solo una debe ser correcta.`,
  },
  3: {
    name: 'Términos Pareados',
    rules: `Genera una pregunta de emparejar términos. Cada opción debe usar AMBOS campos:
    - "content_left": el término o concepto.
    - "content_right": su definición, pareja o equivalencia correcta.
    - "is_correct" debe ser true para TODOS (el frontend mezclará las parejas).
    Genera entre 3 y 5 pares.`,
  },
  4: {
    name: 'Identificación Visual',
    rules: `Genera una pregunta que pida identificar algo a partir de una descripción visual (como si hubiera una imagen).
    El "prompt_text" debe incluir una descripción clara de lo que se muestra (ej: "¿Qué animal se muestra en la imagen?" o "¿A qué país pertenece esta bandera?").
    Genera EXACTAMENTE 4 opciones. Solo UNA es correcta. Usa "content_left" para el texto. "content_right" debe ser null.`,
  },
  5: {
    name: 'Ordenamiento',
    rules: `Genera una pregunta donde el usuario debe ordenar elementos en la secuencia correcta.
    El "prompt_text" debe indicar el criterio de orden (ej: "Ordena de menor a mayor", "Ordena cronológicamente").
    Cada opción debe tener:
    - "content_left": el elemento a ordenar.
    - "content_right": su posición correcta como string ("1", "2", "3", "4").
    - "is_correct": true para TODOS (el frontend valida el orden).
    Genera entre 3 y 5 elementos.`,
  },
  6: {
    name: 'Eliminación (Odd One Out)',
    rules: `Genera una pregunta donde 3 elementos pertenecen a un grupo y 1 NO pertenece.
    El "prompt_text" debe preguntar cuál no encaja (ej: "¿Cuál de estos NO es un mamífero?").
    Genera EXACTAMENTE 4 opciones. Solo UNA es correcta (la que no pertenece al grupo, is_correct: true).
    Usa "content_left" para el texto. "content_right" debe ser null.`,
  },
  7: {
    name: 'Completar Frase',
    rules: `Genera una frase incompleta donde el usuario debe elegir la palabra o palabras que faltan.
    El "prompt_text" DEBE contener "____" (cuatro guiones bajos) en el lugar donde va la respuesta (ej: "El agua hierve a ____ grados Celsius").
    Genera EXACTAMENTE 4 opciones. Solo UNA es correcta.
    Usa "content_left" para el texto. "content_right" debe ser null.`,
  },
};

// ─── Mapa de niveles de dificultad ────────────────
const DIFFICULTY_LABELS = {
  1: 'Muy fácil — para niños o principiantes, conocimiento general básico.',
  2: 'Fácil — conocimiento general intermedio, la mayoría de adultos lo sabría.',
  3: 'Intermedio — requiere conocimiento específico del tema.',
  4: 'Difícil — requiere conocimiento profundo o experto del tema.',
};

// ─── Limpiar respuesta de ChatGPT ─────────────────
function cleanAIResponse(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  return cleaned.trim();
}

// ─── Generar pregunta con ChatGPT ─────────────────
const generateQuestion = async (req, res) => {
  try {
    const { type_id, level, category_name } = req.body;

    // Validaciones
    if (!type_id || !level) {
      return res.status(400).json({
        error: 'Campos requeridos: type_id (1-7), level (1-4)',
      });
    }

    const typeConfig = TYPE_INSTRUCTIONS[type_id];
    if (!typeConfig) {
      return res.status(400).json({
        error: `type_id inválido. Valores permitidos: 1-7`,
        tipos: Object.entries(TYPE_INSTRUCTIONS).map(([id, t]) => ({ id: Number(id), name: t.name })),
      });
    }

    const difficultyLabel = DIFFICULTY_LABELS[level];
    if (!difficultyLabel) {
      return res.status(400).json({
        error: 'level inválido. Valores permitidos: 1 (muy fácil), 2 (fácil), 3 (intermedio), 4 (difícil)',
      });
    }

    // Construir prompt maestro
    const categoryInstruction = category_name
      ? `La pregunta DEBE ser de la categoría: "${category_name}".`
      : 'Elige una categoría interesante de conocimiento general.';

    // Semilla aleatoria para forzar variedad en cada llamada
    const randomSeed = Math.floor(Math.random() * 100000);
    const variationHints = [
      'Elige un subtema poco común dentro de la categoría.',
      'Enfócate en un dato curioso o sorprendente del tema.',
      'Elige un ángulo histórico o de origen del tema.',
      'Enfócate en un aspecto práctico o aplicado del tema.',
      'Elige un ejemplo concreto o caso real del tema.',
      'Elige un personaje, lugar o evento específico relacionado al tema.',
      'Enfócate en una comparación o diferencia dentro del tema.',
      'Aborda el tema desde una perspectiva científica o técnica.',
    ];
    const variationHint = variationHints[randomSeed % variationHints.length];

    const prompt = `
Eres un generador de preguntas para un juego de trivia. Genera UNA pregunta siguiendo estas reglas estrictas:

TIPO DE PREGUNTA: ${typeConfig.name} (type_id: ${type_id})
${typeConfig.rules}

NIVEL DE DIFICULTAD: ${level}
${difficultyLabel}

CATEGORÍA: ${categoryInstruction}

VARIACIÓN REQUERIDA (semilla: ${randomSeed}): ${variationHint}
NO repitas preguntas usadas anteriormente. Sé creativo y varía el enfoque, el subtema y los ejemplos.

REGLAS OBLIGATORIAS:
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin explicaciones.
- El JSON debe tener esta estructura exacta:
{
  "prompt_text": "Texto de la pregunta",
  "options": [
    { "content_left": "texto", "content_right": null, "is_correct": false },
    { "content_left": "texto", "content_right": null, "is_correct": true }
  ]
}
- No incluyas backticks, bloques de código ni la palabra "json".
- Las opciones deben estar en orden aleatorio (la correcta no siempre primero).
- El idioma debe ser ESPAÑOL.
- La pregunta debe ser educativa, precisa y verificable.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Eres un generador de preguntas de trivia. Responde SOLO con JSON válido, sin texto extra.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 1.1,
      max_tokens: 500,
    });

    const rawText = completion.choices[0].message.content;

    // Limpiar y parsear la respuesta
    const cleanedText = cleanAIResponse(rawText);

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      return res.status(502).json({
        error: 'La IA devolvió un formato inválido. Intenta de nuevo.',
        raw_response: rawText,
      });
    }

    // Validar estructura mínima
    if (!parsed.prompt_text || !Array.isArray(parsed.options) || parsed.options.length < 2) {
      return res.status(502).json({
        error: 'La IA devolvió una estructura incompleta. Intenta de nuevo.',
        parsed,
      });
    }

    // Respuesta exitosa
    return res.status(201).json({
      mensaje: 'Pregunta generada exitosamente',
      type_id,
      type_name: typeConfig.name,
      difficulty_level: level,
      category_name: category_name || 'General',
      question: {
        prompt_text: parsed.prompt_text,
        options: parsed.options.map((opt) => ({
          content_left: opt.content_left || null,
          content_right: opt.content_right || null,
          is_correct: Boolean(opt.is_correct),
        })),
      },
    });
  } catch (error) {
    console.error('Error al generar pregunta con ChatGPT:', error);

    if (error.status === 401) {
      return res.status(500).json({ error: 'OPENAI_API_KEY no configurada o inválida' });
    }

    return res.status(500).json({ error: 'Error interno al contactar la IA' });
  }
};

module.exports = { generateQuestion };
