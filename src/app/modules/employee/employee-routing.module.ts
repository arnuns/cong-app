import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
import { EmployeeCertificateComponent } from './pages/report/employee-certificate/employee-certificate.component';


const routes: Routes = [
  {
    path: '',
    component: EmployeeComponent
  },
  {
    path: 'edit/:empNo',
    component: EditEmployeeComponent,
  },
  {
    path: 'add',
    component: AddEmployeeComponent,
  },
  {
    path: 'detail/:empNo',
    component: DetailEmployeeComponent
  },
  {
    path: ':empNo/document/:documentId',
    component: DocumentComponent
  },
  {
    path: ':empNo/report/employee-card',
    component: EmployeeCardComponent
  },
  {
    path: ':empNo/report/employee-license',
    component: EmployeeLicenseComponent
  },
  {
    path: ':empNo/report/employee-profile',
    component: EmployeeProfileComponent
  },
  {
    path: ':empNo/report/employee-profile-mini',
    component: EmployeeProfileMiniComponent
  },
  {
    path: ':empNo/report/employee-transfer',
    component: EmployeeTransferComponent
  },
  {
    path: ':empNo/report/employee-application-form',
    component: EmployeeAplicationFormComponent
  },
  {
    path: ':empNo/report/employee-certificate',
    component: EmployeeCertificateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
