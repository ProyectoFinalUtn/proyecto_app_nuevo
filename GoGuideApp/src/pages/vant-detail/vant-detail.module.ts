import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VantDetailPage } from './vant-detail';

@NgModule({
  declarations: [
    VantDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(VantDetailPage),
  ],
})
export class VantDetailPageModule {}
