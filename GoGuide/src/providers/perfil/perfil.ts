import { Injectable } from '@angular/core';
import { DbProvider, UserProfile } from '../db/db';
import { ConfigServiceProvider } from '../config-service/config-service';

@Injectable()
export class PerfilProvider {
  userProfile: UserProfile;
  defaultImage: string;
  veces: number;

  constructor(public db: DbProvider, private cs: ConfigServiceProvider) {
    this.defaultImage = this.cs.getImage("perfil.jpg");
  }

  obtenerUserProfile()  {
    return this.db.obtenerPerfilUsuario()
    .then(response => {
      if(response.rows.length > 0){
        this.inicializarUserProfile();
        this.rowToUserProfile(response.rows.item(0));
        return Promise.resolve(response.rows.item(0));
      }else{
        this.inicializarUserProfile();
        return this.getUserProfile();
      }
    })
    .catch(error =>{
      return Promise.reject(error);
    });
  }

  private inicializarUserProfile(){
    this.userProfile = new UserProfile();
    this.userProfile.idUsuarioVant= null;
    this.userProfile.nombreDePerfil= "";
    this.userProfile.nombre= "";
    this.userProfile.apellido= "";
    this.userProfile.email= "";
    this.userProfile.edad= null;
    this.userProfile.sexo= null;
    this.userProfile.tipoDoc= null;
    this.userProfile.nroDoc= null;
    this.userProfile.calle= "";
    this.userProfile.nro= "";
    this.userProfile.piso= "";
    this.userProfile.dpto= "";
    this.userProfile.provincia= null;
    this.userProfile.localidad= null;
    this.userProfile.telefono= ""; 
    this.userProfile.usuario= "";
    this.userProfile.pass= "";
    this.userProfile.fotoPerfil= this.defaultImage;
  }

  getUserProfile()  {
    var up = new UserProfile();
    if(this.userProfile != undefined || this.userProfile != null){
      up = this.clonarObjeto(this.userProfile);
      return up;
    }else{
      return null;
    }
  }

  setUserProfile(userProfile: UserProfile)  {
    this.userProfile = this.clonarObjeto(userProfile);
  }

  getUserProfileHarcodeadoVacio()  {
    this.inicializarUserProfile();
    var up = this.clonarObjeto(this.userProfile);
    return up;
  }

  getUserProfileHarcodeado()  {
    this.inicializarUserProfile();
    this.userProfile = new UserProfile();
    this.userProfile.idUsuarioVant= 65;
    this.userProfile.nombreDePerfil= "pepe";
    this.userProfile.nombre= "popo";
    this.userProfile.apellido= "a";
    this.userProfile.email= 'mimail@hotmail.com';
    this.userProfile.edad= 1;
    this.userProfile.sexo= 'M';
    this.userProfile.tipoDoc= 1;
    this.userProfile.nroDoc= "123";
    this.userProfile.calle= "calle";
    this.userProfile.nro= "123";
    this.userProfile.piso= "pb";
    this.userProfile.dpto= "1";
    this.userProfile.provincia= 1;
    this.userProfile.localidad= 1;
    this.userProfile.telefono= "telefono"; 
    this.userProfile.pass= "pepe";
    this.userProfile.usuario = 'mimail@hotmail.com';
    this.userProfile.fotoPerfil= this.defaultImage;
    var up = this.clonarObjeto(this.userProfile);
    return up;
  }

  getUserProfileAmazon()  {
    this.inicializarUserProfile();
    this.userProfile = new UserProfile();
    this.userProfile.idUsuarioVant= 1;
    this.userProfile.nombreDePerfil= "pepe";
    this.userProfile.nombre= "popo";
    this.userProfile.apellido= "a";
    this.userProfile.email= 'usuario@mail.com';
    this.userProfile.edad= 1;
    this.userProfile.sexo= 'M';
    this.userProfile.tipoDoc= null;
    this.userProfile.nroDoc= "";
    this.userProfile.calle= "s";
    this.userProfile.nro= "s";
    this.userProfile.piso= "s";
    this.userProfile.dpto= "s";
    this.userProfile.provincia= 1;
    this.userProfile.localidad= 1;
    this.userProfile.telefono= ""; 
    this.userProfile.pass= "pepe";
    this.userProfile.usuario = 'usuario@mail.com';
    this.userProfile.fotoPerfil= this.defaultImage;
    var up = this.clonarObjeto(this.userProfile);
    return up;
  }

  private rowToUserProfile(row)  {
    this.userProfile = new UserProfile();
    this.userProfile.idUsuarioVant= this.clonarObjeto(row.idUsuarioVant);
    this.userProfile.nombreDePerfil= this.clonarObjeto(row.nombreDePerfil);
    this.userProfile.nombre= this.clonarObjeto(row.nombre);
    this.userProfile.apellido= this.clonarObjeto(row.apellido);
    this.userProfile.email= this.clonarObjeto(row.email);
    this.userProfile.edad= this.clonarObjeto(row.edad);
    this.userProfile.sexo= this.clonarObjeto(row.sexo);
    this.userProfile.tipoDoc= this.clonarObjeto(row.tipoDoc);
    this.userProfile.nroDoc= this.clonarObjeto(row.nroDoc);
    this.userProfile.calle= this.clonarObjeto(row.calle);
    this.userProfile.nro= this.clonarObjeto(row.nro);
    this.userProfile.piso= this.clonarObjeto(row.piso);
    this.userProfile.dpto= this.clonarObjeto(row.dpto);
    this.userProfile.provincia= this.clonarObjeto(row.provincia);
    this.userProfile.localidad= this.clonarObjeto(row.localidad);
    this.userProfile.telefono= this.clonarObjeto(row.telefono); 
    this.userProfile.pass= this.clonarObjeto(row.pass);
    this.userProfile.usuario = this.clonarObjeto(row.usuario);
    this.userProfile.fotoPerfil= this.clonarObjeto(row.fotoPerfil);
  }

  estaLogueado(){
    if((this.userProfile.pass == null) || (this.userProfile.pass.trim() == "")){
      return false;
    }

    if((this.userProfile.usuario == null) || (this.userProfile.usuario.trim() == "")){
      return false;
    }
    return true;
  }

  tienePerfil(){   

    if((this.userProfile.nombre == null) || (this.userProfile.nombre.trim() == "")){
      return false;
    }


    if((this.userProfile.apellido == null) || (this.userProfile.apellido.trim() == "")){
      return false;
    }

    if((this.userProfile.email == null) || (this.userProfile.email.trim() == "")){
      return false;
    }

    if(this.userProfile.edad<=0){
      return false;
    }
    return true;
  }

  guardarPerfil(userProfile: UserProfile){
    userProfile.usuario = this.clonarObjeto(userProfile.email);
    return this.db.guardarPerfilUsuario(userProfile)
          .then(response => {
            return Promise.resolve(response);
          })
          .catch(error =>{
            return Promise.reject(error);
          });
  }

  modificarPerfil(userProfile){
    userProfile.usuario = this.clonarObjeto(userProfile.email);    
    return this.db.modificarPerfilUsuario(userProfile)
          .then(response => {
            return Promise.resolve(response);
          })
          .catch(error =>{
            return Promise.reject(error);
          });
  }

  loginPerfil(usuario, pass){      
    return this.db.login(usuario, pass)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(error =>{
        return Promise.reject(error);
      });
  }

  logoutPerfil(usuario){      
    return this.db.logout(usuario)
      .then(response => {
        this.inicializarUserProfile();
        return Promise.resolve(response);
      })
      .catch(error =>{
        return Promise.reject(error);
      });
  }

  clonarObjeto(objeto: any){
    var objetoClon = JSON.parse(JSON.stringify(objeto));
    return objetoClon;
  }

  alerta(userProfile){
    alert(userProfile.idUsuarioVant);
    alert(userProfile.nombreDePerfil);
    alert(userProfile.nombre);
    alert(userProfile.apellido);
    alert(userProfile.email);
    alert(userProfile.edad);
    alert(userProfile.sexo);
    alert(userProfile.tipoDoc);
    alert(userProfile.nroDoc);
    alert(userProfile.calle);
    alert(userProfile.nro);
    alert(userProfile.piso);
    alert(userProfile.dpto);
    alert(userProfile.provincia);
    alert(userProfile.localidad);
    alert(userProfile.telefono);
    alert(userProfile.pass);
    alert(userProfile.usuario);
    alert(userProfile.fotoPerfil);
  }

  getVeces(){    
    if(this.veces == 0){
      this.veces = 2;
      return 1;      
    }
    return 2;
  }

  setVeces(){
    this.veces = 0;
  }

}
