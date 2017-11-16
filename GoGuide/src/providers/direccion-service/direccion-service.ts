import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { ConfigServiceProvider } from '../config-service/config-service';


@Injectable()
export class DireccionServiceProvider {
  direccionServiceRest: string;

  constructor(public http: Http, private cs: ConfigServiceProvider) {
    this.direccionServiceRest = cs.getUrlController('ProvinciaController');
  }

  obtenerProvincias(){
    var credenciales = this.cs.getDefaultCredentials();
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(credenciales.usuario + ':' + credenciales.pass));  
    return this.http.get(this.direccionServiceRest + 'obtener_provincias/',
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  obtenerLocalidadesProvincia(idProvincia: number){
    var credenciales = this.cs.getDefaultCredentials();
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(credenciales.usuario + ':' + credenciales.pass));  
    return this.http.get(this.direccionServiceRest + 'obtener_localidades_id_provincia/' + 'idProvincia/' + idProvincia,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  obtenerLugar(lat, lon, zoom, userProfile){
    var emailField = "";
    if(userProfile != null){
      emailField =  "&email=" + userProfile.email
    }
    var apiUrl = this.cs.getNominatimUrl() + "reverse?lat=" + lat + "&lon=" + lon + "&zoom=" + zoom + emailField;
    apiUrl = apiUrl + "&format=json&addressdetails=1&accept-language=es";
    return this.http.get(apiUrl).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
    /*return this.http.get(apiUrl).toPromise()
    .then(response => response.json())
    .catch(error => {return Promise.reject(error.message || error)});*/                      
  }
}