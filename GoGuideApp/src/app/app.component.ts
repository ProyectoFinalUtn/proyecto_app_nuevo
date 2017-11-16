import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { VantListPage } from '../pages/vant-list/vant-list';
import { MapPage } from '../pages/map/map';
import { PerfilPage } from '../pages/perfil/perfil';
import { PerfilDetallePage } from '../pages/perfil-detalle/perfil-detalle';
import { SolicitudListPage } from '../pages/solicitud-list/solicitud-list';
import { NormativaPage } from '../pages/normativa/normativa';

import { PerfilProvider } from '../providers/perfil/perfil';
import { DbProvider } from '../providers/db/db';
import { ConfigServiceProvider } from '../providers/config-service/config-service';
import { SQLite } from '@ionic-native/sqlite';

@Component({
  templateUrl: 'app.html'
})
export class GoGuide {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any, icon:string}>;

  constructor(public platform: Platform, public statusBar: StatusBar, 
              public splashScreen: SplashScreen, public per: PerfilProvider,
              public db: DbProvider, public sqlite: SQLite) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'G.O Guide', component: HomePage, icon:'home' },
      { title: 'Perfil', component: PerfilPage, icon:'person' },
      { title: 'Mis Vants', component: VantListPage, icon:'nuclear' },
      { title: 'Volar', component: MapPage, icon:'map' },
      { title: 'Excepciones', component: SolicitudListPage, icon:'clipboard' },
      { title: 'Normativa', component: NormativaPage, icon:'book' }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.per.setVeces();
      this.createDatabase();
      
      //Las siguientes 11 lineas es para que funcione en browser, para el emulador comentar, hasta inicio inclusive
      /*var tipoUsuario = "vacio";
      if(tipoUsuario == "vacio"){
        this.per.getUserProfileHarcodeadoVacio();
      }else{
        if(tipoUsuario == "amazon"){
          this.per.getUserProfileAmazon();
        }else{
          this.per.getUserProfileHarcodeado();
        }       
      }
      this.inicio();*/
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario   
    var pagePerfile = this.pages[1];
    if(this.per.estaLogueado()){
      pagePerfile.component = PerfilDetallePage;
    }else{
      pagePerfile.component = PerfilPage;
    }
    try {
      var veces = 2;
      if(page.component == PerfilDetallePage){
        veces = this.per.getVeces()
      }
      this.nav.setRoot(page.component, {
        veces: veces
      });
    } catch (error) {
      
    }
  }

  private createDatabase(){
    this.sqlite.create({
      name: 'goguide.db',
      location: 'default' // the location field is required
    })
    .then((db) => {
      this.db.setDatabase(db);
      this.crearTablas();
    })
    .catch(error =>{
      alert(error);
      this.inicio();
    });
  }

  inicio(){
    this.statusBar.styleDefault();
    this.splashScreen.hide();
  }

  crearTablas(){
    this.db.crearUsuarioPerfil()
    .then(response => {
      this.db.crearTablaVant()
      .then(response => {
        this.obtenerUsuarioLogueado();
      })
      .catch(error =>{
          alert("Error al crear las tablas de los vant del usuario.");
          this.inicio();
      });
    })
    .catch(error =>{
        alert("Error al crear las tablas del usuario.");
        this.inicio();
    });
  }

  obtenerUsuarioLogueado()  {
    var pagePerfile = this.pages[1];
    this.per.obtenerUserProfile()
    .then(perfilUsuario => {
      if(this.per.estaLogueado()){
        pagePerfile.component = PerfilDetallePage;
      }
      this.inicio();
    })
    .catch(error =>{
      alert(error.message);
      this.inicio();
    });
  }

  backButtonClick(){
    this.platform.registerBackButtonAction(() => {
        // get current active page
        let view = this.nav.getActive();
        if (this.esPrimeraPagina(view.component.name)) {
            this.nav.setRoot(HomePage);
        } else {
            this.nav.pop();
        }
    });
  }

  esPrimeraPagina(nombre){
    var esPrimeraPagina = false;
    this.pages.forEach(page => {
      if (page.component.name == nombre) {
        esPrimeraPagina = true
        return esPrimeraPagina
      }
    });
    return esPrimeraPagina;
  }
}
