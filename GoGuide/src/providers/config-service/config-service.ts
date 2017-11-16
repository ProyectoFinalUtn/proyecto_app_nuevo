import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ConfigServiceProvider {
  private urlWebServiceProd;
  private urlWebServiceEmulator;
  private urlWebServiceLocalBrowser;
  private urlWebServiceAmazonBrowser;
  private urlWebServiceDev;
  private urlWebService;
  private baseImagePath;
  private credenciales;
  private urlWebServiceTrabajo;
  

  constructor(public http: Http) {
    this.baseImagePath = "assets/images/";
  }

  private cargarUrlWebService(){
    this.urlWebServiceProd = 'http://18.231.33.155/proyecto_plataforma/src/CodeIgniter/'
    this.urlWebServiceEmulator = "http://10.0.2.2/proyecto_plataforma_web/";
    this.urlWebServiceLocalBrowser = "/servicioLocal/";
    this.urlWebServiceTrabajo = "/servicioTrabajo/";
    this.urlWebServiceAmazonBrowser = "/servicioAmazon/";
    this.urlWebServiceDev = 'http://18.231.33.155/proyecto_plataforma/src/CodeIgniter/'
    this.urlWebService = "http://192.168.0.151/proyecto_plataforma/src/CodeIgniter/";
    this.urlWebService = this.urlWebServiceProd;
  }

  private getBaseUrlWebService(){
    if(!this.noEstaVacia())
      this.cargarUrlWebService();
    return this.urlWebService;    
  }

  private noEstaVacia(){
    if((this.urlWebService != null) && (this.urlWebService != ""))
      return true;
    return false;
  }

  public getUrlController(controlerName){
    var urlController = this.getBaseUrlWebService() + controlerName + "/";
    return urlController;
  }

  public getImage(imageName){
    return this.baseImagePath + imageName;
  }

  public getBaseImagePath(){
    return this.baseImagePath;
  }

  public getAttribOsm(){
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    return osmAttrib;
  }

  public getUrlOsm(){
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';    
    return osmUrl;
  }

  public getUrlOsmHumanitario(){
    var osmHumanitarioUrl = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';  
    return osmHumanitarioUrl;
  }

  public getUrlOsmWikimedia(){
    var urlOsmWikimedia = "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
    return urlOsmWikimedia;
  }

  public getUrlMapaBase(){
    return this.getUrlOsmWikimedia();
  }

  public getDefaultCredentials(){
    this.credenciales = {usuario: "admin", pass: "1234"}
    return this.credenciales;
  }

  public getOpenWheatherMapUrl(){
    var openWheatherMapUrl = "http://api.openweathermap.org/data/2.5/";
    return openWheatherMapUrl;
    //return "/clima/"
  }

  public getOpenWheatherMapAppId(){
    var openWheatherMapAppId = "240d52f98b8039c0bb6a5181bce0712e";
    return openWheatherMapAppId;
  }

  public getNominatimUrl(){
    var nominatimUrl = "http://nominatim.openstreetmap.org/";
    return nominatimUrl;
  }

  public getLinkFacebook(lat, lon){
    var urlCompartirFacebook = "https://www.google.com.ar/maps/@" + lat + "," + lon + ",16z?hl=es";
    //urlCompartirFacebook = "https://maps.wikimedia.org/#16/" + lat + "/" + lon
    return urlCompartirFacebook;
  }

}
