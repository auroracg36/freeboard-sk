var $ =require('jquery');
window.$ = window.jQuery = require('jquery');
require('bootstrap');
require('bootstrap-drawer');
require('bootstrap-toggle');
 
var ol = require('openlayers');
var addBaseLayers = require('./lib/addBaseLayers.js');
var addChartLayers = require('./lib/addLayers.js');
//var drawFeatures = require('./lib/drawFeatures.js');
//var displayFeatureInfo = require('./lib/displayFeatureInfo.js');

var menuControl = require('./lib/menuControl.js');
//var anchor = require('./lib/anchorControl.js');

var wsServer = require('./lib/signalk.js');
var simplify = require('./lib/simplify-js.js');


var view= new ol.View({
	center: ol.proj.transform([65, 50], 'EPSG:4326', 'EPSG:3857'),
	zoom: 3
})

var mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  //className: 'custom-mouse-position',
  //target: document.getElementById('mouse-position'),
  undefinedHTML: '&nbsp;'
});

var map = new ol.Map({
	interactions: ol.interaction.defaults().extend([new ol.interaction.DragRotateAndZoom()]),
	target: 'map',
	layers: [
		/*, new ol.layer.Tile({
         source: new ol.source.TileDebug({
             projection: 'EPSG:3857',
             tileGrid: new ol.tilegrid.XYZ({
					 maxZoom: 22
				 })
        })
     })*/
	],
	view: view,
	controls: ol.control.defaults({
		attributionOptions: {
			collapsible: true
		}
	}).extend([ mousePositionControl, new menuControl.AnchorControl(), new menuControl.ChartControl()]) 
});

//add our layers
addBaseLayers(map);
addChartLayers(map);

var vesselPosition = require('./lib/vesselPosition.js');
wsServer.addSocketListener(vesselPosition);
//wsServer.addSocketListener(anchor);
var vesselOverlay = vesselPosition.getVesselOverlay(map);

function dispatch(delta) {
	//do nothing
}
function connect(){
	var sub = '{"context":"vessels.self","subscribe":[{"path":"navigation.position.*"}]}';
	connection.send(sub);
}

var connection = wsServer.connectDelta(window.location.host, dispatch, connect);

//drawFeatures.setup(connection, map);
//anchor.setup(connection, map);

// get the interaction type
var $interaction_type = $('[name="interaction_type"]');
$('#interaction_type_draw').prop('checked',true);
// rebuild interaction when changed
$interaction_type.on('click', function(e) {
	// add new interaction
	if (this.value === 'draw') {
		drawFeatures.addDrawInteraction();
	} else {
		drawFeatures.addModifyInteraction();
	}
});

// get geometry type
var $geom_type = $('#geom_type');
$geom_type.val('Point');
// rebuild interaction when the geometry type is changed
$geom_type.on('change', function(e) {
			 console.log('Geom,interaction:'+$('input[name="interaction_type"]:checked').val());
	drawFeatures.setGeomType(this.options[this.selectedIndex].value);
	if ($('input[name="interaction_type"]:checked').val() === 'draw') {
		drawFeatures.addDrawInteraction();
	} 
});

// clear map when user clicks on 'Delete all features'
$("#delete").click(function() {
	drawFeatures.clearMap();
});

