import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { Vant } from '../vant-service/vant-service';
import { ConfigServiceProvider } from '../config-service/config-service';


export class Solicitud {
  idVant: number;
  idSolicitud: number;
  idUsuarioVant: number;
  idTipoSolicitud: number;
  idUsuarioAprobador: number;
  idEstadoSolicitud: number;  
  descripcionEstadoSolicitud: string;
  latitud: number;
  longitud: number;
  radioVuelo: number;
  vants: Array<Vant>
  fecha: string;
  horaVueloDesde: string;
  horaVueloHasta: string;
 
  constructor() {
    
  }
}

@Injectable()
export class SolicitudServiceProvider {
  solicitudServiceRest: string;

  constructor(public http: Http, private cs: ConfigServiceProvider) {
    //this.solicitudServiceRest = "http://192.168.0.19/CodeIgniter/SolicitudExController/";
    this.solicitudServiceRest = "/servicioLocal/SolicitudExController/";
    this.solicitudServiceRest = cs.getUrlController('SolicitudExController');
  }

  guardarSolicitud(solicitud, usuario, pass){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.post(this.solicitudServiceRest + "guardar_solicitud", solicitud,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  modificarSolicitud(solicitud, usuario, pass){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.post(this.solicitudServiceRest + "modificar_solicitud", solicitud,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  eliminarSolicitud(solicitud, usuario, pass){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.post(this.solicitudServiceRest + "eliminar_solicitud", {solicitud: solicitud, usuario: usuario},
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  solicitudesPorUsuario(usuario, pass, idUsuarioVant){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.get(this.solicitudServiceRest + 'obtener_solicitudes_usuario/' + 'usuario/' + usuario.replace("@", "") + '/id_usuario/' + idUsuarioVant,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  solicitudPorId(idSolicitud, usuario, pass){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.get(this.solicitudServiceRest + 'obtener_solicitud_id_usuario/' + 'usuario/' + usuario.replace("@", "") + '/idSolicitud/' + idSolicitud,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }
}