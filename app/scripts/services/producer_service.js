(function () {
    'use strict';

    angular.module('BookingsApp')
        .service('producerService', producerService);

    producerService.$inject = ['$http', '$q'];

    // Declarations
    function producerService($http, $q) {
        return {
            get_all: get_all,
            get_by_id: get_producer,
            contact_producer: contact_producer,
            get_by_producer_no: get_by_producer_no
        };

        function get_all(filters) {
            var defer = $q.defer();

            $http({
                url: '/api/producers/',
                method: "POST",
                data: { filters: filters}
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

        function get_producer(producer_id) {
            var defer = $q.defer();

            $http({
                url: '/api/producers/' + producer_id,
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

        function contact_producer(producer) {
            var defer = $q.defer();

            $http({
                url: '/api/producers/',
                method: "POST",
                data: producer
            }).then(function (response) {
                    defer.resolve(response.data);
                    toastr.success("Contact status was successfully updated");

                },
                function (response) {
                    defer.reject(response);
                    if (response.data) {
                        toastr.error(response.data.error, "Oops! Something went wrong!");
                    }
                });

            return defer.promise;
        }

        function get_by_producer_no(producer_no) {
            var defer = $q.defer();

            $http({
                url: '/api/producers/number/' + producer_no,
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