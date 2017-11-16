import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController, Navbar, Platform } from 'ionic-angular';

import L from "leaflet";

//Coordinates, PositionError
import { Geolocation, Geoposition, GeolocationOptions } from '@ionic-native/geolocation';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { ConfigServiceProvider } from '../../providers/config-service/config-service';
import { GeoserverServiceProvider } from '../../providers/geoserver-service/geoserver-service';
import { OpenweathermapServiceProvider } from '../../providers/openweathermap-service/openweathermap-service';
import { DireccionServiceProvider } from '../../providers/direccion-service/direccion-service';
import { HomePage } from '../home/home';
import { PerfilProvider} from '../../providers/perfil/perfil';
import { VueloServiceProvider} from '../../providers/vuelo-service/vuelo-service';
import { ZonasServiceProvider} from '../../providers/zonas-service/zonas-service';
import { Facebook } from '@ionic-native/facebook';


const GEOLOCATION_OPTIONS: GeolocationOptions = {
   maximumAge: 3000, timeout: 5000, enableHighAccuracy: true
};

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})

export class MapPage implements OnDestroy{
  @ViewChild(Navbar) navBar: Navbar;
  map: L.Map;
  center: L.PointTuple;
  following: boolean;
  positionMarker: L.Marker;
  positionAccuracyCircle: L.Circle;
  defaultZoom: number;
  provider: any;
  searchControl: any;
  controlLayer: L.control.layers;
  layers: Array<L.tileLayer>;
  layerNormativa: any;
  latitudActual: number;
  longitudActual: number;
  latitudTemporal: number;
  longitudTemporal: number;
  click: number;
  opcionesVuelo: boolean;
  pedirExcepcion: boolean;
  puedeVolar: boolean;
  loading;
  primeraVez: number;
  radioVuelo: number;
  userProfile: any;
  contadorLoad: number;
  layerGroup: L.layerGroup;

  private geolocationSubscription;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private geolocation: Geolocation,
    public toastCtrl: ToastController, private platform: Platform, 
    private cs: ConfigServiceProvider,  private gs: GeoserverServiceProvider,
    private op: OpenweathermapServiceProvider, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, private ds: DireccionServiceProvider,
    public up: PerfilProvider, private vs: VueloServiceProvider,
    private zs: ZonasServiceProvider, private facebook: Facebook
  ) {
    this.layers = new Array<L.tileLayer>();
    this.ocultarTodasLasOpciones();
    this.puedeVolar = true;
    this.userProfile = null;
    if(this.up.estaLogueado())
      this.userProfile = this.up.getUserProfile();
  }

  ionViewDidLoad() {
    this.layerGroup = L.layerGroup();
    this.goToBack();
    L.Icon.Default.imagePath = this.cs.getBaseImagePath();
    this.mostrarMensaje('Para acceder a la geolocalizacion, activá tu ubicación y presioná el botón Geolocalizacion', 'middle', true, 4000);
    this.latitudActual = -34.60389;
    this.longitudActual = -58.37056;
    this.radioVuelo = 120;
    this.center = [this.latitudActual, this.longitudActual]; //Obelisco
    this.initMap();
    this.initCirculoMarker();
    this.initGeoSearchControl();
    this.mapClick();
    this.contadorLoad = 0;
    //this.mapBaseLayerChange();
  }

  initMap() {
    this.defaultZoom = 14;
    this.map = L.map('map', {
      maxZoom: 17,
      doubleClickZoom: false,
      tap: true
    }).fitWorld();
    this.click = 0;
    this.map.setView(this.center, 6);
    //Add OSM Layer
    /*L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
        .addTo(this.map);*/

    var osmUrl= this.cs.getUrlOsm();
    var osmHumanitarioUrl = this.cs.getUrlOsmHumanitario();
    var osmMapaBase = this.cs.getUrlMapaBase();
	  var osmAttrib= this.cs.getAttribOsm();
    var osm = new L.TileLayer(osmUrl, {minZoom: 3, maxZoom: 17, attribution: osmAttrib});
    var humanitario = new L.TileLayer(osmHumanitarioUrl, {minZoom: 3, maxZoom: 17, attribution: osmAttrib});
    var mapaBase = new L.TileLayer(osmMapaBase, {minZoom: 3, maxZoom: 17, attribution: osmAttrib});
    var baseMaps = {
        "Humanitario": humanitario,
        "Open Streets Maps": osm
    };
    this.layers = new Array<L.tileLayer>();
    this.layers.push(mapaBase);
    this.map.addLayer(mapaBase);
    /*this.controlLayer= L.control.layers(baseMaps).addTo(this.map);*/
    this.layerNormativa = L.geoJSON().addTo(this.map);
    //this.agregarCapa('http://geo.anac.gov.ar/geoserver/anac/wms?', 'anac:helicorredores', 'image/png'); 
  }

  initCirculoMarker(){
    let latlng = this.center;
    this.positionMarker = L.marker(latlng);
    this.positionMarker.addTo(this.map);
    this.positionAccuracyCircle = L.circle(latlng, {radius: this.radioVuelo});
    this.positionAccuracyCircle.addTo(this.map);
  }

  agregarCapa(url, nombre, formato){
    /*this.layers.forEach(layer => {
      this.map.removeLayer(layer);
    });
    this.layers = new Array<L.tileLayer>();*/
    var layer=  L.tileLayer.
      wms(url, {
      layers: nombre,
      format: formato,
      transparent: true
    });
    //this.layers.push(layer);
    this.map.addLayer(layer);
    /*this.gs.getCapaGeoserver(nombre)
      .subscribe(
        geojsonFeature => {
        //this.hideLoad();
        this.layerNormativa.addData(geojsonFeature);
           
      },
      err => {
        console.log(err);
        //this.hideLoad();
        //this.errorWs(err);
        //this.backToHome();
      });*/
  }

  initGeoSearchControl(){
    this.provider = new OpenStreetMapProvider({params: {countrycodes: 'ar'}}); 
    this.searchControl = new GeoSearchControl
                         ({ 
                            provider: this.provider, 
                            style: 'button', 
                            autoClose: true, 
                            showMarker: false,
                            searchLabel: 'Buscar dirección', 
                            keepResult: false 
                         });
    //this.map.on('geosearch/showlocation', this.direccionEncontrada);
    var mapPage = this;
    this.map.addControl(this.searchControl);
    this.map.on('geosearch/showlocation', function(e){
      mapPage.stopFollow();
      mapPage.positionAccuracyCircle.setLatLng(e.marker._latlng);
      mapPage.positionMarker.setLatLng(e.marker._latlng).bindPopup("Dirección encontrada").openPopup();
      mapPage.latitudActual = e.marker._latlng.lat;
      mapPage.longitudActual = e.marker._latlng.lng;
      mapPage.moverA(e.marker._latlng, mapPage.map.getZoom());
    })    
  }

  mapClick(){
    var mapPage = this;
    
    /*this.map.on('dblclick', function(e){
      mapPage.click = 0;
      mapPage.stopFollow();
      let latlng = e.latlng;
      mapPage.positionMarker.setLatLng(latlng).bindPopup("Estas aca").openPopup();
      mapPage.positionAccuracyCircle.setLatLng(latlng);
      mapPage.latitudActual = latlng.lat;
      mapPage.longitudActual = latlng.lng;
      var zoom = mapPage.map.getZoom();
      if(zoom < 7)
        mapPage.moverA(latlng, mapPage.defaultZoom);
      else
        mapPage.moverA(latlng, zoom);
    }); */
    
    this.map.on('click', function(e){
      mapPage.primeraVez = 0;
      mapPage.click = mapPage.click + 1;
      if(mapPage.click == 1){
        setTimeout(function(){ 
          if(mapPage.click > 1){
            mapPage.click = 0;
            mapPage.stopFollow();
            let latlng = e.latlng;
            mapPage.positionMarker.setLatLng(latlng).bindPopup("Ubicación actual").openPopup();
            mapPage.positionAccuracyCircle.setLatLng(latlng);
            mapPage.latitudActual = latlng.lat;
            mapPage.longitudActual = latlng.lng;
            var zoom = mapPage.map.getZoom();
            if(zoom < 7)
              mapPage.moverA(latlng, mapPage.defaultZoom);
            else
              mapPage.moverA(latlng, zoom);
          }
          mapPage.click = 0;
        }, 1300);
      }
    });
  }

  /*pressEvent(e) {
    var mapPage = this;
    mapPage.click = 0;
    mapPage.stopFollow();
    let latlng = e.latlng;
    mapPage.positionMarker.setLatLng(latlng).bindPopup("Estas aca").openPopup();
    mapPage.positionAccuracyCircle.setLatLng(latlng);
    mapPage.latitudActual = latlng.lat;
    mapPage.longitudActual = latlng.lng;
    var zoom = mapPage.map.getZoom();
    if(zoom < 7)
      mapPage.moverA(latlng, mapPage.defaultZoom);
    else
      mapPage.moverA(latlng, zoom);
    mapPage.click = 0;
  }*/

  mapBaseLayerChange(){
    var mapPage = this;
    this.map.on('baselayerchange', function(e){
      mapPage.agregarCapa('http://geo.anac.gov.ar/geoserver/anac/wms?', 'anac:helicorredores', 'image/png');
    }); 
  }

  mostrarMensaje(mensaje, posicion, botonCerrar, duracion){
    let toast = this.toastCtrl.create({
      message: mensaje,
      position: posicion,
      //showCloseButton: botonCerrar,
      duration: duracion
    });
    toast.present();
  }

  toggleFollow() {
    this.following = !this.following;

    if (this.following) {
      this.startFollow();
    } else {
      this.stopFollow();
    }
  }

  startFollow() {
    this.primeraVez = 0;
    this.following = true;
    this.map.setZoom(this.defaultZoom);
    this.geolocationSubscription = this.geolocation.watchPosition(GEOLOCATION_OPTIONS)
      //.filter((p) => p.coords !== undefined) //Filter Out Errors
      .subscribe(position => {
        this.updateGeoposition(position);
      });
  }

  stopFollow() {
    this.primeraVez = 0;
    this.following = false;
    if(this.geolocationSubscription != undefined)
      this.geolocationSubscription.unsubscribe();
  }

  updateGeoposition(position: Geoposition) {
    if(position.coords != undefined){
      let latlng = {lat: position.coords.latitude, lng: position.coords.longitude, date: new Date()};
      this.positionMarker.setLatLng(latlng).bindPopup("Ubicación actual").openPopup();
      this.positionAccuracyCircle.setLatLng(latlng);
      this.latitudActual = position.coords.latitude;
      this.longitudActual = position.coords.longitude;
      //L.marker(latlng).addTo(this.map).bindPopup("Estas aca").openPopup();
      //this.defaultZoom = this.map.getZoom();
      var zoom = this.map.getZoom();
      if(zoom < 7)
        this.moverA(latlng, this.defaultZoom);
      else
        this.moverA(latlng, zoom);
      this.stopFollow();
    }
  }

  obtenerClima(){
    if(this.userProfile == null){
      this.mensajeLogueo();
      return;
    }
    this.showLoad().then(()=>{
    this.op.obtenerClima(this.latitudActual, this.longitudActual).then(res => {
        var clima = res;
        var msg = this.op.getTemplateClima(clima);
        this.hideLoad();
        let alert = this.alertCtrl.create({
          title: 'El clima en ' + clima.lugar,
          message: msg,
          buttons: ['Listo']
        });
        alert.present();
      },
      err => {
        this.hideLoad();
        this.alertMensaje("Error", "El servicio de información climática no está disponible por el momento")
      })
    });
  }

  moverA(latlng, zoom){
    this.map.setView(latlng, zoom);
    this.empezarVuelo();
  }

  empezarVuelo(){
    this.primeraVez++;
    this.contadorLoad = 0;
    if(this.primeraVez == 1){
      this.puedeVolar = true;
      this.ocultarTodasLasOpciones();
      //this.obtenerZonasTemporales();
      this.obtenerZoTeIntersectada();
    }
  }

  ngOnDestroy():void { 
    //this.map.remove();
  }

  showLoad() {
    this.loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Espere por favor.',
      dismissOnPageChange: false
    });

    return this.loading.present();
  }

  hideLoad(){
    this.loading.dismiss().then(()=>{} ,
    err => {});
  }

  errorWs(err){
    if(err.message != undefined)
      this.alertMensaje("Error", err.message);
    else
      this.alertMensaje("Error", "Verifique su conexión a internet");
  }

  alertMensaje(titulo, msg){
    var alert = this.alertCtrl.create({
                  title:    titulo,
                  subTitle: msg,
                  buttons:  ['OK']
                });
    alert.present();
  }

  mensajeEmpezarVuelo(){
    //if(this.primeraVez == 0){
      var mapPage = this;
      let confirm = this.alertCtrl.create({
        title: 'Confirmar',
        message: '¿Vas a volar en este lugar?',
        buttons: [
          {
            text: 'Cancelar',
            handler: () => {
              mapPage.ocultarTodasLasOpciones();
            }
          },
          {
            text: 'Aceptar',
            handler: () => {
              mapPage.volar();
            }
          }
        ]
      });
      confirm.present();
    //}
  }
  
  volar(){
    this.mostrarOpcionesVuelo();
    this.registrarVuelo();
  }

  compartirEnFacebook(){
    if(this.userProfile == null){
      this.mensajeLogueo();
      return;
    }
    var descripcionUbicacion = "";
    this.showLoad().then(()=>{
      this.ds.obtenerLugar(this.latitudActual, this.longitudActual, this.map.getZoom(), this.userProfile).subscribe(
        res => {
          descripcionUbicacion = res.display_name;
          this.hideLoad();
          this.shareDialog(descripcionUbicacion);
        },
        err => {
          this.hideLoad();
          this.alertMensaje("Error", "Error al obtener su ubicación")
        })
    });
  }

  registrarVuelo(){
    this.vs.guardarVuelo(this.userProfile, this.latitudActual, this.longitudActual).subscribe(
      res => {

      },
      err => {
        
      }
    )
  }

  obtenerZoTeIntersectada(){
    this.contadorLoad++;
    this.layerGroup.clearLayers();
    this.showLoad().then(()=>{
      this.zs.obtenerZonasIntersactadas(this.latitudActual, this.longitudActual, this.radioVuelo, this.userProfile).subscribe(
        res => {
          this.verificarZonas(res.response);
        },
        err => {
          this.errorZonas(err);
        })
    });
  }

  obtenerZonasTemporales(){
    this.contadorLoad++;
    this.zs.obtenerZonasTemporales(this.userProfile, "TODAS").subscribe(
      res => {
        //this.verificarZonas(res.response);
        this.contadorLoad --;
        if(this.contadorLoad == 0){
            this.hideLoad();
          }
      },
      err => {
        this.errorZonas(err);
      })
  }

  goToBack(){
    this.navBar.backButtonClick = (e:UIEvent)=>{
      this.navCtrl.setRoot(HomePage);
    }

    this.platform.registerBackButtonAction(() => {
        this.navCtrl.setRoot(HomePage);
    });
  }

  zonaToGeoJson(zona: any){
    /*var geojsonFeature = {
        "type": "Feature",
        "properties": JSON.stringify(zona.propiedades),
        "geometry": JSON.stringify(zona.geometria)
    };  */
      
    var ft = JSON.parse("{\"type\":\"Feature\",\"geometry\":" + zona.geometria + ",\"properties\":" + zona.propiedades + "}");
    
    return ft;
  }

  zonasToGeoJson(zonasInfluencia){
    var zonas = Array<any>();
    var mapPAge = this;
    for(let i = 0; i< zonasInfluencia.length; i++){
      let zona = zonasInfluencia[i];
      zonas.push(mapPAge.zonaToGeoJson(zona));
    }
    return zonas;
  }

  onEachFeature(feature, layer) {
    var msgPopup = "No se puede volar en esta zona: <br>" ;
    if(feature.properties.fecha_inicio != undefined){
      var name =  feature.properties.ModelName != undefined ? feature.properties.ModelName  + "<br>" : "";
      var detalle = feature.properties.detalle != undefined ? feature.properties.detalle  + "<br>" : "";
      var desde = feature.properties.fecha_inicio + "<br>";
      var hasta = feature.properties.fecha_fin != undefined ? feature.properties.fecha_fin: "";
      msgPopup = name + detalle + "Desde: " + desde +  "Hasta: " + hasta
    }else{
      msgPopup = msgPopup + "Zona restringida por la normativa."
    }

    //if (feature.properties && feature.properties.ModelName) {
        layer.bindPopup(msgPopup);
    //}
    /*if (feature.properties && feature.properties.ModelName) {
        layer.bindPopup("No se puede volar aca: \n" + feature.properties.ModelName);
    }*/
  }

  addGeoJsonLayerToLayerGroup(geoJsonLayer){
     this.layerGroup.addLayer(geoJsonLayer).addTo(this.map);
  }

  verificarZonas(zonasRestingidas){
    this.contadorLoad--;
    if(this.contadorLoad == 0){
      this.hideLoad();
    }
    
    if((zonasRestingidas.zonas_influencia.length > 0) || (zonasRestingidas.zonas_temporales.length > 0)){
      var zonasTemporales = this.zonasToGeoJson(zonasRestingidas.zonas_temporales);
      var zonasInfluencia = this.zonasToGeoJson(zonasRestingidas.zonas_influencia);
      this.puedeVolar = false;
      this.addGeoJsonLayers(zonasInfluencia);
      this.addGeoJsonLayers(zonasTemporales);
      if(this.contadorLoad == 0) {
        this.positionMarker.bindPopup("No se puede volar en esta zona").openPopup();
        this.ocultarTodasLasOpciones();
        this.pedirExcepcionVuelo();
      }
    }
    if((this.contadorLoad == 0) && (this.puedeVolar)){
      this.iniciarVuelo();
    }
  }

  addGeoJsonLayers(zonas){
    this.addGeoJsonLayerToLayerGroup(L.geoJSON(zonas, {
      onEachFeature: this.onEachFeature,
      style: {
          "color": "red",
          "weight": 5,
          "opacity": 0.65
      }
    }));
  }

  errorZonas(err){
    this.contadorLoad--;
    if(this.contadorLoad == 0)
      this.hideLoad();
    this.alertMensaje("Error", "Error al calcular las zonas");
  }

  iniciarVuelo(){
    var mapPage = this;
    mapPage.mensajeEmpezarVuelo();/*
    setTimeout(function(){ 
      mapPage.mensajeEmpezarVuelo();
    }, 1000);*/
  }

  mostrarOpcionesVuelo(){
    this.opcionesVuelo = true;
    this.pedirExcepcion = false;
  }

  pedirExcepcionVuelo(){
    this.pedirExcepcion = true;
  }

  ocultarTodasLasOpciones(){
    this.opcionesVuelo = false;
    this.pedirExcepcion = false;
  }

  redirigeSolEx(){
    if(this.userProfile == null){
      this.mensajeLogueo();
      return;
    }
    this.navCtrl.setRoot(HomePage, {
      redirect: "Solicitud",
      lat: this.latitudActual,
      lon: this.longitudActual
    });
  }

  shareDialog(descripcionUbicacion){
    var latitud = this.latitudActual;
    var longitud = this.longitudActual;
    var urlCompartir = this.cs.getLinkFacebook(latitud, longitud);
    this.facebook.showDialog({
      href: urlCompartir,
      method: "share",
      quote:'¡Estoy usando GO Guide de ANAC! Volando mi drone en ' + descripcionUbicacion
    });
    //this.facebook.api('/me/feed?method=post&message=hola',['publish_actions'])
    /*var url = '/me/feed?method=post&message=hola&picture=assets/images/cielo.png'
    //url = 'https://www.facebook.com/dialog/feed?app_id=375420626221457&display=popup&amp;caption=An%20example%20caption&link=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2F&redirect_uri=https://developers.facebook.com/tools/explorer'
    //url = '/me/feed?method=post&message=hola&link=https://www.thesun.co.uk/wp-content/uploads/2017/10/nintchdbpict000361015235-e1508341774799.jpg'
    url = '/me/feed?method=post&message=hola&link=iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
    //url = '/me/feed?method=post&message=hola&object_attachment=assets/images/cielo.png'
    //url = '/me/photos?method=post&message=hola&object_attachment=assets/images/cielo.png'
    alert(url);
    this.facebook.api(url,['publish_actions'])
    .then(data=>{
      
      this.showUser = true; 
      this.user = data;
    })
    .catch(error =>{
      
      alert(JSON.stringify(error));
    });*/
    
  }

  mensajeLogueo(){
    var alert = this.alertCtrl.create({
      title:    "Ingresá",
      subTitle: "Registrate o ingresá con tu perfil para acceder a esta función",
      buttons:  ['OK']
    });
    alert.present();
  }
}
