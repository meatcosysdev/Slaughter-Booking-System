(function () {
    'use strict';

    angular.module('BookingsApp.Directives', []);

    angular
        .module('BookingsApp', [
            'ui.router',
            'ngResource',
            'chart.js',
            'BookingsApp.Directives'
        ])
        .config(configFunction)
        .run(runOptions);

    configFunction.$inject = ['$stateProvider', '$urlRouterProvider'];

    runOptions.$inject = ['$rootScope', '$templateCache'];

    function configFunction($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('home', {
                url: "/home",
                controller: 'DashboardController as vm',
                templateUrl: 'views/dashboard/index.html'
            })

            // BOOKINGS
            .state('bookings', {
                url: "/bookings",
                controller: 'BookingsController as vm',
                templateUrl: 'views/bookings/index.html'
            })

            // STANDBY-LIST
            .state('standby-list', {
                url: "/standby-list",
                controller: 'StandbyListController as vm',
                templateUrl: 'views/standby-list/index.html'
            })
        ;
    }

    function runOptions($rootScope, $templateCache) {
        $rootScope.$on('$viewContentLoaded', function () {
            $templateCache.removeAll();
        });
    }
})();
