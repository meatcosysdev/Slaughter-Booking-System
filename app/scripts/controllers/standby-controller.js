(function () {
    angular.module('BookingsApp')
        .controller('StandbyListController', standbyListController);

    standbyListController.$inject = ['$timeout', 'producerService', 'bookingsService', 'bookingsLoadsService', 'CONFIG'];

    // Declarations
    function standbyListController($timeout, producerService, bookingsService, bookingsLoadsService, CONFIG) {
        var vm = this;

        // PROPERTIES
        vm.standByStatusText = CONFIG.standby_status;

        vm.search = {};
        vm.day_rule = moment().toDate();
        vm.current_truck = {
            lead_days: 2,
            truck_size: 2,
            preferred_date_from: moment().toDate(),
            preferred_date_until: moment().toDate(),
        };

        // METHODS
        vm.getProducersList = getProducersList;
        vm.selectProducer = selectProducer;
        vm.addNewTruck = addNewTruck;
        vm.addProducerLoadToTruck = addProducerLoadToTruck;
        vm.removeProducerLoadFromTruck = removeProducerLoadFromTruck;
        vm.selectTruckLoad = selectTruckLoad;
        vm.saveStandBy = saveStandBy;
        vm.onSaveStandByEnd = onSaveStandByEnd;

        vm.validateDate = validateDate;

        //  ----------------------------------- IMPLEMENTATIONS -----------------------------------
        // PRODUCER
        function getProducersList() {
            producerService.get_all_producers(vm.search).then(function (response) {
                console.log(response['_embedded'])
                vm.producers = (response['_embedded']['producers'] || []).map(function(p) {
                    p.id = p['_links']['producer']['href'].split('/').pop();

                    return p;
                });
            })
        }

        function selectProducer(producer) {
            producer.isSelected = !producer.isSelected;

            vm.producers.forEach(function (p) {
                if (p.id != producer.id) p.isSelected = false;
            });

            if (producer.isSelected) {
                vm.current_producer = producer;
            } else {
                delete vm.current_producer;
            }
        }

        function addProducerLoadToTruck() {
            if (vm.current_producer.load_size > vm.current_truck.space_left) {
                toastr.warning("There is not enough space left in the truck!");
                return;
            }

            vm.current_truck['loads'].push({
                load_size: vm.current_producer.load_size,
                producerNo: vm.current_producer.producerNo,
                legalName: vm.current_producer.legalName,
            });

            vm.current_truck.space_left = vm.current_truck.space_left - vm.current_producer.load_size;
        }

        // TRUCK
        function addNewTruck() {
            vm.current_truck.loads = [];
            vm.current_truck.wasAdded = true;
            vm.current_truck.space_left = vm.current_truck.truck_size;
            vm.disableTruck = true;
        }

        function selectTruckLoad(load, index) {
            load.index = index;

            var isSelected = load.isSelected;
            vm.current_truck.loads.forEach(function (l) {
                l.isSelected = false;
            });

            load.isSelected = !isSelected;

            if (load.isSelected) {
                vm.current_load = load;
            } else {
                delete vm.current_load;
            }
        }

        function removeProducerLoadFromTruck() {
            vm.current_truck.loads.splice(vm.current_load.index, 1);
            vm.current_truck.space_left = parseInt(vm.current_truck.space_left) + parseInt(vm.current_load.load_size);
            delete vm.current_load;
        }

        function saveStandBy() {
            vm.merit_point = 10;
            vm.agreement_form_line_id = 1;
            vm.supply_stream_id = 1;
            vm.origin = 'test';

            var truck_booking = {
                preferredDateFrom: moment(vm.current_truck.preferred_date_from).format('YYYY-MM-DD'),
                preferredDateUntil: moment(vm.current_truck.preferred_date_until).format('YYYY-MM-DD'),
                runDate: moment(vm.current_truck.preferred_date_from).format('YYYY-MM-DD'),
                bookingDate: moment().format('YYYY-MM-DD'),
                deliveryDate: moment().format('YYYY-MM-DD'),
                agreementTypeId: 1,
                supplyStreamId: 3,
                facilityId: 1,
                contactStatus: 'Please Notify',
                meritPoint: vm.merit_point,
                truckSize: vm.current_truck.truck_size,
                currentStatus: vm.standByStatusText,
                createdAt: moment().utc(),
                createdBy: 'admin',
                updatedAt: moment().utc(),
                updatedBy: 'admin'
            };


            // SAVE TRUCK-BOOKING
            bookingsService.save(truck_booking).then(function (new_truck_booking) {
                var sb = {
                    preferred_date_from: moment(vm.current_truck.preferred_date_from).format('YYYY-MM-DD'),
                    preferred_date_until: moment(vm.current_truck.preferred_date_until).format('YYYY-MM-DD'),
                    lead_days: vm.current_truck.lead_days,
                    truck_size: vm.current_truck.truck_size,
                    booking_truck_id: new_truck_booking.id,
                    merit_point: vm.merit_point,
                    current_status: 'created',
                    supply_stream_id: vm.supply_stream_id
                };

                // SAVE STANDBY
                bookingsService.save_stand_by(sb).then(function (sb_response) {
                    vm.current_truck.loads.forEach(function (l) {

                        var load = {
                            standby_id: sb_response.id,
                            booking_truck_id: new_truck_booking.id,
                            agreement_form_line_id:  vm.agreement_form_line_id,
                            producerNo: l.producerNo,
                            quantity: l.load_size,
                            merit_point: vm.merit_point,
                            origin: vm.origin,
                            current_status: 'created',
                        };

                        // SAVE TRUCK BOOKING LOAD
                        bookingsLoadsService.save(load);
                    });

                    $timeout(function () {
                       //vm.onSaveStandByEnd();
                    }, 2000)
                });
            });
        }

        function onSaveStandByEnd() {
            vm.current_producer = {};

            vm.current_truck = {
                preferred_date_from: moment().toDate(),
                preferred_date_until: moment().toDate(),
                loads: []
            };

            vm.producers.forEach(function (l) {
                l.isSelected = false;
            });
        }

        function validateDate() {
            vm.dateErrorMessages = [];
            if (vm.current_truck.preferred_date_from > vm.current_truck.preferred_date_until) vm.dateErrorMessages.push("Start date can't exceed end date");
            if (vm.current_truck.preferred_date_from < vm.day_rule) vm.dateErrorMessages.push("Start date can't be in the past");
            if (vm.current_truck.preferred_date_until < vm.day_rule) vm.dateErrorMessages.push("End date can't be in the past");
        }
    }
})();