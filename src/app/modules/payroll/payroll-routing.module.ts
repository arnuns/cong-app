import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PayrollComponent } from './pages/payroll/payroll.component';
import { SalaryComponent } from './pages/salary/salary.component';


const routes: Routes = [
  {
    path: '',
    component: PayrollComponent
  },
  {
    path: ':id/salary/:siteid',
    component: SalaryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
