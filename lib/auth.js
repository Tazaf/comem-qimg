var config = require('./config'),
    Token = require('./token'),
    utils = require('./utils');

var authorizationPattern = /^Bearer (.+)$/;

module.exports = {
  authenticate: function(req, res, next) {

    var authorization = req.get('Authorization');
    if (!authorization || !authorization.trim().length) {
      return utils.sendError(401, 'No Authorization header sent.', res);
    }

    var match = authorizationPattern.exec(authorization);
    if (!match) {
      return utils.sendError(401, 'The Authorization header does not contain a valid Bearer token.', res);
    }

    var token = match[1];
    if (token == config.adminToken) {
      req.authToken = {
        admin: true
      };

      return next();
    }

    Token.findOne({ where: { token: token } }).then(function(authToken) {
      if (authToken && authToken.expiresAt.getTime() > new Date().getTime()) {
        req.authToken = authToken;
        next();
      } else {
        utils.sendError(401, 'The Bearer token sent in the Authorization header is not valid.', res);
      }
    }, function(err) {
      console.warn(err);
      utils.sendError(500, 'An unexpected error occurred.', res);
    });
  },

  requireAdmin: function(req, res, next) {
    if (!req.authToken || !req.authToken.admin) {
      return utils.sendError(403, 'You must be an administrator to perform this action.', res);
    }

    next();
  },

  requireUser: function(req, res, next) {
    if (!req.authToken || req.authToken.admin) {
      return utils.sendError(403, 'Administrators cannot perform this action.', res);
    }

    next();
  }
};
