import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Navbar, Platform } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { UsuarioServiceProvider } from '../../providers/usuario-service/usuario-service';
import { DireccionServiceProvider } from '../../providers/direccion-service/direccion-service';
import { DbProvider, UserProfile} from '../../providers/db/db';
import { PerfilProvider} from '../../providers/perfil/perfil';
import { PerfilDetallePage } from '../perfil-detalle/perfil-detalle';
import { LoadingController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-crear-perfil',
  templateUrl: 'crear-perfil.html',
})

export class CrearPerfilPage{
  @ViewChild(Navbar) navBar: Navbar;
  datosOpcionales: boolean;
  //imageSrc: string;
  users: Array<any>;
  userProfile: UserProfile;
  mensajeCrearPerfil:string;
  crearModificar: string;
  loading;
  provincias: Array<any>;
  localidades: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, 
              public loadingCtrl: LoadingController, private camera: Camera, public us: UsuarioServiceProvider, 
              public up: PerfilProvider, public db: DbProvider, private ds: DireccionServiceProvider, private platform: Platform) {
    
    this.userProfile = this.up.getUserProfile();
    this.provincias = new Array<any>();
    this.localidades = new Array<any>();
  }

  ionViewDidLoad() {
    this.datosOpcionales = false;
    this.setProvincias();
    this.backButton();
    this.crearModificar = !this.up.tienePerfil() ? 'Crear Perfil' : 'Modificar Perfil';        
  }

  setProvincias() {
    this.showLoad().then(()=>{
      this.ds.obtenerProvincias()
      .subscribe(
      res => {
        this.provincias = res.response;
        this.hideLoad();
        if(this.up.tienePerfil()){
          if(this.userProfile.provincia != null){
            this.setLocalidades(this.userProfile.provincia);
          }
        }    
      },
      err => {
        this.hideLoad();
        this.errorWs(err);
      });
    });
  }  

  provinciaSelected(e){
    this.setLocalidades(e);
  }

  setLocalidades(idProvincia) {
    this.showLoad().then(()=>{
      this.ds.obtenerLocalidadesProvincia(idProvincia)
      .subscribe(
      res => {
        this.localidades = res.response;  
        this.hideLoad();
      },
      err => {
        this.hideLoad();
        this.errorWs(err);        
      });
    });
  }  

  registro(){
    if(this.valido()){
      if(!this.up.tienePerfil()){
        this.guardar();
      }else{
        this.modificar();
      }
    }else{
      this.alertPerfil("Error", this.mensajeCrearPerfil);      
    }
  }

  tomarFoto(){
    let options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000,
      quality: 100,
      saveToPhotoAlbum: true
    }
    this.camera.getPicture(options)
    .then(imageData => {
      this.userProfile.fotoPerfil =  "data:image/jpeg;base64," + imageData;
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
      correctOrientation: true
    }
    var userProfile = this.userProfile;
    this.camera.getPicture(cameraOptions)
      .then(data_url => {
        this.userProfile.fotoPerfil = "data:image/jpeg;base64," + data_url;
      }, 
      err => {console.log(err)});   
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
            this.irAlDetalle();
          }
        }
      ]
    });
    alert.present();
  }
  
  valido(): boolean{
    this.mensajeCrearPerfil = "";
    var valido = true;
    if((this.userProfile.nombreDePerfil == null) || (this.userProfile.nombreDePerfil.trim() == "")){
      this.mensajeCrearPerfil += "El campo nombre de perfil no puede estar vacío. <br/>";
      valido = false;
    }

    if((this.userProfile.nombre == null) || (this.userProfile.nombre.trim() == "")){
      this.mensajeCrearPerfil += "El campo nombre no puede estar vacío. <br/>";
      valido = false;
    }


    if((this.userProfile.apellido == null) || (this.userProfile.apellido.trim() == "")){
      this.mensajeCrearPerfil += "El campo apellido no puede estar vacío. <br/>";
      valido = false;
    }

    if((this.userProfile.email == null) || (this.userProfile.email.trim() == "")){
      this.mensajeCrearPerfil += "El campo email no puede estar vacío. <br/>";
      valido = false;
    }

    if(!this.validateEmail(this.userProfile.email)){
      this.mensajeCrearPerfil += "El campo email es inválido. <br/>";
      valido = false;
    }

    if(this.userProfile.edad < 18){
      this.mensajeCrearPerfil += "El campo edad no puede ser menor que 18.<br/>";
      valido = false;
    }

    return valido;
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  alertPerfil(titulo, msg){
    var alert = this.alertCtrl.create({
                  title:    titulo,
                  subTitle: msg,
                  buttons:  ['OK']
                });
    alert.present();
    
    //alert(msg.replace("<br/>", '\n'));
  }

  alertMensaje(titulo, msg){
    var alert = this.alertCtrl.create({
                  title:    titulo,
                  subTitle: msg,
                  buttons:  ['OK']
                });
    alert.present();
  }

  mostrarDatosOpcionales(event) {
    this.datosOpcionales = !this.datosOpcionales;
  }

  guardar(){
    this.showLoad().then(()=>{
      this.us.crearPerfil(this.userProfile)
      .subscribe(
      res => {
        this.userProfile.idUsuarioVant = res.response.idUsuarioVant;
        this.up.guardarPerfil(this.userProfile)       
        .then(response => {
          this.hideLoad();
          this.alertPerfil("Información", "Perfil creado con éxito");
          this.up.setUserProfile(this.userProfile);
          this.irAlDetalle();
        })
        .catch(error =>{
          this.hideLoad();
          this.alertPerfil("Error", error.message);
        });
      },
      err => {
        this.hideLoad();
        this.errorWs(err);        
      });
    });
  }

  modificar(){
    this.showLoad().then(()=>{
      this.us.modificarPerfil(this.userProfile)
      .subscribe(
      res => {
        this.userProfile.idUsuarioVant = res.response.idUsuarioVant;
        this.up.modificarPerfil(this.userProfile)
        .then(response => {
          this.hideLoad();
          this.up.setUserProfile(this.userProfile);
          this.alertPerfil("Información", "Perfil creado con éxito");
          this.irAlDetalle();
        })
        .catch(error =>{
          this.hideLoad();
          this.alertPerfil("Error", error.message);
          
        });
      },
      err => {
        this.hideLoad();
        this.errorWs(err);        
      });
    });
  }

  irAlDetalle() {
    this.navCtrl.setRoot(PerfilDetallePage, {
      veces: 2
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
