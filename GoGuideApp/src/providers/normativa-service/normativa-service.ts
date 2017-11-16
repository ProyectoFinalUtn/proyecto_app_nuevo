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
export class NormativaServiceProvider {
  direccionServiceRest: string;

  constructor(public http: Http, private cs: ConfigServiceProvider) {
    this.direccionServiceRest = cs.getUrlController('NormativaController');
  }

  obtenerDatosNormativas(){
    var credenciales = this.cs.getDefaultCredentials();
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(credenciales.usuario + ':' + credenciales.pass));  
    return this.http.get(this.direccionServiceRest + 'obtener_datos_normativas/',
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }
}