 var app = angular.module("app", ["leaflet-directive"]);

 app.controller('MapController', [ "$scope", "$http","leafletData", function($scope, $http,leafletData) {

    $scope.zoomIn = function() {
        leafletData.getMap().then(function(map) {
            map.setZoom(map.getZoom()+1);
        });
    }

    $scope.zoomOut = function() {
        leafletData.getMap().then(function(map) {
            map.setZoom(map.getZoom()-1);
        });
    }

    /*
        VARIABLES THAT WILL BE USED FOR THE MAP.
    */

    var geoJSON;
    var three_d_layer;
    var sidebar;

    /*
        Colors that will be used to color the countries.
    */

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

    /*
        Configuration for the heat map.
    */

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

    var heatLayer = new HeatmapOverlay(heatmap_config);
    var markerLayer = new L.MarkerClusterGroup({ spiderfyOnMaxZoom: true, showCoverageOnHover: true, zoomToBoundsOnClick: true });
    var shadowLayer = L.TileLayer.maskCanvas({
                           radius: 80000,  // radius in pixels or in meters (see useAbsoluteRadius)
                           useAbsoluteRadius: true,  // true: r in meters, false: r in pixels
                           color: '#000',  // the color of the layer
                           opacity: 0.5,  // opacity of the not covered area
                           noMask: false,  // true results in normal (filled) circled, instead masked circles
                           lineColor: '#A00'   // color of the circle outline if noMask is true

                       });
    var heatData=[];
    var shadowData=[];

    /*
        Default data in the scope.
    */

    angular.extend($scope, {
        defaults:{
            closePopupOnClick: false
        },
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
        },
        controls: {
            draw: {}
        },
        markers: {
            osloMarker: {
                lat: 59.91,
                lng: 10.75,
                message: "I want to travel here!",
                focus: true,
                draggable: false
            }
        }
    });

  


    /*
        Load 3D data.
    */

    $.getJSON("../geo/3d_data.json", function(json) {
        geoJSON=json;

        //init layers when we have the initial 3D data.
        initLayers();
        //init buttons on the left side
        initLayerButtons();
        

        leafletData.getMap().then(function(map) {
            sidebar = L.control.sidebar('sidebar').addTo(map);
        });

        initDrawControlls();
    
        initTimelineFirstVersion();
        
    });

    /*
        Heatmap and Shadowmap
    */

    function initLayers(){

        /*$.ajax({
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

        

        }}).error(function() {});*/

        initAllLayers();
    }

    function initAllLayers(){
        leafletData.getMap().then(function(map) {
            map.options.closePopupOnClick = false;

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
            //don't show shadowlayer from the beginning (we still had to add it to 'init')
            map.removeLayer(shadowLayer);

            //add 3D layer
            three_d_layer = new OSMBuildings(map).set(geoJSON);

            bring3DToFront();
                    
        });
    }

    /*
        Buttons for switching between heatmap and shadowmap.
    */

    function initLayerButtons(){

            leafletData.getMap().then(function(map) {
                L.easyButton('fa fa-mobile fa-2x', function(btn, map){
                map.removeLayer(shadowLayer);
                map.addLayer(heatLayer);

                //don't let the 3D layer to be hidden behind the heatmap
                bring3DToFront();
                //make the heatlayer click-through
                $(".leaflet-zoom-hide").css("pointer-events", "none");
            }).addTo( map ); 

            L.easyButton('fa fa-server', function(btn, map){
                map.addLayer(shadowLayer);
                map.removeLayer(heatLayer);

                //don't let the 3D layer to be hidden behind the shadow
                bring3DToFront();
            }).addTo( map ); 

            L.easyButton('fa fa-wifi', function(btn, map){
                map.removeLayer(shadowLayer);
                map.removeLayer(heatLayer);

                //don't let the 3D layer to be hidden behind the shadow
                bring3DToFront();
            }).addTo( map );

        });
    }

    function savenote(){
        console.log("save button pressed!");
    }

    function initDrawControlls(){

        leafletData.getMap().then(function(map) {

            var drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);
           
            map.on('draw:created', function (e) {
                var layer = e.layer;

                /* quick and dirty element insertion.  */

                var popup = L.popup()
                .setContent("<center>Bad coverage.<br><br><input type='text' placeholder='Add a note'></input><br><br><button class='savebutton' onclick='alert(\"test\")'>Save</button><br></center>");


                layer.bindPopup(popup);
                drawnItems.addLayer(layer);
                drawnItems.bringToBack();
                
                /*
                    Open the popup when an area has been marked.
                    OBS: this needs to be called after the area is added to the screen.
                */
                layer.openPopup();
            });

            map.on('draw:deleted', function (e) {
                drawnItems.removeLayer(e.layer);
                console.log("removing layer");
                console.log(e.layer);
            });


            // Initialise the draw control and pass it the FeatureGroup of editable layers
            var drawControl = new L.Control.Draw({
                draw:{
                    polyline: false,
                    polygon:false,
                    marker: false
                },
                edit: {
                    featureGroup: drawnItems,
                    edit: {
                      moveMarkers: false
                    }
                }
            });

            map.addControl(drawControl);

        });
    
    }


    function bring3DToFront(){
        /*
            Maybe there is a better way. bringToFront() doesn't seem to work here.
            Removing and adding works.
        */
        leafletData.getMap().then(function(map) {
            map.removeLayer(three_d_layer);
            map.addLayer(three_d_layer);
        });
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
            var new_bounds=country.getBounds();

            var country_width=Math.abs(new_bounds.getNorthEast().lng-new_bounds.getNorthWest().lng);
            var country_height=Math.abs(new_bounds.getNorthEast().lng-new_bounds.getSouthEast().lng);
            var offset=Math.abs(90-country_width)*0.03;

            map.fitBounds([[new_bounds.getNorthEast().lat,new_bounds.getNorthEast().lng-1],
                           [new_bounds.getSouthWest().lat,new_bounds.getSouthWest().lng-1]]);
            
            showSidebar();
        });
    }

    function showSidebar(){
        sidebar.open("home");
    }

    /*
        Mouse over function, called from the Leaflet Map Events
    */

    function countryMouseover(feature, leafletEvent) {
        var layer = leafletEvent.target;
        layer.setStyle({
            weight: 2,
            color: '#666',
            fillColor: 'white'
        });
        layer.bringToFront();
        $scope.selectedCountry = feature;
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
            fillOpacity: 0.1
        };
    }

    function initTimelineFirstVersion(map){

    leafletData.getMap().then(function(map) {
                // Get start/end times
            var startTime = new Date(demoTracks[0].properties.time[0]);
            var endTime = new Date(demoTracks[0].properties.time[demoTracks[0].properties.time.length - 1]);

            // Create a DataSet with data
            var timelineData = new vis.DataSet([{ start: startTime, end: endTime, content: '' }]);

            // Set timeline options
            var timelineOptions = {
              "width":  "100%",
              "height": "120px",
              "style": "box",
              "axisOnTop": true,
              "showCustomTime":true
            };

            // Setup timeline
            var timeline = new vis.Timeline(document.getElementById('timeline'), timelineData, timelineOptions);
                
            // Set custom time marker (blue)
            timeline.setCustomTime(startTime);

             // Playback options
            var playbackOptions = {

                playControl: true,
                dateControl: true,
                
                // layer and marker options
                layer : {
                    pointToLayer : function(featureData, latlng) {
                        var result = {};
                        
                        if (featureData && featureData.properties && featureData.properties.path_options) {
                            result = featureData.properties.path_options;
                        }
                        
                        if (!result.radius){
                            result.radius = 5;
                        }
                        
                        return new L.CircleMarker(latlng, result);
                    }
                },
                
                marker: { 
                    getPopup: function(featureData) {
                        var result = '';
                        
                        if (featureData && featureData.properties && featureData.properties.title) {
                            result = featureData.properties.title;
                        }
                        
                        return result;
                    }
                }
                
            };
                
            // Initialize playback
            var playback = new L.Playback(map, null, onPlaybackTimeChange, playbackOptions);

            playback.setData(demoTracks);    
            playback.addData(blueMountain);

            // Uncomment to test data reset;
            //playback.setData(blueMountain);    

            // Set timeline time change event, so cursor is set after moving custom time (blue)
            timeline.on('timechange', onCustomTimeChange);    

            // A callback so timeline is set after changing playback time
            function onPlaybackTimeChange (ms) {
                timeline.setCustomTime(new Date(ms));
            };

            // 
            function onCustomTimeChange(properties) {
                if (!playback.isPlaying()) {
                    playback.setCursor(properties.time.getTime());
                }        
            }
        });
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

        angular.extend($scope, {
            markers: {
                osloMarker: {
                    lat: 59.91,
                    lng: 10.75,
                    message: "I want to travel here!",
                    focus: true,
                    draggable: false
                },
                swedenMarker: {
                    lat: 59.91,
                    lng: 7.75,
                    message: "I ssswant to travel here!",
                    focus: true,
                    draggable: false
                }
            }
        });


    });
}]);