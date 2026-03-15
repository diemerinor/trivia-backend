const sequelize = require('../config/database');

// ─── Importar modelos ──────────────────────────────
const User = require('./User');
const Category = require('./Category');
const QuestionType = require('./QuestionType');
const Question = require('./Question');
const QuestionOption = require('./QuestionOption');
const GameSession = require('./GameSession');
const SessionAnswer = require('./SessionAnswer');
const Skin = require('./Skin');
const UserSkin = require('./UserSkin');
const Transaction = require('./Transaction');
const SubscriptionPlan = require('./SubscriptionPlan');

// ─── Relaciones ────────────────────────────────────

// User ↔ SubscriptionPlan
SubscriptionPlan.hasMany(User, { foreignKey: 'plan_id' });
User.belongsTo(SubscriptionPlan, { foreignKey: 'plan_id' });

// User ↔ Skin (skin activa)
Skin.hasMany(User, { foreignKey: 'active_skin_id', as: 'ActiveUsers' });
User.belongsTo(Skin, { foreignKey: 'active_skin_id', as: 'ActiveSkin' });

// User ↔ Skin (muchos a muchos a través de user_skins)
User.belongsToMany(Skin, { through: UserSkin, foreignKey: 'user_id', otherKey: 'skin_id', as: 'OwnedSkins' });
Skin.belongsToMany(User, { through: UserSkin, foreignKey: 'skin_id', otherKey: 'user_id', as: 'Owners' });

// Category ↔ Question
Category.hasMany(Question, { foreignKey: 'category_id' });
Question.belongsTo(Category, { foreignKey: 'category_id' });

// QuestionType ↔ Question
QuestionType.hasMany(Question, { foreignKey: 'type_id' });
Question.belongsTo(QuestionType, { foreignKey: 'type_id' });

// Question ↔ QuestionOption
Question.hasMany(QuestionOption, { foreignKey: 'question_id', as: 'Options' });
QuestionOption.belongsTo(Question, { foreignKey: 'question_id' });

// User ↔ GameSession
User.hasMany(GameSession, { foreignKey: 'user_id' });
GameSession.belongsTo(User, { foreignKey: 'user_id' });

// GameSession ↔ SessionAnswer
GameSession.hasMany(SessionAnswer, { foreignKey: 'session_id', as: 'Answers' });
SessionAnswer.belongsTo(GameSession, { foreignKey: 'session_id' });

// Question ↔ SessionAnswer
Question.hasMany(SessionAnswer, { foreignKey: 'question_id' });
SessionAnswer.belongsTo(Question, { foreignKey: 'question_id' });

// User ↔ Transaction
User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

// ─── Exportar todo ─────────────────────────────────
module.exports = {
  sequelize,
  User,
  Category,
  QuestionType,
  Question,
  QuestionOption,
  GameSession,
  SessionAnswer,
  Skin,
  UserSkin,
  Transaction,
  SubscriptionPlan,
};
