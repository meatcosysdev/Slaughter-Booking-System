(function () {
    angular.module('BookingsApp')
        .controller('BookingsController', bookingsController);

    bookingsController.$inject = ['$state', 'bookingsService', 'bookingsLoadsService', 'producerService'];

    // Declarations
    function bookingsController($state, bookingsService, bookingsLoadsService, producerService) {
        var vm = this;

        vm.current_booking = {};
        vm.current_load = {};
        vm.current_stand_by = {};
        vm.current_producer = {};
        vm.truck_loads = [];
        vm.loads_list = [];

        vm.today = new Date();
        vm.add_days = 8;
        vm.day_rule = moment().add(vm.add_days, 'day').toDate();
        vm.day_rule_str = moment().add(vm.add_days, 'day').format('DD/MM/YYYY');

        // INITIAL VALUES
        vm.contactMethods = [{name: 'Phoned'}, {name: 'Emailed'}];
        vm.contactMethod = vm.contactMethods[0].name;

        vm.offices = [{name: 'Regional Office'}, {name: 'Regional Office 2'}, {name: 'Regional Office 3'}];
        vm.office = vm.offices[0].name;

        // METHODS
        vm.init = init;
        vm.loadAllBookings = loadAllBookings;
        vm.filterBookings = filterBookings;

        vm.loadFacilities = loadFacilities;
        vm.loadSupplyStreams = loadSupplyStreams;

        vm.goto = goto;
        vm.selectBookingToImprove = selectBookingToImprove;
        vm.getTruckLoads = getTruckLoads;
        vm.getProducerDetails = getProducerDetails;
        vm.selectLoad = selectLoad;
        vm.updateTruckBooking = updateTruckBooking;

        vm.updateLoad = updateLoad;
        vm.cancelLoad = cancelLoad;
        vm.showImprovePanel = showImprovePanel;
        vm.showAlterStandByPanel = showAlterStandByPanel;
        vm.validateDate = validateDate;

        vm.showAlterLoadConfirmation = showAlterLoadConfirmation;
        vm.validateStandByDate = validateStandByDate;
        vm.updateStandBy = updateStandBy;
        vm.removeStandBy = removeStandBy;

        vm.contactProducer = contactProducer;

        // ------------------------------------------------- INIT ------------------------------------------------------
        vm.init();
        // -------------------------------------------------------------------------------------------------------------

        // IMPLEMENTATIONS
        function init() {
            vm.loadAllBookings();
            vm.loadFacilities();
            vm.loadSupplyStreams();
        }

        function loadSupplyStreams() {
            bookingsService.get_supply_streams().then(function (result) {
                vm.streams = result;
                if (vm.streams.length) vm.selected_stream = vm.streams[0].id;
            });
        }

        function loadFacilities() {
            bookingsService.get_facilities().then(function (result) {
                vm.facilities = result;
                if (vm.facilities.length) vm.selected_facility = vm.facilities[0].id;
            });
        }


        function filterBookings() {
            var filters = {};

            if (vm.producer_number) filters.producer_number = vm.producer_number;
            if (vm.producer_name) filters.producer_name = vm.producer_name;
            if (vm.load_number) filters.load_number = vm.load_number;
            if (vm.booked_date) filters.booked_date = moment(vm.booked_date).format('YYYY-MM-DD');
            if (vm.selected_facility) filters.selected_facility = vm.selected_facility;
            if (vm.selected_stream) filters.selected_stream = vm.selected_stream;

            console.log(filters)

            bookingsService.get_all(filters).then(function (result) {
                console.log(result);

                vm.truck_bookings = result.map(function (t) {
                    t.allocated_date = moment(t.allocated_date).format('DD/MM/YYYY');
                    t.preferred_date_from = moment(t.preferred_date_from).toDate();
                    t.preferred_date_until = moment(t.preferred_date_until).toDate();
                    return t;
                });

            });
        }

        function loadAllBookings() {
            bookingsService.get_all().then(function (result) {
                vm.truck_bookings = result.map(function (t) {
                    t.allocated_date = moment(t.allocated_date).format('DD/MM/YYYY');
                    t.preferred_date_from = moment(t.preferred_date_from).toDate();
                    t.preferred_date_until = moment(t.preferred_date_until).toDate();
                    return t;
                });

            });
        }

        function selectBookingToImprove(b) {
            b.isSelected = !b.isSelected;

            vm.truck_bookings.forEach(function (t) {
                if (t.id != b.id) t.isSelected = false;
            });

            if (b.isSelected) {
                vm.current_booking = b;

                // Get booking_load details
                vm.getTruckLoads(vm.current_booking.id);

            } else {
                delete vm.current_booking;
                delete vm.current_producer;
            }

            vm.disableImprovement = (vm.current_booking && vm.current_booking.allocated_date == vm.day_rule_str);
        }

        function getTruckLoads(booking_id) {
            bookingsLoadsService.get_all().then(function (result) {
                vm.truck_loads = result.filter(function (load) {
                    return load.booking_truck_id == booking_id && load.current_status != 'cancelled';
                });

                // FIND STANDBY BOOKING
                if (vm.current_booking.current_status == 'stand-by') {
                    vm.disableImprovement = true;

                    // TODO
                    var standByID = 3;
                    bookingsService.get_booking_standing_by(standByID).then(function (response) {
                        vm.current_stand_by = response;
                        vm.current_stand_by.preferred_date_from = moment(vm.current_stand_by.preferred_date_from).toDate();
                        vm.current_stand_by.preferred_date_until = moment(vm.current_stand_by.preferred_date_until).toDate();
                    })
                }
            });
        }

        function getProducerDetails(producer_id) {
            producerService.get_by_id(producer_id).then(function (result) {
                vm.current_producer = result;
                vm.current_producer.merit_point = vm.current_load.merit_point;
                vm.contactMethod = vm.current_producer.contact_status = vm.current_booking.contact_status;
            });
        }

        function selectLoad(load) {
            load.isSelected = !load.isSelected;

            vm.truck_loads.forEach(function (t) {
                if (t.id != load.id) t.isSelected = false;
            });

            if (load.isSelected) {
                vm.current_load = load;

                // Get producer details
                vm.getProducerDetails(vm.current_load.producer_id);

            } else {
                delete vm.current_load;
                delete vm.current_producer;
            }
        }

        function validateDate() {
            vm.dateErrorMessages = [];
            if (vm.to_improve_booking.preferred_date_from > vm.to_improve_booking.preferred_date_until) vm.dateErrorMessages.push("Start date can't exceed end date");
            if (vm.to_improve_booking.preferred_date_from < vm.day_rule) vm.dateErrorMessages.push("Start date must be at least " + vm.add_days + " days in the future");
            if (vm.to_improve_booking.preferred_date_until < vm.day_rule) vm.dateErrorMessages.push("End date must be at least " + vm.add_days + " days in the future");
        }

        function updateTruckBooking() {
            vm.current_booking = angular.copy(vm.to_improve_booking);

            var booking = {
                id: vm.current_booking.id,
                current_status: 'TrytoImprove',
                preferred_date_from: moment(vm.current_booking.preferred_date_from).format('YYYY-MM-DD'),
                preferred_date_until: moment(vm.current_booking.preferred_date_until).format('YYYY-MM-DD')
            };

            //

            bookingsService.save(booking).then(function () {
                vm.showImprovePopup = false;
                vm.loadAllBookings();
            });
        }

        function showImprovePanel() {
            vm.to_improve_booking = angular.copy(vm.current_booking);

            vm.showImprovePopup = true;
            vm.validateDate();
        }

        // LOAD DETAILS
        function updateLoad() {
            vm.current_load.current_status = "loaded";
            bookingsLoadsService.save(vm.current_load).then(function () {
                vm.showAlterLoadPopup = false;
            });
        }

        function cancelLoad() {
            vm.current_load.current_status = "cancelled";
            bookingsLoadsService.save(vm.current_load).then(function () {
                vm.showAlterLoadPopup = false;
                vm.showCancelLoadPopup = false;
            });
        }

        function showAlterLoadConfirmation() {
            vm.showAlterLoadPopup = false;
            vm.showCancelLoadPopup = true;
        }

        // STANDBY
        function validateStandByDate() {
            vm.standByErrorMessages = [];
            if (vm.alter_stand_by.preferred_date_from > vm.alter_stand_by.preferred_date_until) {
                vm.standByErrorMessages.push("Start date can't exceed end date!");
            }
            if (vm.alter_stand_by.preferred_date_from < vm.today) {
                vm.standByErrorMessages.push("You can't select a date in the past!");
            }
        }

        function showAlterStandByPanel() {
            vm.alter_stand_by = angular.copy(vm.current_stand_by);

            vm.showAlterStandByPopup = true;
            vm.validateStandByDate();
        }

        function updateStandBy() {
            vm.current_stand_by = angular.copy(vm.alter_stand_by);

            var sb = {
                id: vm.current_stand_by.id,
                preferred_date_from: moment(vm.current_stand_by.preferred_date_from).format('YYYY-MM-DD'),
                preferred_date_until: moment(vm.current_stand_by.preferred_date_until).format('YYYY-MM-DD'),
                lead_days: vm.current_stand_by.lead_days,
                truck_size: vm.current_stand_by.truck_size
            };

            bookingsService.save_stand_by(sb).then(function () {
                vm.showAlterStandByPopup = false;
            });
        }

        function removeStandBy() {
            bookingsService.remove_stand_by(vm.current_stand_by.id).then(function () {
                vm.showAlterStandByPopup = false;
            });
        }

        // Producer
        function contactProducer(status) {
            vm.current_booking.contact_status = status;

            bookingsService.save(vm.current_booking).then(function () {
                vm.showProducerContact = false;
            });
        }

        function goto(state) {
            $state.go(state, {data: {truck: vm.truck}});
        }
    }
})();