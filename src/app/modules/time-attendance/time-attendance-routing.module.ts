import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimeAttendanceComponent } from './pages/time-attendance/time-attendance.component';


const routes: Routes = [{
  path: '',
  component: TimeAttendanceComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeAttendanceRoutingModule { }
