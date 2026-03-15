const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
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
  price_real_money: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  benefits_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
  },
}, {
  tableName: 'subscription_plans',
  timestamps: false,
});

module.exports = SubscriptionPlan;
