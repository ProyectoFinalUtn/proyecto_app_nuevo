import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { UsuarioServiceProvider } from '../../providers/usuario-service/usuario-service';
import { ConfigServiceProvider } from '../../providers/config-service/config-service';

@IonicPage()
@Component({
  selector: 'page-registrase-cad',
  templateUrl: 'registrase-cad.html',
})
export class RegistraseCadPage {
  panelRegistracion: boolean;
  imageSrc: string;
  provincias: Array<string>;
  users: Array<any>

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
              private camera: Camera, public us: UsuarioServiceProvider, private cs: ConfigServiceProvider) {
    /*const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }*/
    
  }

  ionViewDidLoad() {
    this.imageSrc = this.cs.getImage('perfil.jpg');
    this.panelRegistracion = false;
    this.setProvincias();
    this.us.getUsers()
    .subscribe( users => {
      this.users = users;
      console.log(this.users);
    });
  }

  setProvincias() {
    this.provincias = ['Buenos aires', 'Capital', 'Chaco', 'Cordoba'];
  }  

  registro(){
    this.panelRegistracion = !this.panelRegistracion;
    let alert = this.alertCtrl.create({
      title:    'Contacto',
      subTitle: 'Su petición ha sido enviada exitosamente!',
      buttons:  ['OK']
    });
    alert.present();
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
      this.imageSrc =  "data:image/jpeg;base64," + imageData;
    })
    .catch(error =>{
      console.error( error );
    });
  }

  abrirGaleria(){
    let cameraOptions = {
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    destinationType: this.camera.DestinationType.FILE_URI,      
    quality: 100,
    targetWidth: 1000,
    targetHeight: 1000,
    encodingType: this.camera.EncodingType.JPEG,      
    correctOrientation: true
  }

  this.camera.getPicture(cameraOptions)
    .then(file_uri => this.imageSrc = file_uri, 
    err => console.log(err));   
  }

}
