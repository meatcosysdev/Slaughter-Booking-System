(function () {
    'use strict';

    angular.module('BookingsApp')
        .service('bookingsLoadsService', bookingsLoadsService);

    bookingsLoadsService.$inject = ['$http', '$q' , 'CONFIG'];

    // Declarations
    function bookingsLoadsService($http, $q, CONFIG) {
        return {
            //get_all: get_all,
            save: save,
            get_truck_loads: get_truck_loads,
        };

        function save(load) {
            var defer = $q.defer();

            $http({
                url: CONFIG.api_url + '/bookingLoads',
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

        function get_truck_loads(url) {
            var defer = $q.defer();

            $http({
                url: url,
                get: "POST",
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