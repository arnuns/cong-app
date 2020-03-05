import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeReportComponent } from './pages/employee-report/employee-report.component';


const routes: Routes = [
  {
    path: '',
    component: EmployeeReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
