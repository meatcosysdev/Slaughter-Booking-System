(function () {
    angular.module('BookingsApp')
        .controller('StandbyListController', standbyListController);

    standbyListController.$inject = ['$state'];


    // Declarations
    function standbyListController($state) {
        var vm = this;

        // PROPERTIES

        // METHODS
        vm.goto = goto;

        // IMPLEMENTATIONS
        function goto(state) {
            $state.go(state, {data: {truck: vm.truck}});
        }
    }
})();