var PORT = process.argv[2] && parseInt(process.argv[2], 10) || 4001;
var STATIC_DIR = __dirname + '/../app';

var open = require('open');
var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var routes = require('./routes');


// USAGES
app.use(express.static(STATIC_DIR));
app.use(bodyParser.json({limit: '50mb'}));
app.use('/', routes);

// ERRORS
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// START
app.listen(PORT, function () {
    open('http://localhost:' + PORT + '/');

    // INIT DB
    var db = require('./models/database').DB;
    db.init();
});

try {
    process.on('SIGINT', function () {
        process.exit(0);
    });
} catch (e) {
}


