(function () {
    'use strict';

    angular.module('BookingsApp')
        .service('bookingsLoadsService', bookingsLoadsService);

    bookingsLoadsService.$inject = ['$http', '$q'];

    // Declarations
    function bookingsLoadsService($http, $q) {
        return {
            get_all: get_all,
            save: save,
            get_booking_standing_by: get_booking_standing_by,
        };

        function save(load) {
            var defer = $q.defer();

            $http({
                url: '/api/bookings_loads/',
                method: "POST",
                data: load
            }).then(function (response) {
                    defer.resolve(response.data);
                    toastr.success("Truck load was successfully updated!");

                },
                function (response) {
                    defer.reject(response);
                    if (response.data) {
                        toastr.error(response.data.error, "Oops! Something went wrong!");
                    }
                });

            return defer.promise;
        }

        function get_all() {
            var defer = $q.defer();

            $http({
                url: '/api/booking_loads/',
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

        function get_booking_standing_by(stand_by_id) {
            var defer = $q.defer();

            $http({
                url: '/api/standby_booking_loads/' + stand_by_id,
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