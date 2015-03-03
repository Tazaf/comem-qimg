var db = require('../lib/db'),
    Sequelize = require('sequelize');

module.exports = db.define('token', {
  apiId: {
    type: Sequelize.STRING
  },
  token: {
    type: Sequelize.STRING
  },
  name: {
    type: Sequelize.STRING
  },
  createdAt: {
    type: Sequelize.DATE
  }
});
