import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PerfilDetallePage } from './perfil-detalle';

@NgModule({
  declarations: [
    PerfilDetallePage,
  ],
  imports: [
    IonicPageModule.forChild(PerfilDetallePage),
  ],
})
export class PerfilDetallePageModule {}
