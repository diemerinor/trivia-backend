const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  difficulty_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  prompt_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  media_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'questions',
  timestamps: false,
});

module.exports = Question;
