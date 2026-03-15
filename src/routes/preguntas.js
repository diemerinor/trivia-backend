const { Router } = require('express');
const router = Router();

// Datos temporales de prueba (luego se reemplazarán por consultas a PostgreSQL)
const preguntasDePrueba = [
  {
    id: 1,
    categoria: 'Ciencia',
    pregunta: '¿Cuál es el planeta más grande del sistema solar?',
    opciones: ['Marte', 'Júpiter', 'Saturno', 'Neptuno'],
    respuestaCorrecta: 1, // índice de la opción correcta
  },
  {
    id: 2,
    categoria: 'Historia',
    pregunta: '¿En qué año llegó el hombre a la Luna?',
    opciones: ['1965', '1969', '1972', '1980'],
    respuestaCorrecta: 1,
  },
  {
    id: 3,
    categoria: 'Geografía',
    pregunta: '¿Cuál es el río más largo del mundo?',
    opciones: ['Nilo', 'Amazonas', 'Yangtsé', 'Misisipi'],
    respuestaCorrecta: 1,
  },
];

// GET /api/preguntas  —  Devuelve preguntas de trivia
router.get('/', (_req, res) => {
  res.json({
    total: preguntasDePrueba.length,
    preguntas: preguntasDePrueba,
  });
});

module.exports = router;
