var app = angular.module('plunker', []);

app.service('keyService', function() {
    this.key = '160f672f62d2f429e0f06fe9eb8cb555';
});

app.controller('ctrl', ['$scope', '$http', '$sce', 'keyService', function($scope, $http, $sce, keyService) {

    /* the spinner */
    $scope.loading = false;
    /* the random indices */
    var indices = [];
    for (var i = 0; i < 3; i++) {
        indices.push(Math.floor(2 + Math.random() * 100));
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

    $scope.returnOne = function(item) {

        $scope.loading = true;
        var newElement = {};
        /* only do this once per image */
        if ($scope.replaced.indexOf(item.index) === -1) {

            var nap = randomDate(new Date(2012, 01, 01), new Date());
            var api = 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=' + keyService.key + '&extras=url_l,' + nap + '&format=json&nojsoncallback=1';

            var random = Math.floor(2 + Math.random() * 50);

            /* get a new item */
            $http({
                    method: 'POST',
                    url: api
                })
                .then(function successCallback(response) {
                    newElement = { id: response.data.photos.photo[random].id, src: response.data.photos.photo[random].url_l, index: item.index };

                    $scope.store.push(response.data.photos.photo[random].id);
                    /* replace with new element */
                    $scope.results.splice(item.index, 1, newElement);
                    /* push index to replaced-store */
                    $scope.replaced.push(item.index);
                })
        } else {
            alert("Elfogytak a lehetőségek.")
            $scope.loading = false;
        }
    };

    /* we'll need to call this when the page is loaded */
    $scope.returnThree = function() {
        $scope.loading = true;
        /* egyelőre odaadjuk neki, később service-ből jöjjön */
        var nap = randomDate(new Date(2012, 01, 01), new Date());
        var api = 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=' + keyService.key + '&extras=url_l,' + nap + '&format=json&nojsoncallback=1';

        /*
        var api = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=160f672f62d2f429e0f06fe9eb8cb555&tags=music&format=json&extras=width_h&privacy_filter=1&sort=interestingness-desc&nojsoncallback=1";
        $sce.trustAsResourceUrl(api);
        */
        $http({
                method: 'POST',
                url: api
            })
            .then(function successCallback(response) {
                $scope.results = [];
                indices.forEach(function(current, index, array) {
                    $scope.results.push({ id: response.data.photos.photo[current].id, src: response.data.photos.photo[current].url_l, index: index });
                    $scope.store.push(response.data.photos.photo[current].id);
                    /*
                    $scope.results.push("https://farm" + response.data.photos.photo[current].farm + ".staticflickr.com/" + response.data.photos.photo[current].server + "/" + response.data.photos.photo[current].id + "_" + response.data.photos.photo[current].secret + "_h.jpg");
                    */
                })
            });
    };
    $scope.returnThree();
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