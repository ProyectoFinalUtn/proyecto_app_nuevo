import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { ConfigServiceProvider } from '../config-service/config-service';


@Injectable()
export class OpenweathermapServiceProvider {
  direccionServiceRest: string;

  constructor(public http: Http, private cs: ConfigServiceProvider) {
    this.direccionServiceRest = cs.getOpenWheatherMapUrl();
  }

  hacerLlamadaClima(lat, lon){
    var apiUrl = this.direccionServiceRest + "weather?lat=" + lat + "&lon=" + lon;
    apiUrl = apiUrl + "&units=metric&lang=es&appid=" + this.cs.getOpenWheatherMapAppId();
    /*return this.http.get(apiUrl).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));*/
    return this.http.get(apiUrl).toPromise()
    .then(response => response.json())
    .catch(error => {return Promise.reject(error.message || error)});                      
  }

  responseToClima(data){
    var clima = {
      velocidadViento : data.wind.speed, 
      temperatura : data.main.temp,
      humedad : data.main.humidity,
      tempMax: data.main.temp_max,
      tempMin: data.main.temp_min,
      presionAtm: data.main.pressure,
      wheatherGroup: data.weather[0].main,
      descripcion: data.weather[0].description,
      imgClima: data.weather[0].icon, 
      lugar: data.name     
    }
    return clima;
  }

  obtenerClima(lat, lon){
    return this.hacerLlamadaClima(lat, lon).then(
    res => {
     var clima = this.responseToClima(res);
     return Promise.resolve(clima);
    },
    err => {
      return Promise.resolve(err);
    })
  }

  getTemplateClima(clima){
    var msg = "<div class=\"weather\"> \n  <img class=\"imgWeather\" src=\"http://openweathermap.org/img/w/" + clima.imgClima + ".png\"/>";   
    msg = msg + "<div id=\"weatherDescription\"> Clima: " + clima.descripcion.toUpperCase() + "</div>\n";
    //msg = msg + "<div id=\"weatherGroup\">" + clima.wheatherGroup + "</div>\n";
    msg = msg + "<div id=\"temperature\">Temperatura: " + clima.temperatura + "\u00B0</div>\n";
    msg = msg + "<div id=\"minTemp\"> Temp Min: " + clima.tempMin + "\u00B0</div> \n";
    msg = msg + "<div id=\"maxTemp\"> Temp Max: " + clima.tempMax + "\u00B0</div> \n";                  
    msg = msg + "<div id=\"windSpeed\"> Vientos de: " + clima.velocidadViento + " m/s</div>\n";
    msg = msg + "<div id=\"humidity\"> Humedad: " + clima.humedad + "%</div>\n";
    msg = msg + "<div id=\"pressure\"> Presion Atm: " +clima.presionAtm + " hPa</div></div>";
    return msg;
  }
  
}