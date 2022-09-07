import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { SharedModule } from '../shared/shared.module';
import { EmployeeComponent } from './pages/employee/employee.component';
import { EditEmployeeComponent } from './pages/edit-employee/edit-employee.component';
import { AddEmployeeComponent } from './pages/add-employee/add-employee.component';
import { DetailEmployeeComponent } from './pages/detail-employee/detail-employee.component';
import { DocumentComponent } from './pages/document/document.component';
import { EmployeeCardComponent } from './pages/report/employee-card/employee-card.component';
import { EmployeeLicenseComponent } from './pages/report/employee-license/employee-license.component';
import { EmployeeProfileComponent } from './pages/report/employee-profile/employee-profile.component';
import { EmployeeProfileMiniComponent } from './pages/report/employee-profile-mini/employee-profile-mini.component';
import { EmployeeTransferComponent } from './pages/report/employee-transfer/employee-transfer.component';
import { EmployeeAplicationFormComponent } from './pages/report/employee-aplication-form/employee-aplication-form.component';

@NgModule({
  declarations: [
    EmployeeComponent,
    EditEmployeeComponent,
    AddEmployeeComponent,
    DetailEmployeeComponent,
    DocumentComponent,
    EmployeeCardComponent,
    EmployeeLicenseComponent,
    EmployeeProfileComponent,
    EmployeeProfileMiniComponent,
    EmployeeTransferComponent,
    EmployeeAplicationFormComponent],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    SharedModule
  ]
})
export class EmployeeModule { }
