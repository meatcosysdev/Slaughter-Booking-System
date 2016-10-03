var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');

// MODELS
var CONFIG = require('./models/config').CONFIG;

// -------------------------------------------- BOOKINGS --------------------------------------------
router.get('/api/bookings', function (req, res, next) {
    var results = [];

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        var query = client.query("SELECT booking_trucks.*, " +
            "(SELECT COUNT(*) FROM booking_loads WHERE booking_trucks.id = booking_loads.booking_truck_id) AS LOADS_NUMBER " +
            "FROM booking_trucks " +
            "ORDER BY booking_trucks.id ASC");

        query.on('row', function (row) {
            //storage.add();
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });
});

router.post('/api/bookings/', function (req, res) {
    var data = req.body;

    if (!data.id) {
        return res.status(500).send(json({success: false, data: "Id is required!"}));
    }

    // Get a Postgres client from the connection pool
    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).send(json({success: false, data: err}));
        }

        client.query("UPDATE booking_trucks SET preferred_date_from=($1), preferred_date_until=($2) WHERE id=($3)", [data.preferred_date_from, data.preferred_date_until, data.id]);

        // Producer was contacted
        if (data.contact_status) {
            client.query("UPDATE booking_trucks SET contact_status=($1) WHERE id=($2)", [data.contact_status, data.id]);
        }

        return res.status(200).send({success: true});
    });
});

// -------------------------------------------- STANDBY - BOOKINGS --------------------------------------------
router.get('/api/booking_standby_trucks', function (req, res, next) {
    var results = [];

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        var query = client.query("SELECT booking_standby_trucks ORDER BY id ASC");

        query.on('row', function (row) {
            //storage.add();
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });
});

router.get('/api/booking_standby_trucks/:id', function (req, res, next) {
    var results = {};
    var id = req.params.id;

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        var query = client.query("SELECT * FROM booking_standby_trucks WHERE id=($1) LIMIT 1", [id]);
        query.on('row', function (row) {
            results = row;
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });
    });
});

router.post('/api/booking_standby_trucks/', function (req, res) {
    var data = req.body;

    if (!data.id) {
        return res.status(500).send(json({success: false, data: "Id is required!"}));
    }

    // Get a Postgres client from the connection pool
    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).send(json({success: false, data: err}));
        }

        client.query("UPDATE booking_standby_trucks " +
            "SET preferred_date_from=($1), preferred_date_until=($2), lead_days=($3), truck_size=($4) WHERE id=($5)",
            [data.preferred_date_from, data.preferred_date_until, data.lead_days, data.truck_size, data.id]);

        return res.status(200).send({success: true});
    });
});

router.delete('/api/booking_standby_trucks/:id', function (req, res) {
    var results = [];
    var id = req.params.id;

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Delete Data
        client.query("DELETE FROM booking_standby_trucks WHERE id=($1)", [id]);

        return res.status(200).send({success: true});
    });
});

// -------------------------------------------- BOOKING_LOADS --------------------------------------------
router.get('/api/booking_loads', function (req, res, next) {
    var results = [];

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        var query = client.query("SELECT *," +
            "(SELECT producers.id_no FROM producers WHERE booking_loads.producer_no LIKE producers.legal_name) AS id_no, " +
            "(SELECT producers.id FROM producers WHERE booking_loads.producer_no LIKE producers.legal_name) AS producer_id " +
            "FROM booking_loads");

        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });
});

router.post('/api/bookings_loads/', function (req, res) {
    var data = req.body;

    if (!data.id) {
        return res.status(500).send(json({success: false, data: "Id is required!"}));
    }

    // Get a Postgres client from the connection pool
    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).send(json({success: false, data: err}));
        }

        client.query(
            "UPDATE booking_loads SET quantity=($1), current_status=($2) WHERE id=($3)",
            [data.quantity, data.current_status, data.id]
        );


        if (data.current_status == 'cancelled') {
            client.query(
                "INSERT INTO booking_load_cancellations(booking_load_id, reason, penalty_days, current_status) " +
                "values($1, $2, $3, $4)", [data.id, data.reason, CONFIG.cancel_penalty_days, data.current_status]);
        }

        return res.status(200).send({success: true});
    });

});

// -------------------------------------------- PRODUCERS --------------------------------------------
router.get('/api/producers', function (req, res, next) {
    var results = [];

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        var query = client.query("SELECT * producers");

        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });
});

router.get('/api/producers/:id', function (req, res, next) {
    var results = {};
    var id = req.params.id;

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        var query = client.query("SELECT * FROM producers WHERE id=($1) LIMIT 1", [id]);
        query.on('row', function (row) {
            results = row;
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });
    });
});

router.post('/api/producers/', function (req, res) {
    var data = req.body;

    if (!data.id) {
        return res.status(500).send(json({success: false, data: "Id is required!"}));
    }

    // Get a Postgres client from the connection pool
    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).send(json({success: false, data: err}));
        }

        console.log(data);
        return res.status(200).send({success: true});

        // TODO: SAVE TO DB
    });

});
// -------------------------------------------- FACILITIES --------------------------------------------
router.get('/api/facilities', function (req, res, next) {
    var results = [];

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        var query = client.query("SELECT * FROM facilities");

        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });
});

// -------------------------------------------- SUPPLY STREAMS --------------------------------------------
router.get('/api/supply_streams', function (req, res, next) {
    var results = [];

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        var query = client.query("SELECT * FROM supply_streams");

        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });
});


module.exports = router;


