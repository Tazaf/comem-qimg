var db = require('../lib/db'),
    Sequelize = require('sequelize');

module.exports = db.define('image', {
  apiId: {
    type: Sequelize.STRING
  },
  imageData: {
    type: Sequelize.TEXT
  },
  imageSize: {
    type: Sequelize.INTEGER
  },
  owner: {
    type: Sequelize.STRING
  },
  createdAt: {
    type: Sequelize.DATE
  }
});
