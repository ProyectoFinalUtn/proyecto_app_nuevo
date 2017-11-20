import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { GoGuide } from './app.component';
import { HomePage } from '../pages/home/home';
import { VantListPage } from '../pages/vant-list/vant-list';
import { VantDetailPage } from '../pages/vant-detail/vant-detail';
import { MapPage } from '../pages/map/map';
import { PerfilPage } from '../pages/perfil/perfil';
import { PerfilDetallePage } from '../pages/perfil-detalle/perfil-detalle';
import { CrearPerfilPage } from '../pages/crear-perfil/crear-perfil';
import { RegistraseCadPage } from '../pages/registrase-cad/registrase-cad';
import { SolicitudListPage } from '../pages/solicitud-list/solicitud-list';
import { SolicitudPage } from '../pages/solicitud/solicitud';
import { NormativaPage } from '../pages/normativa/normativa';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera } from '@ionic-native/camera';
import { HttpModule } from '@angular/http';
import { UsuarioServiceProvider } from '../providers/usuario-service/usuario-service';
import { DbProvider } from '../providers/db/db';
import { SQLite } from '@ionic-native/sqlite';
import { PerfilProvider } from '../providers/perfil/perfil';
import { SolicitudServiceProvider } from '../providers/solicitud-service/solicitud-service';
import { VantServiceProvider } from '../providers/vant-service/vant-service';
import { ConfigServiceProvider } from '../providers/config-service/config-service';
import { GeoserverServiceProvider } from '../providers/geoserver-service/geoserver-service';
import { DireccionServiceProvider } from '../providers/direccion-service/direccion-service';
import { OpenweathermapServiceProvider } from '../providers/openweathermap-service/openweathermap-service';
import { NormativaServiceProvider } from '../providers/normativa-service/normativa-service';
import { VueloServiceProvider } from '../providers/vuelo-service/vuelo-service';
import { ZonasServiceProvider } from '../providers/zonas-service/zonas-service';
import { Facebook } from '@ionic-native/facebook';

@NgModule({
  declarations: [
    GoGuide,
    HomePage,
    VantListPage,
    VantDetailPage,
    MapPage,
    PerfilPage,
    PerfilDetallePage,
    CrearPerfilPage,
    RegistraseCadPage,
    SolicitudListPage,
    SolicitudPage,
    NormativaPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(GoGuide),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    GoGuide,
    HomePage,
    VantListPage,
    VantDetailPage,
    MapPage,
    PerfilPage,
    PerfilDetallePage,
    RegistraseCadPage,
    CrearPerfilPage,
    SolicitudListPage,
    SolicitudPage,
    NormativaPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation, 
    Camera,
    SQLite,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UsuarioServiceProvider,
    DbProvider,
    PerfilProvider,
    SolicitudServiceProvider,
    VantServiceProvider,
    ConfigServiceProvider,
    GeoserverServiceProvider,
    DireccionServiceProvider,
    OpenweathermapServiceProvider,
    NormativaServiceProvider,
    VueloServiceProvider,
    ZonasServiceProvider,
    Facebook
  ]
})
export class AppModule {}
