var _ = require('underscore'),
    router = module.exports = require('express').Router(),
    Image = require('../lib/image'),
    uuid = require('node-uuid');

router.get('/api/images', function(req, res) {
  Image.findAll({ order: [['createdAt', 'DESC']] }).then(function(images) {
    res.send(_.map(images, function(image) {
      return {
        id: image.apiId,
        size: image.imageSize,
        createdAt: image.createdAt.toISOString()
      };
    }));
  }, function(err) {
    console.error(err);
    res.status(500).send('An unexpected error occurred.');
  });
});

router.post('/api/images', function(req, res) {

  var data = { apiId: uuid.v4() };

  if (req.is('application/json')) {
    if (!req.body.data) {
      return res.status(422).send('The "data" property should contain the base64-encoded image data.');
    }
    data.imageData = req.body.data;
    data.imageSize = Buffer.byteLength(data.imageData, 'base64');
  } else if (req.is('multipart/form-data')) {
    if (!req.files || !req.files.image) {
      return res.status(422).send('The "image" field is not set.');
    }
    data.imageData = req.files.image.buffer.toString('base64');
    data.imageSize = Buffer.byteLength(data.imageData, 'base64');
  } else {
    return res.status(415).send('The request must have content type application/json or multipart/form-data.');
  }

  Image.create(data).then(function(image) {
    res.send({ id: image.apiId });
  }, function(err) {
    console.error(err);
    res.status(500).send('An unexpected error occurred.');
  });
});

router.get('/images/:id.png', function(req, res) {
  Image.find({ where: { apiId: req.params.id } }).then(function(image) {
    if (image) {
      res.set('Content-Type', 'image/png');
      res.send(new Buffer(image.imageData, 'base64'));
    } else {
      res.status(404).send('No image found.');
    }
  });
});
