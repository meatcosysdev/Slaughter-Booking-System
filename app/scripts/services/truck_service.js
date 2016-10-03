(function () {
    'use strict';

    angular.module('BookingsApp')
        .service('truckService', truckService);

    truckService.$inject = ['$resource'];

    // Declarations
    function truckService($resource) {
        return $resource('/api/trucks/:id', {id: '@id'}, {
            update: {
                method: 'PUT',
            }
        });
    }
})();