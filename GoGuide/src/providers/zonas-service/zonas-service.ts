import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { ConfigServiceProvider } from '../config-service/config-service';

export class Normativa {
  id_normativa: number;
  descripcion: string;
  fecha_desde: string;
  fecha_hasta: string;
  contenido: string;
  contenido_html: string;  
 
  constructor() {
    
  }
}

@Injectable()
export class ZonasServiceProvider {
  direccionZoTeServiceRest: string;
  direccionZoDeServiceRest: string;

  constructor(public http: Http, private cs: ConfigServiceProvider) {
    this.direccionZoTeServiceRest = cs.getUrlController('Consulta_zonas');
  }

  obtenerZonasIntersactadas(latitud, longitud, radioVuelo, userProfile){
    var credenciales = this.cs.getDefaultCredentials();
    let headers = new Headers();
    var idUsuarioVant = null;
    if(userProfile != null){
      credenciales.usuario = userProfile.usuario;
      credenciales.pass = userProfile.pass;
    }
    var vuelo = {
      lat: latitud,
      long: longitud,
      rad: radioVuelo,
      fecha_inicio: new Date()
    }

    headers.append('Authorization', 'Basic ' + btoa(credenciales.usuario + ':' + credenciales.pass));  
    return this.http.post(this.direccionZoTeServiceRest + "buscar_zonas_segregadas", vuelo,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  obtenerZonasTemporales(userProfile, filtro){
    var credenciales = this.cs.getDefaultCredentials();
    let headers = new Headers();
    var idUsuarioVant = null;
    if(userProfile != null){
      credenciales.usuario = userProfile.usuario;
      credenciales.pass = userProfile.pass;
    }
    var filtroBusqueda = {
      filtro: filtro,
      fecha_inicio: null,
      fecha_fin: null
    }
    headers.append('Authorization', 'Basic ' + btoa(credenciales.usuario + ':' + credenciales.pass)); 
    return this.http.post(this.direccionZoTeServiceRest + "buscar_zonas_temporales", filtroBusqueda,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }
}