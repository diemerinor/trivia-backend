const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionAnswer = sequelize.define('SessionAnswer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  tableName: 'session_answers',
  timestamps: false,
});

module.exports = SessionAnswer;
