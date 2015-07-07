
var app=angular.module("app",["leaflet-directive"]);
var blueColorScale = chroma
.scale(['#D5E3FF', '#5E7EA5'])
.domain([0,1]);


app.factory("ColorFactory",[function(){
	return {
		blueColor: function () {
			var randomValue = Math.random();
			return blueColorScale(randomValue).hex();
		}
	};
}]);



app.controller('MainController',['$scope', 'ColorFactory',function($scope,ColorFactory){


}]);


app.controller('MapController',['$scope', '$http', 'ColorFactory',function($scope, $http,ColorFactory){

	angular.extend($scope, {
        center: {
            lat: 0,
            lng: 0,
            zoom: 5
        }
    });

    
    // Get the countries geojson data from a JSON
        $http.get("../geo/map.json").success(function(data, status) {
            angular.extend($scope, {
                geojson: {
                    data: data,
                    style: {
                        fillColor: ColorFactory.blueColor(),
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7
                    }
                }
            });
        });

    $scope.interactivity = "";
    $scope.flag = "";


}]);



