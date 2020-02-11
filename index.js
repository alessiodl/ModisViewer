import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {fromLonLat} from 'ol/proj';
import {Tile as TileLayer, Image as ImageLayer} from 'ol/layer';
import {OSM, ImageArcGISRest, TileArcGISRest} from 'ol/source';

const lstd_url = "https://webgis.izs.it/arcgis/rest/services/Modis/MOD11C3_0_LSTD/ImageServer";
const lstn_url = "https://webgis.izs.it/arcgis/rest/services/Modis/MOD11C3_5_LSTN/ImageServer";
const ndvi_url = "https://webgis.izs.it/arcgis/rest/services/Modis/MOD13C2_0_NDVI/ImageServer";
const evi_url  = "https://webgis.izs.it/arcgis/rest/services/Modis/MOD13C2_1_EVI/ImageServer";
/*let fromDate = new Date(2019,01,01).getTime();
let toDate   = new Date(2019,02,01).getTime();
let timefilter = fromDate.toString()+","+toDate.toString();*/

var map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([14, 42]),
    zoom: 5
  })
});

var modisLayer = new ImageLayer({
  source: new ImageArcGISRest({
    ratio: 1,
    params: {
      TIME: "1548975600000,1551394800000"
    },
    url: ndvi_url
  })
});

map.addLayer(modisLayer);

// TO DO - build slider control

setTimeout(function(){
  // Change period
  modisLayer.getSource().updateParams({TIME:"1556661600000,1559340000000"})
},2500)

setTimeout(function(){
  // Change period
  modisLayer.getSource().updateParams({TIME:"1564610400000,1567288800000"})
},3500)

setTimeout(function(){
  // Change IMAGE
  modisLayer.getSource().setUrl(lstd_url);
},5000)
