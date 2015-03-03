var _ = require('underscore'),
    crypto = require('crypto'),
    router = module.exports = require('express').Router(),
    Token = require('../lib/token'),
    uuid = require('node-uuid');

router.get('/api/tokens', function(req, res) {
  Token.findAll({ order: [['createdAt', 'DESC']] }).then(function(tokens) {
    res.send(_.map(tokens, serializeToken));
  }, function(err) {
    console.error(err);
    res.status(500).send('An unexpected error occurred.');
  });
});

router.post('/api/tokens', function(req, res) {
  Token.create({
    apiId: uuid.v4(),
    token: crypto.randomBytes(96).toString('base64'),
    name: req.body.name
  }).then(function(token) {
    res.send(serializeToken(token));
  }, function(err) {
    console.error(err);
    res.status(500).send('An unexpected error occurred.');
  });
});

function serializeToken(token) {
  var serialized = {
    id: token.apiId,
    token: token.token,
    createdAt: token.createdAt.toISOString()
  };

  if (token.name) {
    serialized.name = token.name;
  }

  return serialized;
}
