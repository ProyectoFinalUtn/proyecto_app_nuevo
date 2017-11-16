import { Component, ViewChild,  } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, Navbar, Platform} from 'ionic-angular';
import { SolicitudListPage } from '../solicitud-list/solicitud-list';
import L from "leaflet";
import { Geolocation, Geoposition, GeolocationOptions } from '@ionic-native/geolocation';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { PerfilProvider} from '../../providers/perfil/perfil';
import { SolicitudServiceProvider, Solicitud } from '../../providers/solicitud-service/solicitud-service';
import { VantServiceProvider, Vant } from '../../providers/vant-service/vant-service';
import { LoadingController } from 'ionic-angular';
import { ConfigServiceProvider } from '../../providers/config-service/config-service';

const GEOLOCATION_OPTIONS: GeolocationOptions = {
   maximumAge: 3000, timeout: 5000, enableHighAccuracy: true
};

@IonicPage()
@Component({
  selector: 'page-solicitud',
  templateUrl: 'solicitud.html',
})
export class SolicitudPage {
  @ViewChild(Navbar) navBar: Navbar;
  solicitud: Solicitud;
  map: L.Map;
  center: L.PointTuple;
  following: Boolean;
  positionMarker: L.Marker;
  positionAccuracyCircle: L.Circle;
  defaultZoom: number;
  provider: any;
  searchControl: any;
  private geolocationSubscription;
  mensajeCrearSolicitud: string;
  userProfile: any;
  guardarModificar: string;
  vantsUsuario: Array<Vant>;
  loading;
  click: number;
  
  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private geolocation: Geolocation,
              public toastCtrl: ToastController,
              public alertCtrl: AlertController,
              private up: PerfilProvider, 
              private ss: SolicitudServiceProvider,
              private vs: VantServiceProvider, 
              public loadingCtrl: LoadingController, 
              private cs: ConfigServiceProvider, private platform: Platform) {
    
    this.vantsUsuario = new Array<Vant>();
    this.userProfile = this.up.getUserProfile();
    this.solicitud = this.navParams.data.solicitud;   
    if(this.solicitud == null){
      this.generaSolicitudVacia();
    }
    this.inicializarSolicitud();    
  }

  ionViewDidLoad() {
    L.Icon.Default.imagePath = this.cs.getBaseImagePath();
    this.click = 0
    //this.center = [-34.60389, -58.37056]; //Obelisco
    this.center = [-34.60389, -58.37056];
    this.initMap();
    this.initCirculoMarker();
    this.initGeoSearchControl();
    this.centrarMapa(this.solicitud.latitud, this.solicitud.longitud, this.defaultZoom);
    this.mapClick();
    this.backButton();
  }

  cancelar(){
    this.volverAlListado();
  }

  volverAlListado(){
    this.navCtrl.setRoot(SolicitudListPage);
  }

  initMap() {
    this.defaultZoom = 15;
    this.map = L.map('map', {
      maxZoom: 17,
      doubleClickZoom: false,
      tap: true
    }).fitWorld();

    this.map.setView(this.center, 6);
    //var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmUrl= this.cs.getUrlOsm();
    var osmHumanitarioUrl = this.cs.getUrlOsmHumanitario();
    var osmMapaBase = this.cs.getUrlMapaBase();
	  var osmAttrib= this.cs.getAttribOsm();
    var osm = new L.TileLayer(osmUrl, {minZoom: 3, maxZoom: 17, attribution: osmAttrib});
    var humanitario = new L.TileLayer(osmHumanitarioUrl, {minZoom: 3, maxZoom: 17, attribution: osmAttrib});
    var mapaBase = new L.TileLayer(osmMapaBase, {minZoom: 3, maxZoom: 17, attribution: osmAttrib});
	  this.map.addLayer(mapaBase);
  }

  initCirculoMarker(){
    let latlng = this.center;
    this.positionMarker = L.marker(latlng);
    this.positionMarker.addTo(this.map);
    var radio = this.solicitud.radioVuelo;
    this.positionAccuracyCircle = L.circle(latlng, {radius: radio});
    this.positionAccuracyCircle.addTo(this.map);
  }

  initGeoSearchControl(){
    this.provider = new OpenStreetMapProvider({params: {countrycodes: 'ar', limit: 10}}); 
    this.searchControl = new GeoSearchControl
                         ({ 
                            provider: this.provider, 
                            style: 'button', 
                            autoClose: true, 
                            showMarker: false,
                            searchLabel: 'Buscar dirección'
                         });
    //this.map.on('geosearch/showlocation', this.direccionEncontrada);
    var mapPage = this;
    this.map.addControl(this.searchControl);
    this.map.on('geosearch/showlocation', function(e){
      mapPage.stopFollow();
      mapPage.positionAccuracyCircle.setLatLng(e.marker._latlng);
      mapPage.positionMarker.setLatLng(e.marker._latlng).bindPopup("Dirección encontrada").openPopup();
      mapPage.solicitud.latitud = e.marker._latlng.lat;
      mapPage.solicitud.longitud = e.marker._latlng.lng;
    })
  }

  mapClick(){
    var mapPage = this;

    this.map.on('click', function(e){
      mapPage.click = mapPage.click + 1;
      if(mapPage.click == 1){
        setTimeout(function(){ 
          if(mapPage.click > 1){
            mapPage.click = 0;
            mapPage.stopFollow();
            let latlng = e.latlng;
            mapPage.positionMarker.setLatLng(latlng).bindPopup("Ubicación actual").openPopup();
            mapPage.positionAccuracyCircle.setLatLng(latlng);
            mapPage.solicitud.latitud = latlng.lat;
            mapPage.solicitud.longitud = latlng.lng;
            var zoom = mapPage.map.getZoom();
            if(zoom < 7)
              this.map.setView(latlng, mapPage.defaultZoom);
            else
            this.map.setView(latlng, zoom);
          }
          mapPage.click = 0;
        }, 1300);
      }
    });
  }

  mostrarMensaje(mensaje, posicion, botonCerrar, duracion){
    let toast = this.toastCtrl.create({
      message: mensaje,
      position: posicion,
      showCloseButton: botonCerrar,
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
    this.following = true;
    this.map.setZoom(this.defaultZoom);
    var mapPage = this
    this.geolocationSubscription = this.geolocation.watchPosition(GEOLOCATION_OPTIONS)
      .subscribe(position => {
        this.updateGeoposition(position, mapPage);
      });
  }

  stopFollow() {
    this.following = false;
    if(this.geolocationSubscription != undefined)
      this.geolocationSubscription.unsubscribe();
  }

  updateGeoposition(position: Geoposition, mapPage: SolicitudPage) { 
    if(position.coords != undefined){
      mapPage.solicitud.latitud = position.coords.latitude;
      mapPage.solicitud.longitud = position.coords.longitude;
      if((mapPage.solicitud.latitud != null) && (mapPage.solicitud.longitud != null)){
        var latlng = {lat: position.coords.latitude, lng: position.coords.longitude, date: new Date()};
        this.positionMarker.setLatLng(latlng).bindPopup("Ubicación actual").openPopup();
        this.positionAccuracyCircle.setLatLng(latlng);
        //L.marker(latlng).addTo(this.map).bindPopup("Estas aca").openPopup();
        //this.defaultZoom = this.map.getZoom();
        if(this.map.getZoom() < 7)
          this.map.setView(latlng, this.defaultZoom);
        else
          this.map.setView(latlng, this.map.getZoom());
      }
    }
  }

  ngOnDestroy():void { 
    //this.map.remove();
  }


  enviar(){
    let alert = this.alertCtrl.create({
      title: "Confirmar",
      message: "La solicitud va a ser analizada por la\nADMINISTRACIÓN NACIONAL DE AVIACIÓN CIVIL.\n¿Está seguro que desea enviar la solicitud?",
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            return;
          }
        },
        {
          text: 'Si',
          handler: () => {
            this.enviarDatos();
          }
        }
      ]
    });
    alert.present(); 
  }

  enviarDatos(){
    if(this.valido()){
      if(this.solicitud.idSolicitud == 0){
        this.guardar();
      }else{
        this.modificar();
      }
    }else{
      this.alertMensaje("Error", this.mensajeCrearSolicitud)
    }
  }
  
  guardar(){
    this.showLoad().then(()=>{
      this.solicitud.idUsuarioVant = this.userProfile.idUsuarioVant;
      this.ss.guardarSolicitud(this.solicitud, this.userProfile.usuario, this.userProfile.pass)
      .subscribe(
      res => {     
        this.hideLoad();  
        this.solicitud.idSolicitud = res.response.idSolicitud;
        this.alertVuelveAtras("Confirmación", "Solicitud generada con éxito.");        
      },
      err => {
        this.hideLoad();
        this.alertMensaje("Error", err.message);
      });
    });
  }

  modificar(){
    this.showLoad().then(()=>{
      this.solicitud.idUsuarioVant = this.userProfile.idUsuarioVant;    
      this.ss.modificarSolicitud(this.solicitud, this.userProfile.usuario, this.userProfile.pass)
      .subscribe(
      res => {
        this.hideLoad();
        this.alertVuelveAtras("Confirmación", "Solicitud modificada con éxito.");
      },
      err => {
        this.hideLoad();
        this.alertMensaje("Error", err.message);
      });
    });
  }
  
  inicializarSolicitud(){
    if(this.solicitud.idSolicitud != 0){
      this.solicitud.vants= new Array<Vant>();
      this.obtenerSolicitud(this.solicitud.idSolicitud);
      this.guardarModificar = 'Modificar';    
    }else{
      this.obtenerVantsUsuario();
      this.guardarModificar = 'Guardar';      
      this.solicitud.idSolicitud = 0;
      if((this.navParams.data.lat == undefined) ||(this.navParams.data.lon == undefined)){
        this.solicitud.latitud = -34.60389;
        this.solicitud.longitud = -58.37056;
      }else{
        this.solicitud.latitud = this.navParams.data.lat;
        this.solicitud.longitud = this.navParams.data.lon;
      }
    }
  }


  obtenerSolicitud(idSolicitud){
    this.showLoad().then(()=>{
      this.ss.solicitudPorId(idSolicitud, this.userProfile.usuario, this.userProfile.pass).subscribe(
      res => {
        this.hideLoad();
        if(res.response){
          this.solicitud = res.response;
          this.obtenerVantsUsuario(); 
        }else{
          this.alertVuelveAtras("Error", "No se pudo obtener el vant a modificar");
        }         
      },
      err => {
        this.hideLoad();
        this.alertMensaje("Error", err.message);
      });
    }); 
  }

  centrarMapa(latitud, longitud, zoom){
    var latLong = [latitud, longitud];
    let latlng = {lat: this.solicitud.latitud, lng: this.solicitud.longitud, date: new Date()};
    this.positionMarker.setLatLng(latlng).bindPopup("Ubicación actual").openPopup();
    this.positionAccuracyCircle.setLatLng(latlng);
    this.map.setView(latLong, zoom);
  }

  confirmar(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            return;
          }
        },
        {
          text: 'Sí',
          handler: () => {
            this.volverAlListado();
          }
        }
      ]
    });
    alert.present();
  }

  alertMensaje(titulo, msg){
    var alert = this.alertCtrl.create({
                  title:    titulo,
                  subTitle: msg,
                  buttons:  ['OK']
                });
    alert.present();
  }

  valido(): boolean{
    this.mensajeCrearSolicitud = "";
    var valido = true;
    if((this.solicitud.longitud == null) || (this.solicitud.longitud == 0)){
      this.mensajeCrearSolicitud += "El campo longitud no puede estar vacío.</br>";
      valido = false;
    }

    if((this.solicitud.latitud == null) || (this.solicitud.latitud == 0)){
      this.mensajeCrearSolicitud += "El campo latitud no puede estar vacío.</br>";
      valido = false;
    }

    if((this.solicitud.radioVuelo == null) || (this.solicitud.radioVuelo == 0)){
      this.mensajeCrearSolicitud += "El campo radio de vuelo no puede estar vacío.</br>";
      valido = false;
    }

    if((this.solicitud.fecha == null) || (this.solicitud.fecha == "")){
      this.mensajeCrearSolicitud += "El campo fecha de vuelo no puede estar vacío.</br>";
      valido = false;
    }

    if((this.solicitud.horaVueloDesde == null) || (this.solicitud.horaVueloDesde.trim() == "")){
      this.mensajeCrearSolicitud += "El campo hora de vuelo desde no puede estar vacío.</br>";
      valido = false;
    }

    if((this.solicitud.horaVueloHasta == null) || (this.solicitud.horaVueloHasta.trim() == "")){
      this.mensajeCrearSolicitud += "El campo hora de vuelo hasta no puede estar vacío.</br>";
      valido = false;
    }

    return valido;
  }

  cambiarRadio(){
    this.positionAccuracyCircle.setRadius(this.solicitud.radioVuelo);
  }

  obtenerVantsUsuario(){
    this.showLoad().then(()=>{
      this.userProfile = this.up.getUserProfile();
      this.vs.vantsPorUsuario(this.userProfile.usuario, this.userProfile.pass, this.userProfile.idUsuarioVant)
      .subscribe(
      res => {
        if(res.response){
          this.hideLoad();
          this.vantsUsuario = res.response;
        }else{
          this.errorWs(res);
        }       
      },
      err => {
        this.errorWs(err);        
      });
    });
  }

  errorWs(err){
    if(err.message != undefined)
      this.alertVuelveAtras("Error", err.message)
    else
      this.alertVuelveAtras("Error", "Verifique su conexión a internet");
  }

  generaSolicitudVacia(){
    this.solicitud = new Solicitud();
    this.solicitud.radioVuelo = 0;
    this.solicitud.idSolicitud = 0;
    this.solicitud.latitud = 0;
    this.solicitud.longitud = 0;
    this.solicitud.vants = new Array<Vant>();
    this.solicitud.fecha = "2017-01-01"
    var fechaActual = new Date();
    this.solicitud.fecha = fechaActual.toISOString();
    //cthis.solicitud.fecha = fechaActual.getFullYear().toString() + "-" + fechaActual.getMonth().toString()+ "-" + fechaActual.getDay().toString();
    this.solicitud.horaVueloDesde = fechaActual.getHours().toString() + ":" + fechaActual.getMinutes().toString();
    this.solicitud.horaVueloHasta = fechaActual.getHours().toString() + ":" + (fechaActual.getMinutes() + 1).toString();
  }

   alertVuelveAtras(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [                                                                                                                                                     
        {
          text: 'Ok',
          handler: () => {
            this.volverAlListado();
          }
        }
      ]
    });
    alert.present();
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
    var loading = this.loading;
    this.loading.dismiss().then(()=>{} ,
    err => {});
  }

  elegido(vantBuscado){
    var elegido = false;
    for(let i = 0; i < this.solicitud.vants.length; i++){
      var vant = this.solicitud.vants[i];
      if(vant.idVant === vantBuscado){
        elegido = true;
        i = this.solicitud.vants.length;
        break;
      }
    }
    return elegido;
  }

  backButton(){
    this.navBar.backButtonClick = (e:UIEvent)=>{
      this.confirmar('Confirmar', 
                    '¿Está seguro que desea salir? Los datos no guardados se perderán'
                    );

    }
    var pageEvent = this;              
    this.platform.registerBackButtonAction(() => {
        pageEvent.confirmar('Confirmar', 
                      '¿Está seguro que desea salir? Los datos no guardados se perderán'
                      );
    });
  }
}

