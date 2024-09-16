import { NgModule } from '@angular/core';
import { CommonModule, DatePipe  } from '@angular/common';

import { SiteRoutingModule } from './site-routing.module';
import { AddSiteComponent } from './pages/add-site/add-site.component';
import { EditSiteComponent } from './pages/edit-site/edit-site.component';
import { SiteComponent } from './pages/site/site.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [AddSiteComponent, EditSiteComponent, SiteComponent],
  imports: [
    CommonModule,
    SiteRoutingModule,
    SharedModule
  ],
  providers: [
    DatePipe  // เพิ่ม DatePipe ใน providers
  ]
})
export class SiteModule { }
