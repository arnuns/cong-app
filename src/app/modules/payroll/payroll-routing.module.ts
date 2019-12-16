import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PayrollComponent } from './pages/payroll/payroll.component';
import { SalaryComponent } from './pages/salary/salary.component';
import { PayslipComponent } from './pages/report/payslip/payslip.component';

const routes: Routes = [
  {
    path: '',
    component: PayrollComponent
  },
  {
    path: ':id/site/:siteid/salary',
    component: SalaryComponent
  },
  {
    path: ':id/site/:siteid/payslip',
    component: PayslipComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
