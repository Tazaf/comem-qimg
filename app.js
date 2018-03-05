var bodyParser = require('body-parser'),
    cors = require('cors'),
    express = require('express'),
    logger = require('morgan'),
    multer = require('multer'),
    path = require('path');

var routes = require('./routes/index'),
    imageRoutes = require('./routes/images'),
    tokenRoutes = require('./routes/tokens');

var app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// file upload configuration
app.use(multer({
  inMemory: true,
  limits: {
    fileSize: 2097152, // 2 MB
    files: 1
  }
}));

app.use('/', routes);
app.use('/', imageRoutes);
app.use('/', tokenRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
