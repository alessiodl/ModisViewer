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
    }),
    new ImageLayer({
      source: new ImageArcGISRest({
        ratio: 1,
        params: {
          TIME: "1548975600000,1551394800000"
        },
        url: ndvi_url
      })
    })
  ],
  view: new View({
    center: fromLonLat([14, 42]),
    zoom: 5
  })
});