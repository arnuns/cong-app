import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeWelfareFundComponent } from './pages/employee-welfare-fund/employee-welfare-fund.component';

export const employeeWelfareFundRoutes: Routes = [
  {
    path: '',
    component: EmployeeWelfareFundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(employeeWelfareFundRoutes)],
  exports: [RouterModule]
})
export class EmployeeWelfareFundRoutingModule { }
