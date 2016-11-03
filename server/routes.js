var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');

// MODELS
var CONFIG = require('./models/config').CONFIG;

// -------------------------------------------- BOOKINGS --------------------------------------------
router.post(CONFIG.serverUrl + '/api/bookings-list', function (req, res, next) {
    var results = [];
    var data = req.body;

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }


        var filters = data['filters'];
        var where_clause = [];
        var values = [];

        if (filters && Object.keys(filters).length > 0) {
            var i = 1;
            if (filters.producer_number) {
                where_clause.push('producers.producer_no = ($' + i + ')');
                i++;
                values.push(filters.producer_number);
            }

            if (filters.producer_name) {
                where_clause.push('LOWER(producers.legal_name) = LOWER(($' + i + '))');
                i++;
                values.push(filters.producer_name);
            }

            if (filters.load_number) {
                where_clause.push('booking_loads.id = ($' + i + ')');
                i++;
                values.push(filters.load_number);
            }

            if (filters.booked_date) {
                where_clause.push('booking_trucks.booking_date = ($' + i + ')');
                i++;
                values.push(filters.booked_date);
            }

            if (filters.selected_facility) {
                where_clause.push('booking_trucks.facility_id = ($' + i + ')');
                i++;
                values.push(filters.selected_facility);
            }

            if (filters.selected_stream) {
                where_clause.push('booking_trucks.supply_stream_id = ($' + i + ')');
                i++;
                values.push(filters.selected_stream);
            }
        }

        var query = client.query("SELECT booking_trucks.*, COUNT(booking_trucks.*) AS LOADS_NUMBER"
            + " FROM booking_trucks"
            + " JOIN booking_loads ON booking_trucks.id = booking_loads.booking_truck_id"
            + " JOIN producers ON booking_loads.producer_no = producers.producer_no"
            + ( where_clause.length ? ' WHERE ' + where_clause.join(' AND ') : '' )
            + " GROUP BY booking_trucks.id", values);

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

router.post(CONFIG.serverUrl + '/api/bookings/', function (req, res) {
    var data = req.body;

    // Get a Postgres client from the connection pool
    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).send(json({success: false, data: err}));
        }

        if (data.id) {
            client.query("UPDATE booking_trucks "
                + " SET preferred_date_from=($1), preferred_date_until=($2), current_status=($3) "
                + " WHERE id=($4)",
                [data.preferred_date_from, data.preferred_date_until, data.current_status, data.id]);
        } else {
            client.query("INSERT INTO booking_trucks"
                + " (preferred_date_from, preferred_date_until, run_date, booking_date, delivery_date,"
                + " agreement_type_id, supply_stream_id, facility_id, merit_point, truck_size, current_status)"
                + " VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
                [
                    data.preferred_date_from,
                    data.preferred_date_until,
                    data.run_date,
                    data.booking_date,
                    data.delivery_date,
                    data.agreement_type_id,
                    data.supply_stream_id,
                    data.facility_id,
                    data.merit_point,
                    data.truck_size,
                    data.current_status
                ]);
        }

        // Producer was contacted
        if (data.contact_status) {
            client.query("UPDATE booking_trucks SET contact_status=($1) WHERE id=($2)", [data.contact_status, data.id]);
        }


        var booking;
        var query = client.query('SELECT * FROM booking_trucks ORDER BY id DESC LIMIT 1');
        query.on('row', function (row) {
            booking = row;
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(booking);
        });
    });
});

// -------------------------------------------- STANDBY - BOOKINGS --------------------------------------------
router.get(CONFIG.serverUrl + '/api/booking_standby_trucks', function (req, res, next) {
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

router.get(CONFIG.serverUrl + '/api/booking_standby_trucks/:id', function (req, res, next) {
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

router.post(CONFIG.serverUrl + '/api/booking_standby_trucks/', function (req, res) {
    var data = req.body;

    // Get a Postgres client from the connection pool
    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).send(json({success: false, data: err}));
        }

        if (data.id) {
            client.query("UPDATE booking_standby_trucks " +
                "SET preferred_date_from=($1), preferred_date_until=($2), lead_days=($3), truck_size=($4) WHERE id=($5)",
                [data.preferred_date_from, data.preferred_date_until, data.lead_days, data.truck_size, data.id]);
        } else {
            client.query("INSERT INTO booking_standby_trucks"
                + " (booking_truck_id, supply_stream_id, preferred_date_from, preferred_date_until, "
                + " lead_days, truck_size, merit_point, current_status)"
                + " VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [
                    data.booking_truck_id,
                    data.supply_stream_id,
                    data.preferred_date_from,
                    data.preferred_date_until,
                    data.lead_days,
                    data.truck_size,
                    data.merit_point,
                    data.current_status
                ]);
        }

        var sb;
        var query = client.query('SELECT * FROM booking_standby_trucks ORDER BY id DESC LIMIT 1');
        query.on('row', function (row) {
            sb = row;
        });

        query.on('end', function () {
            done();
            return res.json(sb);
        });
    });
});

router.delete(CONFIG.serverUrl + '/api/booking_standby_trucks/:id', function (req, res) {
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
router.get(CONFIG.serverUrl + '/api/booking_loads', function (req, res, next) {
    var results = [];

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        var query = client.query("SELECT *," +
            "(SELECT producers.id FROM producers WHERE booking_loads.producer_no = producers.producer_no) AS producer_id " +
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

router.post(CONFIG.serverUrl + '/api/bookings_loads/', function (req, res) {
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
router.post(CONFIG.serverUrl + '/api/producers', function (req, res, next) {
    var results = [];

    pg.connect(CONFIG.connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }


        var data = req.body;
        var filters = data['filters'];
        var where_clause = [];
        var values = [];

        if (filters && Object.keys(filters).length > 0) {
            var i = 1;
            if (filters.producer_no) {
                where_clause.push('producer_no = ($' + i + ')');
                i++;
                values.push(filters.producer_no);
            }

            if (filters.legal_name) {
                where_clause.push('LOWER(legal_name) = LOWER(($' + i + '))');
                i++;
                values.push(filters.legal_name);
            }
        }

        var query = client.query("SELECT * FROM producers"
            + ( where_clause.length ? ' WHERE ' + where_clause.join(' AND ') : '')
            + " LIMIT 100", values);

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

router.get(CONFIG.serverUrl + '/api/producers/:id', function (req, res, next) {
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

router.post(CONFIG.serverUrl + '/api/producers/', function (req, res) {
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
router.get(CONFIG.serverUrl + '/api/facilities', function (req, res, next) {
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
router.get(CONFIG.serverUrl + '/api/supply_streams', function (req, res, next) {
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


