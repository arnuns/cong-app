import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { EmployeeReportComponent } from './pages/employee-report/employee-report.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [EmployeeReportComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    SharedModule
  ]
})
export class ReportModule { }
