import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PayrollRoutingModule } from './payroll-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PayrollComponent } from './pages/payroll/payroll.component';


@NgModule({
  declarations: [PayrollComponent],
  imports: [
    CommonModule,
    PayrollRoutingModule,
    SharedModule,
  ]
})
export class PayrollModule { }
