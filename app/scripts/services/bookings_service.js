(function () {
    'use strict';

    angular.module('BookingsApp')
        .service('bookingsService', bookingsService);

    bookingsService.$inject = ['$http', '$q', 'CONFIG'];

    // Declarations
    function bookingsService($http, $q, CONFIG) {
        return {
            get_all_bookings: get_all_bookings,
            save: save,
            get_booking_standing_by: get_booking_standing_by,
            save_stand_by: save_stand_by,
            remove_stand_by: remove_stand_by,
            get_facilities: get_facilities,
            get_supply_streams: get_supply_streams
        };

        function save(booking, hide_notifications) {
            var defer = $q.defer();

            $http({
                url: CONFIG.api_url + '/bookingTrucks' ,
                method: "POST",
                data: booking
            }).then(function (response) {
                    defer.resolve(response.data);
                    if (!hide_notifications) toastr.success("Truck booking was successfully updated!");

                },
                function (response) {
                    defer.reject(response);
                    if (response.data) {
                        toastr.error(response.data.error, "Oops! Something went wrong!");
                    }
                });

            return defer.promise;
        }

        function get_all_bookings() {
            var defer = $q.defer();

            $http({
                url: CONFIG.api_url + '/bookingTrucks?page=1&size=1000',
                method: "GET"
            }).then(function (response) {
                    defer.resolve(response.data);
                },
                function (response) {
                    defer.reject(response);
                    if (response.data) {
                        toastr.error(response.data.error, "Oops! Something went wrong!");
                    }
                });

            return defer.promise;
        }

        function get_booking_standing_by(standby_id) {
            var defer = $q.defer();

            $http({
                url: '/api/booking_standby_trucks/' + standby_id,
                method: "GET"
            }).then(function (response) {
                    defer.resolve(response.data);
                },
                function (response) {
                    defer.reject(response);
                    if (response.data) {
                        toastr.error(response.data.error, "Oops! Something went wrong!");
                    }
                });

            return defer.promise;
        }

        function save_stand_by(sb) {
            var defer = $q.defer();

            $http({
                url: CONFIG.api_url + '/bookingTrucks',
                method: "POST",
                data: sb
            }).then(function (response) {
                    defer.resolve(response.data);
                    toastr.success("Stand-by was successfully updated!");

                },
                function (response) {
                    defer.reject(response);
                    if (response.data) {
                        toastr.error(response.data.error, "Oops! Something went wrong!");
                    }
                });

            return defer.promise;
        }

        function remove_stand_by(id) {
            var defer = $q.defer();

            $http({
                url: '/api/booking_standby_trucks/' + id,
                method: "DELETE"
            }).then(function (response) {
                    defer.resolve(response.data);
                    toastr.success("Stand-by was successfully removed!");

                },
                function (response) {
                    defer.reject(response);
                    if (response.data) {
                        toastr.error(response.data.error, "Oops! Something went wrong!");
                    }
                });

            return defer.promise;
        }

        function get_facilities() {
            var defer = $q.defer();

            $http({
                url: CONFIG.api_url + '/facilities',
                method: "GET"
            }).then(function (response) {
                    defer.resolve(response.data);
                },
                function (response) {
                    defer.reject(response);
                    if (response.data) {
                        toastr.error(response.data.error, "Oops! Something went wrong!");
                    }
                });

            return defer.promise;
        }

        function get_supply_streams() {
            var defer = $q.defer();

            $http({
                url: CONFIG.api_url + '/supplyStreams/',
                method: "GET"
            }).then(function (response) {
                    defer.resolve(response.data);
                },
                function (response) {
                    defer.reject(response);
                    if (response.data) {
                        toastr.error(response.data.error, "Oops! Something went wrong!");
                    }
                });

            return defer.promise;
        }
    }
})();