import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { ConfigServiceProvider } from '../config-service/config-service';


@Injectable()
export class VueloServiceProvider {
  direccionServiceRest: string;

  constructor(public http: Http, private cs: ConfigServiceProvider) {
    this.direccionServiceRest = cs.getUrlController('RegistrovueloController');
  }

  guardarVuelo(userProfile, latitud, longitud){
    var credenciales = this.cs.getDefaultCredentials();
    let headers = new Headers();
    var idUsuarioVant = null;
    if(userProfile != null){
      credenciales.usuario = userProfile.usuario;
      credenciales.pass = userProfile.pass;
      idUsuarioVant = userProfile.idUsuarioVant;
    }

    var vuelo = {
      idUsuarioVant: idUsuarioVant,
      latitud: latitud,
      longitud: longitud
    }

    headers.append('Authorization', 'Basic ' + btoa(credenciales.usuario + ':' + credenciales.pass));  
    return this.http.post(this.direccionServiceRest + "guardar_vuelo", vuelo,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }
}