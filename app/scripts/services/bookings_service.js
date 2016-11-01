(function () {
    'use strict';

    angular.module('BookingsApp')
        .service('bookingsService', bookingsService);

    bookingsService.$inject = ['$http', '$q'];

    // Declarations
    function bookingsService($http, $q) {
        return {
            get_all: get_all,
            save: save,
            get_booking_standing_by: get_booking_standing_by,
            save_stand_by: save_stand_by,
            remove_stand_by: remove_stand_by,
            get_facilities: get_facilities,
            get_supply_streams: get_supply_streams
        };

        function save(booking) {
            var defer = $q.defer();

            $http({
                url: '/api/bookings/',
                method: "POST",
                data: booking
            }).then(function (response) {
                    defer.resolve(response.data);
                    toastr.success("Truck booking was successfully updated!");

                },
                function (response) {
                    defer.reject(response);
                    if (response.data) {
                        toastr.error(response.data.error, "Oops! Something went wrong!");
                    }
                });

            return defer.promise;
        }

        function get_all(filters) {
            var defer = $q.defer();

            $http({
                url: '/api/bookings-list/',
                data: { filters: filters },
                method: "POST"
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
                url: '/api/booking_standby_trucks/',
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
                url: '/api/facilities/',
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
                url: '/api/supply_streams/',
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