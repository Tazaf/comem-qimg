var _ = require('underscore'),
    auth = require('../lib/auth'),
    crypto = require('crypto'),
    router = module.exports = require('express').Router(),
    Token = require('../lib/token'),
    uuid = require('node-uuid'),
    utils = require('../lib/utils');

router.get('/api/tokens', auth.authenticate, auth.requireAdmin, function(req, res) {
  Token.findAll({ order: [['createdAt', 'DESC']] }).then(function(tokens) {
    res.send(_.map(tokens, serializeToken));
  }, _.partial(utils.sendUnexpectedError, res));
});

router.post('/api/tokens', auth.authenticate, auth.requireAdmin, function(req, res) {

  var lifetime = parseInt(req.body.lifetime);
  if (isNaN(lifetime) || lifetime <= 0) {
    lifetime = 60 * 60 * 24 * 30;
  }

  var now = new Date(),
      expiresAt = new Date(now.getTime() + lifetime * 1000);

  Token.create({
    apiId: uuid.v4(),
    token: crypto.randomBytes(128).toString('base64'),
    name: req.body.name,
    createdAt: now,
    expiresAt: expiresAt
  }).then(function(token) {
    res.send(serializeToken(token));
  }, _.partial(utils.sendUnexpectedError, res));
});

function serializeToken(token) {

  var serialized = {
    id: token.apiId,
    token: token.token,
    createdAt: token.createdAt.toISOString(),
    expiresAt: token.expiresAt.toISOString(),
    lifetime: Math.round((token.expiresAt.getTime() - token.createdAt.getTime()) / 1000)
  };

  if (token.name) {
    serialized.name = token.name;
  }

  return serialized;
}
