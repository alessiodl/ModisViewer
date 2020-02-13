import '@fortawesome/fontawesome-free/js/all';

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {fromLonLat, transform} from 'ol/proj';
import {Tile as TileLayer, Image as ImageLayer} from 'ol/layer';
import {OSM, ImageArcGISRest, TileArcGISRest} from 'ol/source';

import axios from 'axios';

import 'nouislider/distribute/nouislider.min.css';
import noUiSlider from 'nouislider'
import moment from 'moment';

const lstd_url = "https://webgis.izs.it/arcgis/rest/services/Modis/MOD11C3_0_LSTD/ImageServer";
const lstn_url = "https://webgis.izs.it/arcgis/rest/services/Modis/MOD11C3_5_LSTN/ImageServer";
const ndvi_url = "https://webgis.izs.it/arcgis/rest/services/Modis/MOD13C2_0_NDVI/ImageServer";
const evi_url  = "https://webgis.izs.it/arcgis/rest/services/Modis/MOD13C2_1_EVI/ImageServer";

// *******************************************
// Map
// *******************************************
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

map.on('click', function(evt) {
  requestModisValues(evt.coordinate);
});

// *******************************************
// MODIS Layer
// *******************************************
var modisSource = new ImageArcGISRest({
  ratio: 1,
  params: {
    TIME: "1420066800000,1422745200000",
  },
  url: lstd_url
});

var modisLayer = new ImageLayer({
  source: modisSource
});

modisSource.on('imageloadstart', function() {
  // console.log('Inizio caricamento')
  document.querySelector('#loading-div').innerHTML='<br/><i class="fas fa-spinner fa-spin"></i> Loading MODIS data';
});

modisSource.on('imageloadend', function() {
  // console.log('Fine caricamento')
  document.querySelector('#loading-div').innerHTML="";
});

map.addLayer(modisLayer);


// *******************************************
// Date slider control
// *******************************************
function timestampStr(str) {
  return new Date(str).getTime();
}

var slider = document.querySelector('#slider');

noUiSlider.create(slider, {
    start: 0,
    step: 1,
    connect: true,
    range: {
      min: 0,
      max: 11
    },
});

var month = document.querySelector("#month");
var timestamp = document.querySelector("#timestamp");
const range = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const updateTimeFilter = function(timestr){
  let starttime = timestr;
  let endtime = moment(new Date(timestr)).add(1,'month');
  // console.log(starttime);
  // console.log(new Date(endtime).getTime());
  let timeinterval = starttime+","+ new Date(endtime).getTime().toString()
  // console.log(timeinterval)
  modisLayer.getSource().updateParams({TIME:timeinterval});
  // Reset click value field
  document.querySelector("#click-result").innerHTML = "Click on the map...";
};

slider.noUiSlider.on('update', function (values, handle) {
  var month_number = parseInt(values[handle])+1;
  month.innerHTML = range[parseInt(values[handle])] + ", " + document.querySelector("#modis_year").value;
  var timestampvalue = timestampStr(document.querySelector("#modis_year").value+","+month_number.toString()+",01");
  // timestamp.innerHTML = "Timestamp: "+timestampvalue;
  updateTimeFilter(timestampvalue)
});

// Change MODIS PRODUCT
// ********************
const selectModis = document.querySelector('#modis_product');

selectModis.addEventListener('change', (event) => {
  let product = event.target.value;
  if (product == 'LSTD'){
    modisLayer.getSource().setUrl(lstd_url);
  } else if (product == 'LSTN'){
    modisLayer.getSource().setUrl(lstn_url);
  } else if (product == 'NDVI'){
    modisLayer.getSource().setUrl(ndvi_url);
  } else {
    modisLayer.getSource().setUrl(evi_url);
  }
});

// Change MODIS YEAR
// ********************
const selectYear = document.querySelector('#modis_year');

selectYear.addEventListener('change', (event) => {
  let year = event.target.value;
  let value = slider.noUiSlider.get();
  let monthValue = parseInt(value) + 1;
  let start = new Date(year,parseInt(monthValue).toString(),'01').getTime();
  updateTimeFilter(start);
  month.innerHTML = range[parseInt(value)] + ", " + year;
});

// Request MODIS VALUES
// ********************
const requestModisValues = function(coordinates) {
  // Transform coordinates from 3857 to 4326
  const coords = transform(coordinates, 'EPSG:3857', 'EPSG:4326');
  let lng = coords[0];
  let lat = coords[1];
  // Read selection
  let url = modisLayer.getSource().getUrl();
  let modis_params = modisLayer.getSource().getParams();
  let modis_time_arr = modis_params.TIME.split(",");
  let modis_samples_date = moment(parseInt(modis_time_arr[0])).format("DD/MM/YYYY");
  // console.log(modis_samples_date);
  
  // Get Samples from Image Service
  axios.get(url+'/getSamples',{
    params:{
        geometry: '{"x":'+lng+',"y":'+lat+'}',
        geometryType:'esriGeometryPoint',
        spatialReference:'{"wkid":4326}',
        mosaicRule:{
          mosaicMethod: "esriMosaicAttributes",
          // where: "Timeref >= DATE '01/01/2019' AND Timeref <= DATE '01/03/2019'",
          where: "Timeref = DATE '"+modis_samples_date+"'",
          sortField: "Timeref"
        },
        outFields:'Name, Timeref',
        returnFirstValueOnly:'false',
        f: 'json'
    }
  }).then(function(response){
    let samples = response.data;
    parseModisValues(samples);
  });
};

const parseModisValues = function(samples){
  let pixel_value = samples.samples[0].value;
  let source_url  = modisLayer.getSource().getUrl()
  if (source_url.includes('LSTD') || source_url.includes('LSTN')){
    // Normalize temperature values
    pixel_value = (pixel_value*0.02)-273.15;
    document.querySelector("#click-result").innerHTML = "Temp. "+pixel_value.toFixed(2)+ "°C";
  } else {
    // Normalize vegetation index values
    pixel_value = pixel_value*0.0001;
    document.querySelector("#click-result").innerHTML = "Veg. Index "+pixel_value.toFixed(3);
  }
  // console.log(pixel_value);
  
}