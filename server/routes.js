var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var request = require('request');

// MODELS
var CONFIG = require('./models/config').CONFIG;

function serialize(obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

router.get('/*', function (req, res, next) {
    request(CONFIG.api_url + req.path + '?' + serialize(req.query), function (error, response, body) {
        return res.status(200).send(body);
    })
});

router.post('/*', function (req, res, next) {
    console.log(req['path']);

    request.post({
        headers: {'content-type': 'application/json'},
        url: CONFIG.api_url + req['path'],
        body: JSON.stringify(req['body'])
    }, function (error, response, body) {
        return res.status(200).send(response['headers']);
    });
});

router.put('/*', function (req, res, next) {
    console.log(req['path']);
    console.log(req['body']);

    request.post({
        headers: {'content-type': 'application/json'},
        url: CONFIG.api_url + req['path'],
        body: JSON.stringify(req['body'])
    }, function (error, response, body) {
        console.log(body);
        return res.status(200).send(body);
    });
});

module.exports = router;

/*// -------------------------------------------- BOOKINGS --------------------------------------------
router.get('/bookingTrucks', function (req, res, next) {
    var t = {
        "_embedded": {
            "bookingTrucks": [{
                "preferredDateFrom": "2016-12-04",
                "preferredDateUntil": "2016-12-04",
                "runDate": "2016-06-23",
                "truckSize": 40,
                "meritPoint": 63.00,
                "deliveryDate": "2016-07-03",
                "bookingDate": "2016-07-04",
                "contactStatus": "Please Notify       ",
                "currentStatus": "Booked           ",
                "createdAt": "2016-06-21T07:22:49.000+0000",
                "createdBy": "Informix            ",
                "updatedAt": "2016-06-23T09:49:29.000+0000",
                "updatedBy": "informix            ",
                "_links": {
                    "self": {
                        "href": "http://localhost:8080/bookingTrucks/15180"
                    },
                    "bookingTruck": {
                        "href": "http://localhost:8080/bookingTrucks/15180"
                    },
                    "facility": {
                        "href": "http://localhost:8080/bookingTrucks/15180/facility"
                    },
                    "bookingLoads": {
                        "href": "http://localhost:8080/bookingTrucks/15180/bookingLoads"
                    },
                    "supplyStream": {
                        "href": "http://localhost:8080/bookingTrucks/15180/supplyStream"
                    }
                }
            }]
        },
        "_links": {
            "first": {
                "href": "http://localhost:8080/bookingTrucks?page=0&size=1"
            },
            "self": {
                "href": "http://localhost:8080/bookingTrucks"
            },
            "next": {
                "href": "http://localhost:8080/bookingTrucks?page=1&size=1"
            },
            "last": {
                "href": "http://localhost:8080/bookingTrucks?page=2569&size=1"
            },
            "profile": {
                "href": "http://localhost:8080/profile/bookingTrucks"
            }
        },
        "page": {
            "size": 1,
            "totalElements": 2570,
            "totalPages": 2570,
            "number": 0
        }
    }
    return res.json(t);
});

router.post('/api/bookingTrucks/', function (req, res) {
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
router.get('/standByTrucks', function (req, res, next) {
    var t = {
        "_embedded": {
            "bookingTrucks": [{
                "preferredDateFrom": "2016-12-04",
                "preferredDateUntil": "2016-12-04",
                "runDate": "2016-06-23",
                "truckSize": 40,
                "meritPoint": 63.00,
                "deliveryDate": "2016-07-03",
                "bookingDate": "2016-07-04",
                "contactStatus": "Please Notify       ",
                "currentStatus": "Booked           ",
                "createdAt": "2016-06-21T07:22:49.000+0000",
                "createdBy": "Informix            ",
                "updatedAt": "2016-06-23T09:49:29.000+0000",
                "updatedBy": "informix            ",
                "_links": {
                    "self": {
                        "href": "http://localhost:8080/bookingTrucks/15180"
                    },
                    "bookingTruck": {
                        "href": "http://localhost:8080/bookingTrucks/15180"
                    },
                    "facility": {
                        "href": "http://localhost:8080/bookingTrucks/15180/facility"
                    },
                    "bookingLoads": {
                        "href": "http://localhost:8080/bookingTrucks/15180/bookingLoads"
                    },
                    "supplyStream": {
                        "href": "http://localhost:8080/bookingTrucks/15180/supplyStream"
                    }
                }
            }]
        },
        "_links": {
            "first": {
                "href": "http://localhost:8080/bookingTrucks?page=0&size=1"
            },
            "self": {
                "href": "http://localhost:8080/bookingTrucks"
            },
            "next": {
                "href": "http://localhost:8080/bookingTrucks?page=1&size=1"
            },
            "last": {
                "href": "http://localhost:8080/bookingTrucks?page=2569&size=1"
            },
            "profile": {
                "href": "http://localhost:8080/profile/bookingTrucks"
            }
        },
        "page": {
            "size": 1,
            "totalElements": 2570,
            "totalPages": 2570,
            "number": 0
        }
    }
    return res.json(t);

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
router.get('/bookingTrucks/:truck_id/bookingLoads', function (req, res, next) {
    var loads = {
        "_embedded": {
            "bookingLoads": [{
                "quantity": 40,
                "meritPoint": 63.00,
                "origin": "OKASLA              ",
                "currentStatus": "Booked           ",
                "createdAt": "2016-11-08T10:26:32.139+0000",
                "createdBy": "sscheepers",
                "updatedAt": "2016-11-08T10:26:32.139+0000",
                "updatedBy": "sscheepers",
                "_links": {
                    "self": {
                        "href": "http://localhost:8080/bookingLoads/15704"
                    },
                    "bookingLoad": {
                        "href": "http://localhost:8080/bookingLoads/15704"
                    },
                    "producerAgreementLine": {
                        "href": "http://localhost:8080/bookingLoads/15704/producerAgreementLine"
                    },
                    "producer": {
                        "href": "http://localhost:8080/bookingLoads/15704/producer"
                    },
                    "bookingTruck": {
                        "href": "http://localhost:8080/bookingLoads/15704/bookingTruck"
                    }
                }
            }]
        },
        "_links": {
            "self": {
                "href": "http://localhost:8080/bookingTrucks/15180/bookingLoads"
            }
        }
    }

    return res.json(loads);
});

router.post(CONFIG.serverUrl + '/api/bookings_loads/', function (req, res) {
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
            client.query(
                "UPDATE booking_loads SET quantity=($1), current_status=($2) WHERE id=($3)",
                [data['quantity'], data['current_status'], data['id']]
            );
        } else {
            client.query("INSERT INTO booking_loads"
                + " (booking_truck_id, agreement_form_line_id, producer_no, quantity, "
                + " merit_point, standby_id, origin, current_status)"
                + " VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [
                    data.booking_truck_id,
                    data.agreement_form_line_id,
                    data.producer_no,
                    data.quantity,
                    data.merit_point,
                    data.standby_id,
                    data.origin,
                    data.current_status
                ]);
        }

        // FOR CANCELLING LOAD
        if (data.current_status == 'cancelled') {
            client.query(
                "INSERT INTO booking_load_cancellations(booking_load_id, reason, penalty_days, current_status) " +
                "values($1, $2, $3, $4)", [data.id, data.reason, CONFIG.cancel_penalty_days, data.current_status]);
        }

        return res.status(200).send({success: true});
    });

});

// -------------------------------------------- PRODUCERS --------------------------------------------
router.get('/bookingLoads/:load_id/producer', function (req, res, next) {
    var producer = {
        "producerNo" : "64014",
        "alphaCode" : "FC2",
        "legalName" : "MEATCO FEEDLOT",
        "idNo" : "64014 COMPANY",
        "vatName" : "MEATCO FEEDLOT",
        "vatRegistrationNo" : null,
        "contactPerson" : "MEATCO FEEDLOT",
        "physicalAddress" : null,
        "postalAddress1" : "P.O. BOX 3881",
        "postalAddress2" : "WINDHOEK",
        "postalCode" : " ",
        "smsNo" : "0814166351",
        "telephoneNo" : "061257203",
        "faxNo" : " 061257848",
        "emailAddress" : "fbooysen@meatco.com.na",
        "currentStatus" : "Active",
        "createdAt" : "2015-09-14T06:24:47.147+0000",
        "createdBy" : "sscheepers",
        "updatedAt" : "2016-08-04T14:22:41.162+0000",
        "updatedBy" : "euanivi",
        "_links" : {
            "self" : {
                "href" : "http://localhost:8080/producers/8847"
            },
            "producer" : {
                "href" : "http://localhost:8080/producers/8847"
            },
            "bookingLoads" : {
                "href" : "http://localhost:8080/producers/8847/bookingLoads"
            }
        }
    }

    return res.json(producer);
});

// -------------------------------------------- FACILITIES --------------------------------------------
router.get('/facilities', function (req, res, next) {
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
router.get('/supply_streams', function (req, res, next) {
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
});*/
