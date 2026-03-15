const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSkin = sequelize.define('UserSkin', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  skin_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  acquired_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_skins',
  timestamps: false,
});

module.exports = UserSkin;
