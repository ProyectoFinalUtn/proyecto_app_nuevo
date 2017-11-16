import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { DbProvider } from '../db/db';
import { ConfigServiceProvider } from '../config-service/config-service';

export class Vant {
  idVant: number;
  idUsuarioVant: number;
  marca: string;
  modelo: string;
  nroSerie: string;
  fabricante: string;
  lFab: string;
  anioFab: number;
  alto: number;
  ancho: number;
  largo: number;
  velMax: number;
  altMax: number; 
  peso: number;
  color: string;
  lGuardado: string;
 
  constructor() {
    
  }
}

@Injectable()
export class VantServiceProvider {
  vantServiceRest: string;
  vantsUsuario: Array<Vant> = new Array<Vant>();

  constructor(public http: Http, private db: DbProvider, private cs: ConfigServiceProvider) {
    this.vantServiceRest = cs.getUrlController('VantController');
  }

  guardarVant(vant, usuario, pass){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.post(this.vantServiceRest + "guardar_vant", vant,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  modificarVant(vant, usuario, pass){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.post(this.vantServiceRest + "modificar_vant", vant,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  eliminarVant(vant, usuario, pass){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.post(this.vantServiceRest + "eliminar_vant", {vant: vant, usuario: usuario},
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  vantsPorUsuario(usuario, pass, idUsuarioVant){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.get(this.vantServiceRest + 'obtener_vants_usuario/' + 'usuario/' + usuario.replace("@", "") + '/id_usuario/' + idUsuarioVant,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  vantPorId(idVant, usuario, pass){
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usuario + ':' + pass));  
    return this.http.get(this.vantServiceRest + 'obtener_vant_id_usuario/' + 'usuario/' + usuario.replace("@", "") + '/idVant/' + idVant,
                         {headers: headers}).map(res => res.json())
                         .catch(error => Observable.throw(error.json()));
  }

  guardarFotoVant(vant: Vant, foto: string){
    return this.db.guardarFotoVant(vant, foto);
  }

  modificarFotoVant(vant: Vant, foto: string){
    return this.db.eliminarFotoVant(vant).then(response => {
              return this.db.guardarFotoVant(vant, foto);
           })
  }

  eliminarFotoVant(vant: Vant){
    return this.db.eliminarFotoVant(vant);
  }

  getVantsUsuario()  {
    var vants = new Array<Vant>();
    vants = this.clonarObjeto(this.vantsUsuario);
    return vants;
  }

  setVantsUsuario(vants: Array<Vant>)  {
    this.vantsUsuario = this.clonarObjeto(vants);
  }

  setVant(vant: Vant){
    if(this.vantsUsuario == undefined || this.vantsUsuario ==null){
      this.vantsUsuario = new Array<Vant>();
    }
    var vantNuevo = this.clonarObjeto(vant);
    this.vantsUsuario.push(vantNuevo);
  }

  unSetVant(vant: Vant){
    var vantBuscado = this.buscarVant(vant);
    if(vantBuscado !=null){
      this.vantsUsuario.splice(vantBuscado, 1);
    }
  }

  updateVant(vant){
    this.unSetVant(vant);
    this.setVant(vant);
  }

  clonarObjeto(objeto: any){
    var objetoClon = JSON.parse(JSON.stringify(objeto));
    return objetoClon;
  }

  buscarVant(vantBuscado){
    for(let i = 0; i < this.vantsUsuario.length; i++){
      let vant = this.vantsUsuario[i];
      if(vant.idVant == vantBuscado.idVant){
        return i;
      }
    }
    return null;
  }

  clearAllVants(){
    this.vantsUsuario = new Array<Vant>();
  }
}