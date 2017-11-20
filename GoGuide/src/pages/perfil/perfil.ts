import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Navbar, Platform } from 'ionic-angular';
import { UsuarioServiceProvider } from '../../providers/usuario-service/usuario-service';
import { RegistraseCadPage } from '../registrase-cad/registrase-cad';
import { CrearPerfilPage } from '../crear-perfil/crear-perfil';
import { DbProvider, UserProfile} from '../../providers/db/db';
import { PerfilProvider} from '../../providers/perfil/perfil';
import { PerfilDetallePage } from '../perfil-detalle/perfil-detalle';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {
  @ViewChild(Navbar) navBar: Navbar;
  panelRegistracion: boolean;
  estaLogueado: boolean;
  imageSrc: string;
  users: Array<any>;
  usuario: string;
  pass: string;
  loading;
  esperePorFavor: number;
  

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
              public us: UsuarioServiceProvider, public db: DbProvider, public up: PerfilProvider, 
              public loadingCtrl: LoadingController, private platform: Platform) {    
    this.esperePorFavor = 0;
  }

  ionViewDidLoad() {
    this.goToBack();
    this.panelRegistracion = false;
    this.estaLogueado = this.up.estaLogueado();
  }

  mostrarPanelRegistracion(event) {
    this.panelRegistracion = !this.panelRegistracion;
  }

  registroCad() {
    this.navCtrl.push(RegistraseCadPage);
  }

  crearPerfil() {
    this.navCtrl.push(CrearPerfilPage);
  }

  login(){

  }

  loginPerfil() {
    this.showLoad().then(()=>{
      this.us.loginPerfil(this.usuario, this.pass)
      .subscribe(
      res => {
        if(res.response.pass){   
          this.hideLoad();       
          var userProfile = new UserProfile();
          userProfile = this.up.clonarObjeto(res.response);
          userProfile.fotoPerfil = this.up.defaultImage;
          this.registrarLogin(userProfile);
        }else{
          this.hideLoad();
          this.errorWs(res);
        }
      },
      err => {
        this.hideLoad();
        this.errorWs(err);
      });
    });
  }

  irAlDetalle() {
    this.navCtrl.setRoot(PerfilDetallePage);
  }

  registrarLogin(userProfile: UserProfile){
    userProfile.pass = this.pass;
    this.db.obtenerPerfilNoLog(userProfile.usuario).then(response => {
      if(response.rows.length > 0){
        this.up.loginPerfil(this.usuario, this.pass)
        .then(response => {
          this.actualizaUpAndGoToDetalle();
        }).catch(error =>{
          this.hideLoad();
          this.errorWs(error);
        });
      }else{
        this.up.guardarPerfil(userProfile)
        .then(response => {
          this.actualizaUpAndGoToDetalle();
        }).catch(error =>{
          this.hideLoad();
          this.errorWs(error);
        });
      }
    });
  }

  actualizaUpAndGoToDetalle(){
    this.up.obtenerUserProfile()
    .then(perfilUsuario => {
        this.irAlDetalle();
    })
    .catch(error =>{
      this.alertMensaje("Error", error);
    });
  }

  showLoad() {
    if(this.esperePorFavor > 0){
      this.hideLoad();
    }
    this.esperePorFavor++;
    this.loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Espere por favor.',
      dismissOnPageChange: false
    });

    return this.loading.present();
  }

  hideLoad(){
    if(this.esperePorFavor != 0){
      this.esperePorFavor = 0;
      this.loading.dismiss().then(()=>{} ,
      err => {});
    }
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
    if((err.message != undefined) && (err.message != null)){
      if(err.message.toLowerCase().includes("json")){
        err.message = "Verifique su conexión a internet";
      }
      this.alertMensaje("Error", err.message);
    }
    else{
      this.alertMensaje("Error", "Verifique su conexión a internet");
    }
  }

  goToBack(){
    this.platform.registerBackButtonAction(() => {
      this.goToHome();
    });
  }

  goToHome(){
    if(this.esperePorFavor > 0){
      this.hideLoad();
    }
    this.navCtrl.setRoot(HomePage);
  }
}
