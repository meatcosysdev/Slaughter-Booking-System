(function () {
    'use strict';

    angular
        .module('BookingsApp.Directives')
        .directive('slideMenu', slideMenu);

    slideMenu.$inject = ['$location', '$timeout'];

    function slideMenu($location, $timeout) {
        slideMenuDirectiveController.$inject = ['$scope', '$rootScope', '$location'];

        return {
            transclude: false,
            scope: {
                msOpen: '=?',
                msSide: '@',
                msSpeed: '@',
                msClass: '@',
                msSize: '@',
            },
            templateUrl: 'views/common/menu.html',
            controller: slideMenuDirectiveController,
            link: link,
        };

        function slideMenuDirectiveController($scope, $rootScope, $location) {
            $scope.msOpen = false; //$(window).width() > 1000;

            $scope.isCurrentPage = isCurrentPage;

            function isCurrentPage(pathStr) {
                var currentPath = $location.path();
                var paths = pathStr.split(',');

                return paths.filter(function (p) {
                        return currentPath.indexOf(p) > -1;
                    }).length > 0;
            }
        }

        function link($scope, el, attrs) {
            var param = {};
            param.side = $scope.msSide || 'left';
            param.speed = $scope.msSpeed || '0.25';
            param.size = $scope.msSize || '230px';
            param.zindex = 100;
            param.className = $scope.msClass || 'ng-pageslide';

            el.addClass(param.className);

            var content = null;
            var slider = null;
            /**/
            var body = param.container ? document.getElementById(param.container) : document.body;

            init(el);

            function init(el) {
                slider = el[0];

                // Check for div tag
                if (slider.tagName.toLowerCase() !== 'div' &&
                    slider.tagName.toLowerCase() !== 'pageslide')
                    throw new Error('Pageslide can only be applied to <div> or <pageslide> elements');

                content = angular.element(slider.children);
                body.appendChild(slider);

                slider.style.zIndex = param.zindex;
                slider.style.position = 'fixed';
                slider.style.width = '20px';
                slider.style.height = 0;
                slider.style.overflow = 'hidden';
                slider.style.transitionDuration = param.speed + 's';
                slider.style.webkitTransitionDuration = param.speed + 's';
                slider.style.transitionProperty = 'width, height';

                switch (param.side) {
                    case 'right':
                        slider.style.height = attrs.psCustomHeight || '100%';
                        slider.style.top = attrs.psCustomTop || '0px';
                        slider.style.bottom = attrs.psCustomBottom || '0px';
                        slider.style.right = attrs.psCustomRight || '0px';
                        break;
                    case 'left':
                        slider.style.height = attrs.psCustomHeight || '100%';
                        slider.style.top = attrs.psCustomTop || '0px';
                        slider.style.bottom = attrs.psCustomBottom || '0px';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        break;
                    case 'top':
                        slider.style.width = attrs.psCustomWidth || '100%';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        slider.style.top = attrs.psCustomTop || '0px';
                        slider.style.right = attrs.psCustomRight || '0px';
                        break;
                    case 'bottom':
                        slider.style.width = attrs.psCustomWidth || '100%';
                        slider.style.bottom = attrs.psCustomBottom || '0px';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        slider.style.right = attrs.psCustomRight || '0px';
                        break;
                }
            }

            // Closed
            function psClose(slider, param) {
                if (slider && slider.style.width !== 0) {
                    if (param.cloak) content.css('display', 'none');
                    slider.style.width = '0';
                    if (param.push) {
                        body.style.left = '0px';
                        body.style.right = '0px';
                    }
                }
                $scope.msOpen = false;
            }

            // Open
            function msOpen(slider, param) {
                if (slider.style.width !== 0) {
                    switch (param.side) {
                        case 'right':
                            slider.style.width = param.size;
                            if (param.push) {
                                body.style.right = param.size;
                                body.style.left = '-' + param.size;
                            }
                            break;
                        case 'left':
                            slider.style.width = param.size;
                            if (param.push) {
                                body.style.left = param.size;
                                body.style.right = '-' + param.size;
                            }
                            break;
                        case 'top':
                            slider.style.height = param.size;
                            if (param.push) {
                                body.style.top = param.size;
                                body.style.bottom = '-' + param.size;
                            }
                            break;
                        case 'bottom':
                            slider.style.height = param.size;
                            if (param.push) {
                                body.style.bottom = param.size;
                                body.style.top = '-' + param.size;
                            }
                            break;
                    }

                    $timeout(function () {
                        if (param.cloak) content.css('display', 'block');
                    }, (param.speed * 1000));

                    $scope.msOpen = true;
                }
            }

            $scope.$watch('msOpen', function (value) {
                if (!!value) {
                    msOpen(slider, param);
                } else {
                    psClose(slider, param);
                }
            });

            $scope.$on('$destroy', function () {
                body.removeChild(slider);
            });
        }
    }
})();