var db = require('./db'),
    sequelize = require('sequelize'),
    Token = require('./token');

var Image = db.define('image', {
  apiId: {
    type: sequelize.STRING(36),
    unique: true,
    allowNull: false
  },
  imageData: {
    type: sequelize.TEXT,
    allowNull: false
  },
  imageSize: {
    type: sequelize.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: sequelize.DATE,
    allowNull: false
  },
  tokenId: {
    type: sequelize.INTEGER,
    allowNull: false,
    references: 'tokens',
    referencesKey: 'id',
    onDelete: 'CASCADE'
  }
});

Image.belongsTo(Token);

module.exports = Image;
