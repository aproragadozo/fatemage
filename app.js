var app = angular.module('plunker', ['ngDialog']);

app.service('keyService', function() {
    this.key = '160f672f62d2f429e0f06fe9eb8cb555';
});

app.controller('ctrl', ['$scope', '$http', 'ngDialog', 'keyService', function($scope, $http, ngDialog, keyService) {

    /* the modal */
    $scope.showModal = function(index) {
        ngDialog.openConfirm({
            template: 'modal.html',
            className: 'ngdialog-theme-default',
            scope: $scope,
            data: { index: index }
        });
    };

    /* the spinner */
    $scope.loading = false;
    /* the random indices */
    var indices = [];
    for (var i = 0; i < 3; i++) {
        indices.push(Math.floor(1 + Math.random() * 100));
    }
    /* the date utility functions */
    function dateToYMD(date) {
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    }

    function randomDate(start, end) {
        var date = new Date(+start + Math.random() * (end - start));
        return dateToYMD(date);
    }
    /* here's where we'll keep track of the images (this should be sessionstorage */
    $scope.store = [];
    /* here's where we'll keep track of whether an image had been replaced already (this should also be sessionstorage */
    $scope.replaced = [];


    /* this is the sub-function we'll call when we need three new items */
    $scope.cleanInit = function(adat, current, index) {
        $scope.results.push({ id: adat.data.photos.photo[current].id, src: adat.data.photos.photo[current].url_l, index: index });
    };

    /*  the sub-function to call when we find a duplicate and need to replace it
        this should be almost exactly like returnOne */
    $scope.replaceDuplicate = function() {
        $scope.loading = true;

        var newItem = {};

        var nap = randomDate(randomDate(new Date(2012, 01, 01), new Date(2016, 12, 31)), new Date());
        var api = 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=' + keyService.key + '&date=' + nap + '&extras=url_l&per_page=500&format=json&nojsoncallback=1';

        var random = Math.floor(2 + Math.random() * 500);

        /* get a new item */
        $http({
                method: 'POST',
                url: api
            })
            .then(function successCallback(response) {
                newItem = { id: response.data.photos.photo[random].id, src: response.data.photos.photo[random].url_l, index: item.index };

                /*  when writing to sessionstorage, get it first,
                    then add to it, then put it back */
                $scope.store = JSON.parse(sessionStorage.getItem("images"));
                $scope.store.push(response.data.photos.photo[random].id);
                sessionStorage.setItem("images", JSON.stringify($scope.store));

                /* replace the last item in results with the new one */
                $scope.results.splice(-1, 1, newItem);
            })
    }
    $scope.returnOne = function(index) {

        $scope.loading = true;
        var newElement = {};
        /* only do this once per image */
        if ($scope.replaced.indexOf(index) === -1) {

            var nap = randomDate(new Date(2012, 01, 01), new Date());
            var api = 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=' + keyService.key + '&date=' + nap + '&extras=url_l&format=json&nojsoncallback=1';

            var random = Math.floor(2 + Math.random() * 100);

            /* get a new item */
            $http({
                    method: 'POST',
                    url: api
                })
                .then(function successCallback(response) {
                    newElement = { id: response.data.photos.photo[random].id, src: response.data.photos.photo[random].url_l, index: index };

                    $scope.store.push(response.data.photos.photo[random].id);
                    /* replace with new element */
                    $scope.results.splice(index, 1, newElement);
                    /* push index to replaced-store */
                    $scope.replaced.push(index);
                })
        } else {
            alert("Csak egyszer kérhetsz újat.")
            $scope.loading = false;
        }
    };

    /* we'll need to call this when the page is loaded */
    $scope.returnThree = function() {
        $scope.loading = true;
        /* egyelőre odaadjuk neki, később service-ből jöjjön */
        var nap = randomDate(new Date(2012, 01, 01), new Date());
        var api = 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=' + keyService.key + '&date=' + nap + '&extras=url_l&format=json&nojsoncallback=1';

        $http({
                method: 'POST',
                url: api
            })
            .then(function successCallback(response) {
                /* if we have a clean page load, with session storage empty */
                if ($scope.store.length === 0) {
                    $scope.results = [];
                    indices.forEach(function(current, index, array) {
                        $scope.store.push(response.data.photos.photo[current].id);
                        sessionStorage.setItem("images", JSON.stringify($scope.store));
                        $scope.cleanInit(response, current, index);
                    });
                } else {
                    /* get sessionstorage, inspect it, then stringify it back */
                    $scope.store = JSON.parse(sessionStorage.getItem("images"));
                    indices.forEach(function(current, index, array) {
                        if ($scope.store.indexOf(response.data.photos.photo[current].id !== -1)) {
                            /*  replace the image, but not the other two!
                                we'll need to push it to results to call the other function on it */
                            $scope.results.push({ id: response.data.photos.photo[current].id, src: response.data.photos.photo[current].url_l, index: index })
                                /*  assuming the last result is the one we just pushed,
                                    we don't even need a param for replaceDuplicate */
                            $scope.replaceDuplicate();
                        }
                    })

                }
            });
    };
    $scope.returnThree();
}]);

app.controller('promptCtrl', ['$scope', 'close', function($scope, close) {
    $scope.close = function(answer, index) {

    }
}]);

app.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                scope.$apply(attrs.imageonload);
            });
            element.bind('error', function() {
                alert('image could not be loaded');
            });
        }
    };
});