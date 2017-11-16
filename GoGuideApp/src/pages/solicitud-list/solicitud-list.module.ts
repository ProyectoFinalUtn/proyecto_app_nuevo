import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SolicitudListPage } from './solicitud-list';

@NgModule({
  declarations: [
    SolicitudListPage,
  ],
  imports: [
    IonicPageModule.forChild(SolicitudListPage),
  ],
})
export class SolicitudListPageModule {}
