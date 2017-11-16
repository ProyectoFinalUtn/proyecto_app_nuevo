import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Navbar, Platform } from 'ionic-angular';
import { VantDetailPage } from '../vant-detail/vant-detail';
import { VantServiceProvider, Vant } from '../../providers/vant-service/vant-service';
import { PerfilProvider} from '../../providers/perfil/perfil';
import { DbProvider, UserProfile} from '../../providers/db/db';
import { HomePage } from '../home/home';
import { ConfigServiceProvider } from '../../providers/config-service/config-service';

@Component({
  selector: 'page-vant-list',
  templateUrl: 'vant-list.html'
})

export class VantListPage {
  @ViewChild(Navbar) navBar: Navbar;
  //selectedVant: any;
  vants: Array<any>;
  logueado: boolean;
  userProfile: UserProfile;
  loading;

  constructor(public navCtrl: NavController, public navParams: NavParams, private vs: VantServiceProvider, 
              private up: PerfilProvider, private db: DbProvider, public alertCtrl: AlertController, 
              public loadingCtrl: LoadingController, private cs: ConfigServiceProvider, private platform: Platform) {
    this.vants = new Array<any>();
  }

  ionViewDidLoad() {
    this.goToBack();
    this.cargarVants();
  }

  vantSeleccionado(vant) {
    this.navCtrl.push(VantDetailPage, {
      vant: vant
    });
  }

  nuevoVant() {
    this.navCtrl.push(VantDetailPage, {
      vant: null
    });
  }

  cargarVants(){
    this.logueado = this.up.estaLogueado();
    if(this.logueado){
      var vants = this.vs.getVantsUsuario();
      this.userProfile = this.up.getUserProfile();
      if(vants.length == 0){
        this.solicitarVants();
      }else{
        this.obtenerVantsUsuario(vants);
      }
    }else{
      this.alertMensaje("Error", "Debe ingresar con su perfil para acceder a esta página");
      this.backHome();
    }
  }

  solicitarVants(){
    this.showLoad().then(()=>{
      var vants = new Array<Vant>();
      this.vs.vantsPorUsuario(this.userProfile.usuario, this.userProfile.pass, this.userProfile.idUsuarioVant)
      .subscribe(
      res => {
        if(res.response){
          vants = res.response;
          this.vs.setVantsUsuario(vants);
          this.obtenerVantsUsuario(vants);
          this.hideLoad();
        }else{
          this.errorWs(res);
          this.backHome();
        }
      },
      err => {       
        this.hideLoad();
        this.errorWs(err);
        this.backHome();        
      });
    });
  }

  obtenerVantsUsuario(vants: Array<Vant>){
    this.vants = Array<any>();
    this.db.obtenerVantsUsuario(this.userProfile.idUsuarioVant).
      then(vantsFotos =>{
          vants.forEach(vant => {
          let vantFoto = this.buscarFotoVant(vantsFotos, vant);
          if(vantFoto == ""){
            vantFoto = this.cs.getImage("dron.png");
          }
          this.vants.push({vant: vant, foto: vantFoto})
        }); 
      }).catch(err => {
            this.backHome();  
      });
  }

  buscarFotoVant(vantsFotos: Array<any>, vant){
    var foto = "";
    vantsFotos.forEach(vantFoto => {
      if(vant.idVant == vantFoto.idVant){
        foto = vantFoto.foto 
        return foto;
      }
    });
    return foto;
  }

  errorWs(err){
    if(err.message != undefined)
      this.alertMensaje("Error", err.message);
    else
      this.alertMensaje("Error", "Verifique su conexión a internet");
  }

  borrarVant(vant){
    let alert = this.alertCtrl.create({
      title: "Confirme",
      message: "¿Está seguro que desea eliminar el VANT?",
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
            this.eliminarVant(vant);
          }
        }
      ]
    });
    alert.present();
  }

  eliminarVant(vantFoto){
    var vant = vantFoto.vant;
    this.showLoad().then(()=>{
      this.vs.eliminarVant(vant, this.userProfile.usuario, this.userProfile.pass)
      .subscribe(
      res => {
        this.vs.eliminarFotoVant(vant)       
        .then(response => {
          this.hideLoad();
          this.vs.unSetVant(vant);
          var vants = this.vs.getVantsUsuario();
          this.obtenerVantsUsuario(vants);
          this.alertMensaje("Confirmación", "VANT eliminado con éxito");          
        })
        .catch(error =>{
          this.hideLoad();
          this.alertMensaje("Error", error.message);
        });
      },
      err => {
        this.hideLoad();
        this.alertMensaje("Error", err.message);        
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

  backHome(){
    this.navCtrl.setRoot(HomePage);
  }

  goToBack(){
    this.platform.registerBackButtonAction(() => {
        this.navCtrl.setRoot(HomePage);
    });
  }
}
