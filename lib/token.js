var db = require('./db'),
    sequelize = require('sequelize');

module.exports = db.define('token', {
  apiId: {
    type: sequelize.STRING(36),
    unique: true,
    allowNull: false
  },
  token: {
    type: sequelize.STRING(255),
    unique: true,
    allowNull: false
  },
  name: {
    type: sequelize.STRING(50)
  },
  createdAt: {
    type: sequelize.DATE,
    allowNull: false
  },
  expiresAt: {
    type: sequelize.DATE,
    allowNull: false
  }
});
