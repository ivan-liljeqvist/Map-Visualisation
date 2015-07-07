<img src="http://osmbuildings.org/logo.svg" width="100" height="88">

OSM Buildings is a JavaScript library for visualizing OpenStreetMaps building geometry on interactive maps.

**Example** http://osmbuildings.org/

**For the new WebGL version, check out https://github.com/OSMBuildings/OSMBuildings
All versions will eventually land over there.**


## Deprecation notice

Former methods `loadData()`, `setData()`, `setStyle()`, `setDate()` are deprecated since v0.2.2
Equivalent replacements are `load()`, `set()`, `style()`, `date()`.

It's safe use the [master branch](https://github.com/kekscom/osmbuildings/tree/master/dist/) for production.

For further information visit http://osmbuildings.org, follow [@osmbuildings](https://twitter.com/osmbuildings/) on Twitter or report issues [here on Github](https://github.com/kekscom/osmbuildings/issues/).


## Documentation

### Integration with Leaflet

Link Leaflet and OSM Buildings files in your HTML head section.

~~~ html
<head>
  <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css">
  <script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
  <script src="OSMBuildings-Leaflet.js"></script>
</head>
~~~

Initialize the map engine and add a map tile layer.<br>
Position is set to Berlin at zoom level 17, I'm using MapBox tiles here.

~~~ javascript
var map = new L.Map('map').setView([52.52020, 13.37570], 17);
new L.TileLayer('http://{s}.tiles.mapbox.com/v3/<YOUR KEY HERE>/{z}/{x}/{y}.png',
  { attribution: 'Map tiles &copy; <a href="http://mapbox.com">MapBox</a>', maxZoom: 17 }).addTo(map);
~~~

Add the buildings layer.

~~~ javascript
new OSMBuildings(map).load();
~~~

As a popular alternative, you could pass a <a href="http://www.geojson.org/geojson-spec.html">GeoJSON</a> FeatureCollection object.<br>
Geometry types Polygon, Multipolygon and GeometryCollection are supported.<br>
Make sure the building coordinates are projected in <a href="http://spatialreference.org/ref/epsg/4326/">EPSG:4326</a>.<br>
Height units m, ft, yd, mi are accepted, no given unit defaults to meters.

~~~ javascript
var geoJSON = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [13.37356, 52.52064],
        [13.37350, 52.51971],
        [13.37664, 52.51973],
        [13.37594, 52.52062],
        [13.37356, 52.52064]
      ]]
    },
    "properties": {
      "wallColor": "rgb(255,0,0)",
      "roofColor": "rgb(255,128,0)",
      "height": 500,
      "minHeight": 0
    }
  }]
};

new OSMBuildings(map).set(geoJSON);
~~~


### Integration with OpenLayers

Link OpenLayers and OSM Buildings files in your HTML head section.

~~~ html
<head>
  <script src="http://www.openlayers.org/api/OpenLayers.js"></script>
  <script src="OSMBuildings-OpenLayers.js"></script>
</head>
~~~

Initialize the map engine and add a map tile layer.<br>
Position is set to Berlin at zoom level 17.

~~~ javascript
var map = new OpenLayers.Map('map');
map.addControl(new OpenLayers.Control.LayerSwitcher());

var osm = new OpenLayers.Layer.OSM();
map.addLayer(osm);

map.setCenter(
  new OpenLayers.LonLat(13.37570, 52.52020)
    .transform(
      new OpenLayers.Projection('EPSG:4326'),
      map.getProjectionObject()
    ),
  17
);
~~~

Add the buildings layer.

~~~ javascript
new OSMBuildings(map).load();
~~~


## API

### Constructors

<table>
<tr>
<th>Constructor</th>
<th>Description</th>
</tr>

<tr>
<td>new OSMBuildings(map)</td>
<td>Initializes the buildings layer for a given map engine.<br>
Currently Leaflet and OpenLayers are supported.</td>
</tr>
</table>

Constants

<table>
<tr>
<th>Option</th>
<th>Type</th>
<th>Description</th>
</tr>

<tr>
<td>ATTRIBUTION</td>
<td>String</td>
<td>Holds OSM Buildings copyright information.</td>
</tr>

<tr>
<td>VERSION</td>
<td>String</td>
<td>Holds current version information.</td>
</tr>
</table>

Methods

<table>
<tr>
<th>Method</th>
<th>Description</th>
</tr>

<tr>
<td>style({Object})</td>
<td>Set default styles. See below for details.</td>
</tr>

<tr>
<td>date(new Date(2015, 15, 1, 10, 30)))</td>
<td>Set date/time for shadow projection.</td>
</tr>

<tr>
<td>each({Function})</td>
<td>A callback wrapper to override each feature's properties on read. Return false in order to skip a particular feature.<br>
Callback receives a feature object as argument.</td>
</tr>

<tr>
<td>click({Function})</td>
<td>A callback wrapper to handle click events on features.<br>
Callback receives an object { featureId{number,string}, lat{float}, lon{float} } as argument.</td>
</tr>

<tr>
<td>set({GeoJSON FeatureCollection})</td>
<td>Just add GeoJSON data to your map.</td>
</tr>

<tr>
<td>load({Provider})</td>
<td>Without parameter, it loads OpenStreetMap data tiles via an OSM Buildings proxy. This proxy enables transparent data filtering and caching.
Interface of such provider is to be published.</td>
</tr>

<tr>
<td>getDetails(id, {Function})</td>
<td>Convenience method to load additional feature information from data provider. Callback function receives a GeoJSON FeatureCollection.</td>
</tr>

<tr>
<td>screenshot({Boolean})</td>
<td>Creates a screenshot of all visible OSM Buildings content and returns it as data URL. Parameter indicates, whether browser should display the image directly.</td>
</tr>
</table>

Styles

<table>
<tr>
<th>Option</th>
<th>Type</th>
<th>Description</th>
</tr>

<tr>
<td>color/wallColor</td>
<td>String</td>
<td>Defines the objects default primary color. I.e. #ffcc00, rgb(255,200,200), rgba(255,200,200,0.9)</td>
</tr>

<tr>
<td>roofColor</td>
<td>String</td>
<td>Defines the objects default roof color.</td>
</tr>

<tr>
<td>shadows</td>
<td>Boolean</td>
<td>Enables or disables shadow rendering, default: enabled</td>
</tr>
</table>


## Data

### OSM Tags used

<table>
<tr>
<th>GeoJSON property</th>
<th>OSM Tags</th>
</tr>

<tr>
<td>height</td>
<td>height, building:height, levels, building:levels</td>
</tr>

<tr>
<td>minHeight</td>
<td>min_height, building:min_height, min_level, building:min_level</td>
</tr>

<tr>
<td>color/wallColor</td>
<td>building:color, building:colour</td>
</tr>

<tr>
<td>material</td>
<td>building:material, building:facade:material, building:cladding</td>
</tr>

<tr>
<td>roofColor</td>
<td>roof:color, roof:colour, building:roof:color, building:roof:colour</td>
</tr>

<tr>
<td>roofMaterial</td>
<td>roof:material, building:roof:material</td>
</tr>

<tr>
<td>shape</td>
<td>building:shape[=cylinder,sphere]</td>
</tr>

<tr>
<td>roofShape</td>
<td>roof:shape[=dome]</td>
</tr>

<tr>
<td>roofHeight</td>
<td>roof:height</td>
</tr>
</table>
