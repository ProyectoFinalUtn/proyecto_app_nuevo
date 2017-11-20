import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, Navbar, Platform } from 'ionic-angular';
import { SolicitudPage } from '../solicitud/solicitud';
import { HomePage } from '../home/home';
import { SolicitudServiceProvider } from '../../providers/solicitud-service/solicitud-service';
import { PerfilProvider} from '../../providers/perfil/perfil';
import { UserProfile} from '../../providers/db/db';
import { LoadingController } from 'ionic-angular';

@Component({
  selector: 'page-solicitud-list',
  templateUrl: 'solicitud-list.html',
})
export class SolicitudListPage {
  @ViewChild(Navbar) navBar: Navbar;
  selectedSolicitud: any;
  solicitudes: Array<any>;
  logueado: boolean;
  userProfile: UserProfile;
  iconSolicitud: string;
  loading;
  esperePorFavor: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, private ss: SolicitudServiceProvider, 
              private up: PerfilProvider, public alertCtrl: AlertController, 
              public loadingCtrl: LoadingController, private platform: Platform ) {
    this.esperePorFavor = 0;
    this.solicitudes = [];
    this.iconSolicitud = 'clock';
  }

  ionViewDidLoad() {
    this.goToBack();
    this.cargarSolicitudes();
  }

  modificarSelicitud(solicitud) {
    this.navCtrl.push(SolicitudPage, {
      solicitud: solicitud
    });
  }

  cargarSolicitudes(){
    this.logueado = this.up.estaLogueado();
    if(this.logueado){
      this.userProfile = this.up.getUserProfile();
      this.obtenerSolicitudes();
    }else{
      this.alertMensaje("Error", "Debe ingresar con su perfil para acceder a esta página.");
      this.backToHome();
    }
  }

  obtenerSolicitudes(){
    this.showLoad().then(()=>{
      this.ss.solicitudesPorUsuario(this.userProfile.usuario, this.userProfile.pass, this.userProfile.idUsuarioVant)
      .subscribe(
      res => {
        this.hideLoad();
        if(res.response){
          this.solicitudes = res.response;          
        }else{
          this.errorWs(res);
          this.backToHome();
        }        
      },
      err => {
        this.hideLoad();
        this.errorWs(err);
        this.backToHome();
      });
    });
  }

  nuevaSolcitud() {
    this.navCtrl.push(SolicitudPage, {
      vant:null
    });
  }

  borrarSolicitud(solicitud){
    let alert = this.alertCtrl.create({
      title: "Confirmación",
      message: "¿Está seguro que desea eliminar la solicitud?",
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            return;
          }
        },
        {
          text: 'Sí',
          handler: () => {
            this.eliminarSolicitud(solicitud);
          }
        }
      ]
    });
    alert.present();
  }

  eliminarSolicitud(solicitud){
    this.showLoad().then(()=>{
      this.ss.eliminarSolicitud(solicitud, this.userProfile.usuario, this.userProfile.pass)
      .subscribe(
      res => {
        this.hideLoad();
        this.alertMensaje("Confirmación", "Solicitud eliminada con éxito")
        this.obtenerSolicitudes();
      },
      err => {
        this.hideLoad();
        this.errorWs(err);
      });
    });
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

  backToHome(){    
    this.navCtrl.setRoot(HomePage);
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

  getIconSolicitud(solicitud){
    this.iconSolicitud = 'clock'
    if(solicitud.idEstadoSolicitud == 2)
      this.iconSolicitud = 'checkmark-circle'
    if(solicitud.idEstadoSolicitud == 3)
      this.iconSolicitud = 'close-circle'

    if(solicitud.idEstadoSolicitud == 4)
      this.iconSolicitud = 'timer'
    
    return this.iconSolicitud;
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
