(function () {
    'use strict';

    angular.module('BookingsApp')
        .service('producerService', producerService);

    producerService.$inject = ['$http', '$q', 'CONFIG'];

    // Declarations
    function producerService($http, $q, CONFIG) {
        return {
            get_all_producers: get_all_producers,
            get_producer_for_load:get_producer_for_load,
            //get_by_id: get_producer,
            //contact_producer: contact_producer,
            //get_by_producer_no: get_by_producer_no,
        };

        function get_all_producers() {
            var defer = $q.defer();

            $http({
                url: CONFIG.api_url + '/producers?page=1&size=100',
                method: "GET",
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

        function get_producer_for_load(url) {
            var defer = $q.defer();

            $http({
                url: url,
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

        function get_by_producer_no(producerNo) {
            var defer = $q.defer();

            $http({
                url: '/api/producers/number/' + producerNo,
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