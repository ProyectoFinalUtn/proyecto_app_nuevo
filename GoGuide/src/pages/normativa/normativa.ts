import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Navbar, Platform } from 'ionic-angular';
import { NormativaServiceProvider, Normativa } from '../../providers/normativa-service/normativa-service';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-normativa',
  templateUrl: 'normativa.html',
})
export class NormativaPage {
  @ViewChild(Navbar) navBar: Navbar;
  loading;
  normativa: Normativa;
  esperePorFavor: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              private ns: NormativaServiceProvider, public loadingCtrl: LoadingController,
              public alertCtrl: AlertController, private platform: Platform) {
    this.normativa = new Normativa();
    this.normativa.contenido_html = "";
    this.esperePorFavor = 0;
  }

  ionViewDidLoad() {
    this.goToBack();
    this.obtenerDatosNormativa();
  }

  obtenerDatosNormativa(){
    this.showLoad().then(()=>{
       this.ns.obtenerDatosNormativas()
      .subscribe(
      res => {
        if(res.response){   
          this.hideLoad();       
          var normativas = res.response;
          if(normativas.length > 0){
            this.normativa = normativas[0];
          }
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
