import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SolicitudPage } from './solicitud';

@NgModule({
  declarations: [
    SolicitudPage,
  ],
  imports: [
    IonicPageModule.forChild(SolicitudPage),
  ],
})
export class SolicitudPageModule {}
