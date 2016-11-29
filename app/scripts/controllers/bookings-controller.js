(function () {
    angular.module('BookingsApp')
        .controller('BookingsController', bookingsController);

    bookingsController.$inject = ['$state', 'bookingsService', 'bookingsLoadsService', 'producerService', 'CONFIG'];

    // Declarations
    function bookingsController($state, bookingsService, bookingsLoadsService, producerService, CONFIG) {
        var vm = this;

        vm.current_booking = {};
        vm.current_load = '';
        vm.current_stand_by = {};
        vm.current_producer = {};
        vm.truck_loads = [];
        vm.loads_list = [];

        vm.standByStatusText = CONFIG.standby_status;
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
        vm.selectLoad = selectLoad;
        vm.updateTruckBooking = updateTruckBooking;

        vm.updateLoad = updateLoad;
        vm.cancelLoad = cancelLoad;
        vm.showImprovePanel = showImprovePanel;
        vm.showAlterStandByPanel = showAlterStandByPanel;
        vm.validateDate = validateDate;
        vm.loadStandByDetails = loadStandByDetails;

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
                vm.streams = result['_embedded']['supplyStreams'] || [];
                vm.streams.unshift({id: 0, name: '- Stream -'});
                vm.selected_stream = vm.streams[0].id;
            });
        }

        function loadFacilities() {
            bookingsService.get_facilities().then(function (result) {
                vm.facilities = result['_embedded']['facilities'] || [];
                vm.facilities.unshift({id: 0, name: '- Facility -'});
                 vm.selected_facility = vm.facilities[0].id;
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

            bookingsService.get_all_bookings().then(function (result) {
                vm.truck_bookings = (result['_embedded']['bookingTrucks'] || []).map(function (t) {
                    t['id'] = t['_links']['bookingTruck']['href'].split('/').pop();

                    t.loads_number = 0; // TODO
                    t.bookingDate = moment(t.bookingDate).format('DD/MM/YYYY');
                    t.deliveryDate = moment(t.deliveryDate).format('DD/MM/YYYY');
                    t.preferred_date_from = moment(t.preferredDateFrom).toDate();
                    t.preferred_date_until = moment(t.preferredDateUntil).toDate();

                    return t;
                });

                vm.selectBookingToImprove();
            });
        }

        function loadAllBookings() {
            bookingsService.get_all_bookings().then(function (result) {
                vm.truck_bookings = (result['_embedded']['bookingTrucks'] || []).map(function (t) {
                    t['id'] = t['_links']['bookingTruck']['href'].split('/').pop();

                    t.loads_number = 0; // TODO
                    t.bookingDate = moment(t.bookingDate).format('DD/MM/YYYY');
                    t.deliveryDate = moment(t.deliveryDate).format('DD/MM/YYYY');
                    t.preferred_date_from = moment(t.preferredDateFrom).toDate();
                    t.preferred_date_until = moment(t.preferredDateUntil).toDate();

                    return t;
                });

                vm.selectBookingToImprove();
            });
        }

        function selectBookingToImprove(b) {
            if (!b) {
                delete vm.current_booking;
                delete vm.truck_loads;
                vm.truck_bookings.forEach(function (t) {
                    t.isSelected = false;
                });
                return;
            }

            vm.truck_loads = [];
            b.isSelected = !b.isSelected;

            vm.truck_bookings.forEach(function (t) {
                if (t.id != b.id) t.isSelected = false;
            });

            if (b.isSelected) {
                vm.current_booking = b;

                // Get booking_load details
                vm.getTruckLoads();

            } else {
                delete vm.current_booking;
                delete vm.current_producer;
            }

            vm.disableImprovement = (vm.current_booking && vm.current_booking.allocated_date == vm.day_rule_str);
        }

        function getTruckLoads() {
            var url = vm.current_booking['_links']['bookingLoads']['href'];

            bookingsLoadsService.get_truck_loads(url).then(function (result) {
                vm.truck_loads = (result['_embedded']['bookingLoads'] || []).map(function(load){
                    load.id = load['_links']['bookingLoad']['href'].split('/').pop();
                    load.currentStatus = load.currentStatus.trim();
                    load.booking_truck_id = vm.current_booking['id'];

                    var url = load['_links']['producer']['href'];

                    producerService.get_producer_for_load(url).then(function(producer){
                        if (producer) {
                            producer.contactStatus = vm.current_booking.contactStatus;
                            load.producer = producer;
                            load.producerNo = producer.producerNo;
                        }
                    });

                    return load;
                });

                // FIND STANDBY BOOKING
                if (vm.current_booking.currentStatus == 'StandBy') {
                    vm.disableImprovement = true;
                }
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
                if (load.producer) {
                    vm.current_producer = angular.copy(load.producer);
                    vm.current_producer.merit_point = load.meritPoint;
                    vm.contactMethod = vm.current_producer.contactStatus;
                }

                // Load standBy details
                if (vm.current_booking.currentStatus == vm.standByStatusText && vm.current_load.standby_id) {
                    vm.loadStandByDetails();
                }

            } else {
                delete vm.current_stand_by;
                delete vm.current_load;
                delete vm.current_producer;
            }
        }

        function loadStandByDetails() {
            console.log(vm.current_load);

            return;
            bookingsService.get_booking_standing_by().then(function (response) {
                vm.current_stand_by = response;
                vm.current_stand_by.preferred_date_from = moment(vm.current_stand_by.preferred_date_from).toDate();
                vm.current_stand_by.preferred_date_until = moment(vm.current_stand_by.preferred_date_until).toDate();
            })
        }

        function validateDate() {
            vm.dateErrorMessages = [];
            if (vm.to_improve_booking.preferred_date_from > vm.to_improve_booking.preferred_date_until) vm.dateErrorMessages.push("Start date can't exceed end date");
            if (vm.to_improve_booking.preferred_date_from < vm.day_rule) vm.dateErrorMessages.push("Start date must be at least " + vm.add_days + " days in the future");
            if (vm.to_improve_booking.preferred_date_until < vm.day_rule) vm.dateErrorMessages.push("End date must be at least " + vm.add_days + " days in the future");
        }

        function showImprovePanel() {
            vm.to_improve_booking = angular.copy(vm.current_booking);
            vm.to_improve_booking.preferred_date_from = moment().add('days', 8).toDate();
            vm.to_improve_booking.preferred_date_until = moment().add('days', 8).toDate();

            vm.showImprovePopup = true;
            vm.validateDate();
        }

        function updateTruckBooking() {
            vm.to_improve_booking.currentStatus = 'TryToImprove';
            vm.to_improve_booking.contactStatus = 'Please Notify';
            vm.to_improve_booking.preferredDateFrom =  moment(vm.to_improve_booking.preferred_date_from).format('YYYY-MM-DD');
            vm.to_improve_booking.preferredDateUntil = moment(vm.to_improve_booking.preferred_date_until).format('YYYY-MM-DD');

            vm.to_improve_booking.runDate = moment(vm.current_booking.preferredDateFrom).format('YYYY-MM-DD');
            vm.to_improve_booking.deliveryDate = moment(vm.current_booking.deliveryDate).format('YYYY-MM-DD');
            vm.to_improve_booking.bookingDate = moment(vm.current_booking.bookingDate).format('YYYY-MM-DD');


            delete vm.to_improve_booking['_links'];
            delete vm.to_improve_booking['preferred_date_from'];
            delete vm.to_improve_booking['preferred_date_until'];
            delete vm.to_improve_booking['isSelected'];
            delete vm.to_improve_booking['loads_number'];

            bookingsService.save(vm.to_improve_booking).then(function () {
                vm.showImprovePopup = false;
                vm.selectBookingToImprove();
            });
        }

        // LOAD DETAILS
        function updateLoad() {
            var update_load = angular.copy(vm.current_load);
            update_load.currentStatus = "TryToImprove";
            delete update_load['_links'];
            delete update_load['producer'];

            bookingsLoadsService.save(update_load).then(function () {
                vm.showAlterLoadPopup = false;
            });
        }

        function cancelLoad() {
            var update_load = angular.copy(vm.current_load);
            update_load.currentStatus = "cancelled";
            delete update_load['_links'];

            bookingsLoadsService.save(update_load).then(function () {
                vm.showAlterLoadPopup = false;
            });
        }

        function showAlterLoadConfirmation() {
            vm.showAlterLoadPopup = false;
            vm.showCancelLoadPopup = true;
        }

        // BY
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
            var contact_data = angular.copy(vm.current_booking);
            contact_data.contactStatus = vm.current_producer.contactStatus = status;

            contact_data.runDate = moment(contact_data.runDate).format('YYYY-MM-DD');
            contact_data.deliveryDate = moment(contact_data.deliveryDate).format('YYYY-MM-DD');
            contact_data.bookingDate = moment(contact_data.bookingDate).format('YYYY-MM-DD');

            bookingsService.save(contact_data).then(function () {
                vm.showProducerContact = false;
            });
        }

        function goto(state) {
            $state.go(state, {data: {truck: vm.truck}});
        }
    }
})();