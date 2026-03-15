const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Skin = sequelize.define('Skin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  thumbnail_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  unlock_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'skins',
  timestamps: false,
});

module.exports = Skin;
