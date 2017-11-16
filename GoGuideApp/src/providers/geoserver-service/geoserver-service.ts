import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';

/*
  Generated class for the GeoserverServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class GeoserverServiceProvider {

  constructor(public http: Http) {
  }

  getCapaGeoserver(layerName: string){
    return this.http.get("http://geo.anac.gov.ar/geoserver/dad/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dad:"+ layerName +"&outputFormat=application%2Fjson"
                         ).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

}
