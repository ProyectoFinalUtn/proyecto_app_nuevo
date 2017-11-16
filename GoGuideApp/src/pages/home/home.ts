import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, NavParams, Navbar, Platform  } from 'ionic-angular';
import { VantListPage } from '../vant-list/vant-list';
import { MapPage } from '../map/map';
import { PerfilPage } from '../perfil/perfil';
import { PerfilProvider} from '../../providers/perfil/perfil';
import { PerfilDetallePage } from '../perfil-detalle/perfil-detalle';
import { SolicitudListPage } from '../solicitud-list/solicitud-list';
import { NormativaPage } from '../normativa/normativa';
import { SolicitudPage } from '../solicitud/solicitud';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  creaMira: string
  logueado: boolean;
  user: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private up: PerfilProvider, 
              private platform: Platform, public alertCtrl: AlertController) {
    this.creaMira = "Cargá "
    if(this.navParams.data.redirect != undefined){
      this.redirectTo(this.navParams.data.redirect);
    }   
  }

  ionViewDidEnter() {
    this.goToBack();
    this.user = this.up.getUserProfile();
    if(this.user != undefined && this.user != null){
      this.logueado = this.up.estaLogueado();
      if(this.logueado){
        this.creaMira = "Mirá "
      }else{
        this.creaMira = "Cargá "
      }
    }else{
      var navCtrl = this.navCtrl;
      setTimeout(function(){ 
        navCtrl.setRoot(HomePage);
      }, 1000);
    }
    

   /* this.op.obtenerClima("-34.60389", "-58.37056").subscribe(
      res => {
       //var clima = this.op.responseToClima(res);
       console.log(res);
      },
      err => {
        console.log(err);
        alert("Error");
      })*/
  }

  irPerfil() {
    if(this.logueado){
      var veces = this.up.getVeces();
      this.irA(PerfilDetallePage, veces);
    }else{
      this.irA(PerfilPage,2);
    }    
  }

  irVant() {
    this.irA(VantListPage, 2);
  }

  irMapa() {
    this.irA(MapPage, 2);
  }

  irExcepcion() {
    this.irA(SolicitudListPage, 2);
  }

  irNormativa() {
    this.irA(NormativaPage, 2);
  }

  irA(page, veces) {    
    this.navCtrl.setRoot(page, {
      veces: veces
    });
  }

  redirectTo(redirect){
    switch (redirect) {
      case "Solicitud":
          var lat = this.navParams.data.lat;
          var lon = this.navParams.data.lon;
          this.navCtrl.push(SolicitudPage, {
            vant:null,
            lat: lat,
            lon: lon
          });
      break;
    }
  }

  goToBack(){  
    this.platform.registerBackButtonAction(() => {
      let alert = this.alertCtrl.create({
        title: "Confirmación",
        message: "¿Está seguro que desea salir de la aplicación?",
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
              this.platform.exitApp();
            }
          }
        ]
      });
      alert.present();
    });
  }
}
