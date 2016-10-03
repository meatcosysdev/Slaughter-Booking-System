var pg = require('pg');
var path = require('path');
var CONFIG = require('./config').CONFIG;

var database =  {
    init: function() {
        var client = new pg.Client(CONFIG.connectionString);
        client.connect();
    }
};

exports.DB = database;