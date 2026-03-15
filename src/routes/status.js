const { Router } = require('express');
const router = Router();

// GET /api/status  —  Health-check del servidor
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    mensaje: 'El servidor de Trivia está corriendo 🚀',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
