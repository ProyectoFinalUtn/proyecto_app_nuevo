import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Navbar, Platform } from 'ionic-angular';
import { UsuarioServiceProvider } from '../../providers/usuario-service/usuario-service';
import { DbProvider, UserProfile} from '../../providers/db/db';
import { PerfilProvider} from '../../providers/perfil/perfil';
import { CrearPerfilPage } from '../crear-perfil/crear-perfil';
import { PerfilPage } from '../perfil/perfil';
import { HomePage } from '../home/home';
import { VantServiceProvider } from '../../providers/vant-service/vant-service';

@IonicPage()
@Component({
  selector: 'page-perfil-detalle',
  templateUrl: 'perfil-detalle.html',
})
export class PerfilDetallePage {
  @ViewChild(Navbar) navBar: Navbar;
  tieneUsuario: boolean;
  datosOpcionales: boolean;
  userProfile: UserProfile;
  loading;
  veces = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams, 
              public us: UsuarioServiceProvider, public up: PerfilProvider, 
              public db: DbProvider, public alertCtrl: AlertController, private vs: VantServiceProvider,
              public loadingCtrl: LoadingController, private platform: Platform) {
    this.userProfile = this.up.getUserProfile();
    if(this.navParams.get("veces") != undefined)
      this.veces = this.navParams.data.veces;
  }

  ionViewDidLoad() {
    this.goToBack();
    this.showLoad().then(()=>{
      this.tieneUsuario = this.up.tienePerfil();
      if(!this.tieneUsuario)
        this.irAlLogin();
      this.datosOpcionales = false;
      this.userProfile = this.up.getUserProfile();
      if(this.veces == 1){
        this.getUser();
      }
      else{
        this.hideLoad();
      }
    });
  }

  mostrarDatosOpcionales(event) {
    this.datosOpcionales = !this.datosOpcionales;
  }

  modificar() {
    this.navCtrl.push(CrearPerfilPage);
  }

  logoutPerfil() {
    this.up.logoutPerfil(this.userProfile.usuario)
    .then(response => {
      this.vs.clearAllVants();
      this.irAlLogin();
    }).catch(error =>{
      this.errorWs(error.message);
    });
  }

  irAlLogin() {
    this.navCtrl.setRoot(PerfilPage);
  }
  
  tipoNroDoc(userProfile){
    return (userProfile.tipoDoc == 1 ? 'DNI' : '') + ' ' + userProfile.nroDoc;
  }

  getUser() {
    this.us.loginPerfil(this.userProfile.usuario, this.userProfile.pass)
    .subscribe(
    res => {
      if(res.response.pass){ 
        this.veces++;  
        var userProfile = new UserProfile();
        userProfile = this.up.clonarObjeto(res.response);
        userProfile.fotoPerfil = this.userProfile.fotoPerfil;
        userProfile.pass = this.userProfile.pass;
        this.registrarLogin(userProfile);
        this.hideLoad();   
      }
    },
    err => {
      //this.errorWs(err);
      this.hideLoad();
    });
  }

  showLoad() {
    this.loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Espere por favor.',
      dismissOnPageChange: false
    });

    return this.loading.present();
  }

  hideLoad(){
    this.loading.dismiss();
  }

  alertMensaje(titulo, msg){
    var alert = this.alertCtrl.create({
                  title:    titulo,
                  subTitle: msg,
                  buttons:  ['OK']
                });
    alert.present();
  }

  errorWs(err){
    if(err.message != undefined)
      this.alertMensaje("Error", err.message);
    else
      this.alertMensaje("Error", "Verifique su conexión a internet");
  }

  registrarLogin(userProfile: UserProfile){
    try{
      this.db.obtenerPerfilNoLog(userProfile.usuario).then(response => {
        if(response.rows.length > 0){
          this.up.modificarPerfil(userProfile).
          then(response => {
            this.userProfile = userProfile;
            this.actualiza();
          }).catch(error =>{
            this.alertMensaje("Error", "Error al actualizar los datos del usuario.");
          });
        }
      });
    }
    catch(error){
      alert("Se produjo un error al actualizar el usuario");
    }
  }

  actualiza(){
    this.up.setUserProfile(this.userProfile);
  }

  goToBack(){
    this.platform.registerBackButtonAction(() => {
        this.navCtrl.setRoot(HomePage);
    });
  }
}
