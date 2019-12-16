import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PayrollRoutingModule } from './payroll-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PayrollComponent } from './pages/payroll/payroll.component';
import { SalaryComponent } from './pages/salary/salary.component';
import { PayslipComponent } from './pages/report/payslip/payslip.component';


@NgModule({
  declarations: [PayrollComponent, SalaryComponent, PayslipComponent],
  imports: [
    CommonModule,
    PayrollRoutingModule,
    SharedModule,
  ]
})
export class PayrollModule { }
