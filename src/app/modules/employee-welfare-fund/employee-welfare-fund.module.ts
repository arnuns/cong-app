import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { EmployeeWelfareFundRoutingModule } from './employee-welfare-fund-routing.module';
import { EmployeeWelfareFundComponent } from './pages/employee-welfare-fund/employee-welfare-fund.component';

@NgModule({
  declarations: [EmployeeWelfareFundComponent],
  imports: [
    CommonModule,
    EmployeeWelfareFundRoutingModule,
    SharedModule
  ]
})
export class EmployeeWelfareFundModule { }
