const { Sequelize } = require('sequelize');

/**
 * Esta lógica permite que el código funcione en dos lugares:
 * 1. En Render: Usará la variable process.env.DATABASE_URL.
 * 2. En tu PC: Construirá la URL usando tus variables del .env (DB_USER, DB_PASSWORD, etc.)
 */
const databaseUrl = process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false, // Evita llenar la consola de logs innecesarios
  dialectOptions: {
    // EL SSL SOLO ES OBLIGATORIO EN RENDER (PRODUCCIÓN)
    // Esta línea detecta si estamos en Render; si no, desactiva el SSL para que funcione en tu Docker local.
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

module.exports = sequelize;