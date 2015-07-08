 var app = angular.module("app", ["leaflet-directive"]);

 app.controller('MapController', [ "$scope", "$http","leafletData", function($scope, $http,leafletData) {

    /*
        VARIABLES THAT WILL BE USED FOR THE MAP.
    */

    //geoJSON for the 3D shapes.
    var geoJSON = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "MultiPolygon",
          "coordinates": [
          [
          [
          [13.32746, 52.49440],
          [12.914, 52.49494],
          [13.33, 52.49492],
          [12.928, 52.49442],
          [12.928, 52.41428],
          [12.929, 52.49480],
          [13.33, 52.49478],
          [13.33, 52.41422],
          [13.34, 52.41440]
          ]
          ]
          ]
      },
      "properties": {
          "color": "rgb(0,200,0)",
          "height": 120
      }
    },{
        "type": "Feature",
        "geometry": {
          "type": "MultiPolygon",
          "coordinates": [
          [
          [
          [13.32746-2, 52.49440],
          [12.914-2, 52.49494],
          [13.33-2, 52.49492],
          [12.928-2, 52.49442],
          [12.928-2, 52.41428],
          [12.929-2, 52.49480],
          [13.33-2, 52.49478],
          [13.33-2, 52.41422],
          [13.34-2, 52.41440]
          ]
          ]
          ]
      },
          "properties": {
              "color": "rgb(0,0,255)",
              "height": 80
          }
      }]
    };

    //Colors that will be used to color the countries.
    var continentProperties= {
        "009": {
            name: 'Oceania',
            colors: [ '#CC0066', '#993366', '#990066', '#CC3399', '#CC6699' ]
        },
        "019": {
            name: 'America',
            colors: [ '#006699', '#336666', '#003366', '#3399CC', '#6699CC' ]
        },
        "150": {
            name: 'Europe',
            colors: [ '#CC0066', '#993366', '#990066', '#CC3399', '#CC6699','#FF0000','#FFCC00', '#CC9933', '#999900', '#FFCC33', '#FFCC66','#00CC00', '#339933', '#009900', '#33FF33', '#66FF66', '#CC3333', '#990000', '#FF3333', '#FF6666','#006699', '#336666', '#003366', '#3399CC', '#6699CC' ]
        },
        "002": {
            name: 'Africa',
            colors: [ '#00CC00', '#339933', '#009900', '#33FF33', '#66FF66' ]
        },
        "142": {
            name: 'Asia',
            colors: [ '#FFCC00', '#CC9933', '#999900', '#FFCC33', '#FFCC66' ]
        },
    };

    //Configuration for the heat map.
    var heatmap_config = {
      // radius should be small ONLY if scaleRadius is true (or small radius is intended)
      // if scaleRadius is false it will be the constant radius used in pixels
      "radius": 2,
      "maxOpacity": .3, 
      // scales the radius based on map zoom
      "scaleRadius": true, 
      // if set to false the heatmap uses the global maximum for colorization
      // if activated: uses the data maximum within the current map boundaries 
      //   (there will always be a red spot with useLocalExtremas true)
      "useLocalExtrema": true,
      // which field name in your data represents the latitude - default "lat"
      latField: 'lat',
      // which field name in your data represents the longitude - default "lng"
      lngField: 'lng',
      // which field name in your data represents the data value - default "value"
      valueField: 'count',
      gradient: {
        // enter n keys between 0 and 1 here
        // for gradient color customization
        '0': 'red',
        '.8': 'yellow',
        '.95': 'green'
     }
    };

    /*
        END OF VARIABLES.
    */

    /*
        Default data in the scope.
    */

    angular.extend($scope, {
        center: {
            lat: 32.50440,
            lng: 23.33522,
            zoom: 3
        },
        legend: {
            colors: [ '#CC0066', '#006699', '#FF0000', '#00CC00', '#FFCC00' ],
            labels: [ 'Oceania', 'America', 'Europe', 'Africa', 'Asia' ]
        },
        layers: {
            baselayers: {
                main_map: {
                    name: 'Main Map',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz'
                }
            }
        }
    });


    

    /*
        Add the 3D shapes.
    */

    var osmb;

    leafletData.getMap().then(function(map) {

       
    });

    /*
        Heatmap and Shadowmap
    */


    var heatLayer = new HeatmapOverlay(heatmap_config);
    var heatData=[];
    var shadowData=[];

    var markerLayer = new L.MarkerClusterGroup({ spiderfyOnMaxZoom: true, showCoverageOnHover: true, zoomToBoundsOnClick: true });
    var shadowLayer = L.TileLayer.maskCanvas({
                           radius: 80000,  // radius in pixels or in meters (see useAbsoluteRadius)
                           useAbsoluteRadius: true,  // true: r in meters, false: r in pixels
                           color: '#000',  // the color of the layer
                           opacity: 0.5,  // opacity of the not covered area
                           noMask: false,  // true results in normal (filled) circled, instead masked circles
                           lineColor: '#A00'   // color of the circle outline if noMask is true

                    });

    $.ajax({
        dataType: "json",
        url: "../geo/cities-large.geojson",
        success: function(data) {
            $(data.features).each(function(key, data) {
                                        //district_boundary.addData(data);
                                        markerLayer.addLayer(new L.Marker([data.geometry.coordinates[1],data.geometry.coordinates[0]]));

                                        shadowData.push(data.geometry.coordinates.reverse());
                                        //searchData.push({"loc":data.geometry.coordinates,"title":fakeOperators[Math.floor(Math.random()*fakeOperators.length)]+" Telecom Tower "+count});
                                        heatData.push({"lat":data.geometry.coordinates[0],"lng":data.geometry.coordinates[1],"count":10});

                                    });

            leafletData.getMap().then(function(map) {
                //add heatmap 
                map.addLayer(heatLayer);
                heatLayer.setData({data:heatData});
                //don't show heatmap from the beginning (we still had to add it to 'init')
                map.removeLayer(heatLayer);

                //add markers
                map.addLayer(markerLayer); 

                //add shadow layer
                shadowLayer.setData(shadowData);
                map.addLayer(shadowLayer);

                //add 3D layer
                osmb = new OSMBuildings(map).set(geoJSON);
            });

    }}).error(function() {});

    /*
        Buttons for switching between heatmap and shadowmap.
    */

    leafletData.getMap().then(function(map) {
        L.easyButton('fa fa-mobile fa-2x', function(btn, map){
          map.removeLayer(shadowLayer);
          map.addLayer(heatLayer);

          //don't let the 3D layer to be hidden behind the heatmap
          bring3DToFront(map);
          //make the heatlayer click-through
          $(".leaflet-zoom-hide").css("pointer-events", "none");
        }).addTo( map ); 

        L.easyButton('fa fa-star-half-o fa-2x', function(btn, map){
          map.addLayer(shadowLayer);
          map.removeLayer(heatLayer);

          //don't let the 3D layer to be hidden behind the shadow
          bring3DToFront(map);
        }).addTo( map ); 
    });

    function bring3DToFront(map){
        /*
            Maybe there is a better way. bringToFront() doesn't seem to work here.
            Removing and adding works.
        */
        map.removeLayer(osmb);
        map.addLayer(osmb);
    }


    /*
        Interaction events for the map features.
    */

    $scope.$on("leafletDirectiveGeoJson.mouseover", function(ev, leafletPayload) {
        countryMouseover(leafletPayload.leafletObject.feature, leafletPayload.leafletEvent);
    });

    $scope.$on("leafletDirectiveGeoJson.click", function(ev, leafletPayload) {
        countryClick(leafletPayload.leafletObject, leafletPayload.leafletEvent);
    });


    function countryClick(country, event) {
        leafletData.getMap().then(function(map) {
            map.fitBounds(country.getBounds());
        });
    }

    // Mouse over function, called from the Leaflet Map Events
    function countryMouseover(feature, leafletEvent) {
        var layer = leafletEvent.target;
        layer.setStyle({
            weight: 2,
            color: '#666',
            fillColor: 'white'
        });
        layer.bringToFront();
        $scope.selectedCountry = feature;
        console.log(feature);
    }

    /*
        Methods for styling the countries.
    */

    // Get a country paint color from the continents array of colors
    function getColor(country) {
        if (!country || !country["region-code"]) {
            return "#FFF";
        }

        var colors = continentProperties[country["region-code"]].colors;
        var index = country["alpha-3"].charCodeAt(0) % colors.length ;
        return colors[index];
    }

    function style(feature) {
        return {
            fillColor: getColor($scope.countries[feature.id]),
            weight: 0.2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8
        };
    }

    

    /*
        Load the countries.
    */

    $http.get("json/countries.meta.json").success(function(data, status) {

            // Put the countries on an associative array
            $scope.countries = {};
            for (var i=0; i< data.length; i++) {
                var country = data[i];
                $scope.countries[country['alpha-3']] = country;
            }

            // Get the countries geojson data from a JSON
            $http.get("json/countries.geo.json").success(function(data, status) {
                angular.extend($scope, {
                    geojson: {
                        data: data,
                        style: style,
                        resetStyleOnMouseout: true
                    },
                    selectedCountry: {}
                });
            });
        });
    }]);