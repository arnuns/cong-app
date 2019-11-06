import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeComponent } from './pages/employee/employee.component';
import { EditEmployeeComponent } from './pages/edit-comployee/edit-employee.component';
import { AddEmployeeComponent } from './pages/add-comployee/add-employee.component';


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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
