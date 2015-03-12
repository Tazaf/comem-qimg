var Token = require('./token');

var authorizationPattern = /^Bearer (.*)$/;

module.exports = {
  authenticateUser: function(req, res, next) {

    var authorization = req.get('Authorization');
    if (!authorization || !authorization.trim().length) {
      return res.status(401).send('No Authorization header sent.');
    }

    var match = authorizationPattern.exec(authorization);
    if (!match) {
      return res.status(401).send('The Authorization header does not contain a valid Bearer token.');
    }

    var token = match[1];

    Token.findOne({ where: { apiId: token } }).then(function(user) {
      if (user) {
        next();
      } else {
        res.status(401).send('The Bearer token sent in the Authorization header is not valid.');
      }
    }, function(err) {
      console.warn(err);
      res.status(500).send('An unexpected error occurred.');
    });
  }
};
