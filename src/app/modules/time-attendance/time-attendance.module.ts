import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeAttendanceRoutingModule } from './time-attendance-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TimeAttendanceComponent } from './pages/time-attendance/time-attendance.component';
import { WorkingSiteComponent } from './pages/report/working-site/working-site.component';


@NgModule({
  declarations: [TimeAttendanceComponent, WorkingSiteComponent],
  imports: [
    CommonModule,
    TimeAttendanceRoutingModule,
    SharedModule,
  ]
})
export class TimeAttendanceModule { }
