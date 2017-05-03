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

  var lifetime = req.body.lifetime;
  if (lifetime === undefined) {
    lifetime = 60 * 60 * 24 * 30;
  } else if (!isInteger(lifetime)) {
    return utils.sendError(422, 'The "lifetime" property must be an integer.', res);
  } else if (lifetime <= 0) {
    return utils.sendError(422, 'The "lifetime" property must be greater than zero.', res);
  } else if (lifetime > 31536000) {
    return utils.sendError(422, 'The "lifetime" property must be less than or equal to 31,536,000 (365 days).', res);
  }

  if (req.body.name !== undefined && typeof(req.body.name) != 'string') {
    return utils.sendError(422, 'The "name" property must be a string.', res);
  } else if (req.body.name && req.body.name.length > 50) {
    return utils.sendError(422, 'The "name" property must not be longer than 50 characters.', res);
  }

  var now = new Date(),
      expiresAt = new Date(now.getTime() + parseInt(lifetime, 10) * 1000);

  Token.create({
    apiId: uuid.v4(),
    token: crypto.randomBytes(128).toString('base64'),
    name: req.body.name,
    createdAt: now,
    expiresAt: expiresAt
  }).then(function(token) {
    res.status(201).send(serializeToken(token));
  }, _.partial(utils.sendUnexpectedError, res));
});

router.delete('/api/tokens/:id', auth.authenticate, auth.requireAdmin, function(req, res) {
  Token.find({ where: { apiId: req.params.id } }).then(function(token) {
    if (token) {
      token.destroy().then(function() {
        res.sendStatus(204);
      }, _.partial(utils.sendUnexpectedError, res));
    } else {
      utils.sendError(404, 'No token found with ID "' + req.params.id + '".', res);
    }
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

function isInteger(n) {
  return !isNaN(parseInt(n, 10));
}
