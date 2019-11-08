import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { SharedModule } from '../shared/shared.module';
import { EmployeeComponent } from './pages/employee/employee.component';
import { EditEmployeeComponent } from './pages/edit-comployee/edit-employee.component';
import { AddEmployeeComponent } from './pages/add-comployee/add-employee.component';
import { DetailEmployeeComponent } from './pages/detail-employee/detail-employee.component';
import { DocumentComponent } from './pages/document/document.component';

@NgModule({
  declarations: [EmployeeComponent, EditEmployeeComponent, AddEmployeeComponent, DetailEmployeeComponent, DocumentComponent],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    SharedModule
  ]
})
export class EmployeeModule { }
