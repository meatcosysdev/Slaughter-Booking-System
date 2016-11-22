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
        .constant('CONFIG', {
            app_version: '1.2.0',
            api_url: '',
            standby_status: 'StandBy'
        })
        .config(configFunction)
        .run(runOptions);

    configFunction.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];

    runOptions.$inject = ['$rootScope', '$templateCache'];

    function configFunction($stateProvider, $urlRouterProvider, $httpProvider) {
        //$httpProvider.defaults.useXDomain = true;
        //delete $httpProvider.defaults.headers.common['X-Requested-With'];

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
