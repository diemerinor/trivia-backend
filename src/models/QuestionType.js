const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuestionType = sequelize.define('QuestionType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'question_types',
  timestamps: false,
});

module.exports = QuestionType;
