(function () {
    angular.module('BookingsApp')
        .controller('DashboardController', dashboardController);

    dashboardController.$inject = ['$state', '$window'];


    // Declarations
    function dashboardController($state, $window) {
        var vm = this;

        // PROPERTIES
        vm.labels = ["All Cancellations", "Your Cancellations"];
        vm.data = [300, 500];

        vm.labels2 = ['2006', '2007'];
        vm.data2 = [
            [65, 59],
            [28, 48]
        ];
        vm.series = ['Bookings', 'Deliveries'];



        vm.data1 = [
            [65, 59, 90, 81, 56, 55, 40],
            [28, 48, 40, 19, 96, 27, 100]
        ];
        vm.labels1 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        vm.type = 'StackedBar';
        vm.series1 = ['2015', '2016'];
        vm.options1 = {
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        };

        // METHODS
        vm.goto = goto;
        //if ($state.current.name == 'transfer.barcode') $('#barcode').focus();

        // IMPLEMENTATIONS
        function goto(state) {
            $state.go(state, {data: {truck: vm.truck}});
        }
    }
})();