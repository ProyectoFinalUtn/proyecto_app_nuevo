import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Navbar, Platform } from 'ionic-angular';
import { NormativaServiceProvider, Normativa } from '../../providers/normativa-service/normativa-service';
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-normativa',
  templateUrl: 'normativa.html',
})
export class NormativaPage {
  @ViewChild(Navbar) navBar: Navbar;
  loading;
  normativa: Normativa;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              private ns: NormativaServiceProvider, public loadingCtrl: LoadingController,
              public alertCtrl: AlertController, private platform: Platform) {
    this.normativa = new Normativa();
    this.normativa.contenido_html = "";
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

  goToBack(){
    this.platform.registerBackButtonAction(() => {
        this.navCtrl.setRoot(HomePage);
    });
  }

}
