import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { UserProfile } from '../db/db';
import { ConfigServiceProvider } from '../config-service/config-service';

@Injectable()
export class UsuarioServiceProvider {
  usuarioServiceRest: string;

  constructor(public http: Http, private cs: ConfigServiceProvider) {
    this.usuarioServiceRest = "/servicioLocal/UsuarioVantController/";
    this.usuarioServiceRest = cs.getUrlController('UsuarioVantController');
  }

  getUsers(){
    return this.http.get(this.usuarioServiceRest + "users").map(res => res.json())
                                                     .catch(error => Observable.throw(error.json()));
    //return this.http.get('assets/mocks/perfiles.json')
    //.map( res => res.json() )
  }

  getPerfiles(){
    return this.http.get(this.usuarioServiceRest + "perfiles").map(res => res.json())
                                                     .catch(error => Observable.throw(error.json()));
    //return this.http.get('assets/mocks/perfiles.json')
    //.map( res => res.json() )
  }

  getUser(usuario, pass){
    return this.http.get(this.usuarioServiceRest + "login_get/"+ usuario +"/" + pass).map(res => res.json())
                                                     .catch(error => Observable.throw(error.json()));
    //return this.http.get('assets/mocks/perfiles.json')
    //.map( res => res.json() )
  }

  crearPerfil(userProfile){
    let headers = new Headers();
    var credenciales = this.cs.getDefaultCredentials();
    headers.append('Authorization', 'Basic ' + btoa(credenciales.usuario + ':' + credenciales.pass));  
    return this.http.post(this.usuarioServiceRest + "crear_perfil", userProfile,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  modificarPerfil(userProfile: UserProfile){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(userProfile.usuario + ':' + userProfile.pass));  
    return this.http.post(this.usuarioServiceRest + "cambiar_perfil", userProfile,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  loginPerfil(usuario, pass){
    let headers = new Headers();
    var credenciales = this.cs.getDefaultCredentials();
    headers.append('Authorization', 'Basic ' + btoa(credenciales.usuario + ':' + credenciales.pass));  
    return this.http.post(this.usuarioServiceRest + "login_perfil", {usuario: usuario, pass: pass},
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  obtenerPerfilUsuario(usuario, pass){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.post(this.usuarioServiceRest + "obtener_perfil_usuario", {usuario: usuario, pass: pass},
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  obtenerPerfilPorId(userProfile: UserProfile){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(userProfile.usuario + ':' + userProfile.pass));  
    return this.http.post(this.usuarioServiceRest + "obtener_perfil_por_id/id" + userProfile.idUsuarioVant, {usuario: userProfile.usuario, pass: userProfile.pass},
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }
}
//http://localhost/proyecto_plataforma/CodeIgniter/index.php/UsuarioVantController/users