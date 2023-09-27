import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IncomeTaxRoutingModule } from './income-tax-routing.module';
import { SharedModule } from '../shared/shared.module';
import { IncomeTaxComponent } from './pages/income-tax/income-tax.component';


@NgModule({
  declarations: [IncomeTaxComponent],
  imports: [
    CommonModule,
    IncomeTaxRoutingModule,
    SharedModule
  ]
})
export class IncomeTaxModule { }
