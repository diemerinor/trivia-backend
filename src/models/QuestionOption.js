const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuestionOption = sequelize.define('QuestionOption', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content_left: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  content_right: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'question_options',
  timestamps: false,
});

module.exports = QuestionOption;
