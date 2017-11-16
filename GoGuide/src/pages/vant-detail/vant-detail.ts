import { Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Navbar, Platform } from 'ionic-angular';
import { VantListPage } from '../vant-list/vant-list';
import { PerfilProvider} from '../../providers/perfil/perfil';
import { VantServiceProvider, Vant } from '../../providers/vant-service/vant-service';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LoadingController } from 'ionic-angular';
import { ConfigServiceProvider } from '../../providers/config-service/config-service';
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-vant-detail',
  templateUrl: 'vant-detail.html',
})
export class VantDetailPage {
  @ViewChild(Navbar) navBar: Navbar;
  vant: Vant;
  vantFoto: string;
  guardarModificar: string;
  userProfile: any;
  mensajeCrearVant: string;
  loading;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, 
              private up: PerfilProvider, private vs: VantServiceProvider, private camera: Camera, 
              public loadingCtrl: LoadingController, private cs: ConfigServiceProvider, private platform: Platform) {
    var vant = this.navParams.data.vant;
    this.vant = new Vant();
    this.userProfile = this.up.getUserProfile();
    if(vant != null){
      this.vantFoto = vant.foto;
      if(this.vantFoto == ""){
        this.vantFoto = this.cs.getImage("dron.png");
      }
      this.obtenerVant(vant.vant.idVant);
      this.guardarModificar = 'Modificar';      
    }else{
      this.vantFoto = this.cs.getImage("dron.png");
      this.guardarModificar = 'Guardar';      
      this.vant.idVant = 0;
    }
  }

  ionViewDidLoad() {
    this.backButton();  
  }

  enviar(){
    if(this.valido()){
      if(this.vant.idVant == 0){
        this.guardar();
      }else{
        this.modificar();
      }
    }else{
      this.alertMensaje("Error", this.mensajeCrearVant)
    }
  }
  
  guardar(){
    this.showLoad().then(()=>{
      this.vant.idUsuarioVant = this.userProfile.idUsuarioVant;
      this.vs.guardarVant(this.vant, this.userProfile.usuario, this.userProfile.pass)
      .subscribe(
      res => {
        this.vant.idVant = res.response.idVant;
        var nuevoVant = this.vant;
        this.vs.guardarFotoVant(nuevoVant, this.vantFoto)       
        .then(response => {
          this.hideLoad();
          this.vs.setVant(nuevoVant);
          this.alertVuelveAtras("Confirmación", "VANT guardado con éxito.");     
        })
        .catch(error =>{
          this.hideLoad();
          this.alertMensaje("Error", error.message);
        });
      });
    },
    err => {
      this.hideLoad();
      this.alertMensaje("Error", err.message);
    });
  }

  modificar(){
    this.showLoad().then(()=>{
      this.vant.idUsuarioVant = this.userProfile.idUsuarioVant;
      this.vs.modificarVant(this.vant, this.userProfile.usuario, this.userProfile.pass)
      .subscribe(
      res => {
        this.vant.idVant = res.response.idVant;
        this.vs.modificarFotoVant(this.vant, this.vantFoto)       
        .then(response => {
          this.hideLoad();
          this.vs.updateVant(this.vant);
          //alert("Vant modificado con exito.");
          this.alertVuelveAtras("Confirmación", "VANT modificado con éxito.");
        })
        .catch(error =>{
          this.hideLoad();
          this.alertMensaje("Error", error.message);
        });
        /*this.vs.updateVant(this.vant);
        alert("Vant modificado con exito.");
        this.volverAlListado();*/
      },
      err => {
        this.hideLoad();
        this.alertMensaje("Error", err.message);
      });
    });
  } 

  cancelar(){
    this.confirmar("Confirmar", "¿Está seguro que desea salir? Los datos no guardados se perderán");
  }

  volverAlListado(){
    this.navCtrl.setRoot(VantListPage);
  }

  confirmar(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
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
            this.volverAlListado();
          }
        }
      ]
    });
    alert.present();
  }

  obtenerVant(idVant){
    this.showLoad().then(()=>{
      this.vs.vantPorId(idVant, this.userProfile.usuario, this.userProfile.pass).subscribe(
      res => {
          this.hideLoad();
          if(res.response){
            this.vant = res.response;
          }else{
            //alert("No se pudo obtener el vant a modificar");
            //this.volverAlListado();
            this.alertVuelveAtras("Error", "No se pudo obtener el VANT a modificar");
          }
        
      },
      err => {
        this.hideLoad();
        this.alertVuelveAtras("Error", err.message);
      });
    });
  }

  alertMensaje(titulo, msg){
    var alert = this.alertCtrl.create({
                  title:    titulo,
                  message: msg,
                  buttons:  ['OK']
                });
    alert.present();
  }

  alertVuelveAtras(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.volverAlListado();
          }
        }
      ]
    });
    alert.present();
  }

  valido(): boolean{
    this.mensajeCrearVant = "";
    var valido = true;
    if((this.vant.marca == null) || (this.vant.marca.trim() == "")){
      this.mensajeCrearVant += "El campo marca no puede estar vacío.</br>";
      valido = false;
    }

    if((this.vant.modelo == null) || (this.vant.modelo.trim() == "")){
      this.mensajeCrearVant += "El campo modelo no puede estar vacío.";
      valido = false;
    }

    return valido;
  }

  tomarFoto(){
    let options=  {
      destinationType: this.camera.DestinationType.DATA_URL,      
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      encodingType: this.camera.EncodingType.JPEG, 
      saveToPhotoAlbum: true
    }
    this.camera.getPicture(options)
      .then(imageData => {
        this.vantFoto = "data:image/jpeg;base64," + imageData;
      })
      .catch(error =>{
        console.error( error );
      });
  }

  abrirGaleria(){
    let cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,      
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      encodingType: this.camera.EncodingType.JPEG,     
      cameraDirection: this.camera.Direction.BACK, 
      correctOrientation: true
    }
    this.camera.getPicture(cameraOptions)
      .then(imageData => {
        this.vantFoto = "data:image/jpeg;base64," + imageData;
      }, 
      err => {console.log(err)});   
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

  errorWs(err){
    if(err.message != undefined)
      this.alertMensaje("Error", err.message);
    else
      this.alertMensaje("Error", "Verifique su conexión a internet");
  }

  backButton(){
    this.navBar.backButtonClick = (e:UIEvent)=>{
      this.confirmar('Confirmar', 
                    '¿Está seguro que desea salir? Los datos no guardados se perderán'
                    );

    }
    var pageEvent = this;              
    this.platform.registerBackButtonAction(() => {
        pageEvent.confirmar('Confirmar', 
                            '¿Está seguro que desea salir? Los datos no guardados se perderán'
                            );
    });
  }

}
