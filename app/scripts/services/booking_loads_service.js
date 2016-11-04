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

        function get_all(filters) {
            var defer = $q.defer();

            $http({
                url: '/api/booking-loads-list',
                method: "POST",
                data: {filters: filters}
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