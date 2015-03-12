var _ = require('underscore'),
    auth = require('../lib/auth'),
    config = require('../lib/config'),
    Image = require('../lib/image'),
    router = module.exports = require('express').Router(),
    Token = require('../lib/token'),
    uuid = require('node-uuid'),
    utils = require('../lib/utils');

router.get('/api/images', auth.authenticate, function(req, res) {

  var findOptions = {
    order: [['createdAt', 'DESC']]
  };

  if (!req.authToken.admin) {
    findOptions.where = { tokenId: req.authToken.id };
  } else {
    findOptions.include = [ Token ];
  }

  Image.findAll(findOptions).then(function(images) {
    res.send(_.map(images, function(image) {
      return serializeImage(image, req);
    }));
  }, _.partial(utils.sendUnexpectedError, res));
});

router.post('/api/images', auth.authenticate, auth.requireUser, function(req, res) {

  var data = {
    apiId: uuid.v4(),
    createdAt: new Date(),
    tokenId: req.authToken.id
  };

  if (req.is('application/json')) {
    if (!req.body.data) {
      return utils.sendError(422, 'The "data" property must contain the base64-encoded image data.', res);
    }

    data.imageData = req.body.data;
    data.imageSize = Buffer.byteLength(data.imageData, 'base64');
  } else if (req.is('multipart/form-data')) {
    if (!req.files || !req.files.image) {
      return utils.sendError(422, 'The "image" field is not set.', res);
    } else if (req.files.image.truncated) {
      return utils.sendError(413, 'The uploaded image is too large (the limit is 2MB).', res);
    }

    data.imageData = req.files.image.buffer.toString('base64');
    data.imageSize = Buffer.byteLength(data.imageData, 'base64');
  } else {
    return utils.sendError(415, 'The request must have content type application/json or multipart/form-data.', res);
  }

  Image.create(data).then(function(image) {
    purgeImages(req.authToken).then(function() {
      res.send(serializeImage(image, req));
    }, _.partial(utils.sendUnexpectedError, res));
  }, _.partial(utils.sendUnexpectedError, res));
});

router.delete('/api/images/:id', auth.authenticate, function(req, res) {

  var where = {
    apiId: req.params.id
  };

  if (!req.authToken.admin) {
    where.tokenId = req.authToken.id;
  }

  Image.find({ where: where }).then(function(image) {
    if (image) {
      image.destroy().then(function() {
        res.sendStatus(204);
      }, _.partial(utils.sendUnexpectedError, res));
    } else {
      utils.sendError(404, 'No image found with ID "' + req.params.id + '".', res);
    }
  }, _.partial(utils.sendUnexpectedError, res));
});

router.get('/images/:id.png', function(req, res) {
  Image.find({ where: { apiId: req.params.id } }).then(function(image) {
    if (image) {
      res.set('Content-Type', 'image/png');
      res.send(new Buffer(image.imageData, 'base64'));
    } else {
      utils.sendError(404, 'No image found with ID "' + req.params.id + '".', res);
    }
  }, _.partial(utils.sendUnexpectedError, res));
});

function purgeImages(authToken) {
  return Image.findOne({ tokenId: authToken.id, order: '"createdAt" DESC', offset: 10 }).then(function(image) {
    if (image) {
      return Image.destroy({
        where: {
          tokenId: authToken.id,
          createdAt: {
            $lte: image.createdAt
          }
        }
      });
    }
  });
}

function serializeImage(image, req) {

  var serialized = {
    id: image.apiId,
    size: image.imageSize,
    url: config.appUrl + '/images/' + image.apiId + '.png',
    createdAt: image.createdAt.toISOString()
  };

  if (req.authToken.admin) {
    serialized.tokenId = image.token.apiId;
  }

  return serialized;
}
