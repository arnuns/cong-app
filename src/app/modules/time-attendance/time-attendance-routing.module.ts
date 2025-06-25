import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TimeAttendanceComponent } from "./pages/time-attendance/time-attendance.component";
import { WorkingSiteComponent } from "./pages/report/working-site/working-site.component";
import { WorkingSiteNolateComponent } from "./pages/report/working-site-nolate/working-site-nolate.component";

const routes: Routes = [
  {
    path: "",
    component: TimeAttendanceComponent,
  },
  {
    path: "working-site/:siteid/year/:year/month/:month/report",
    component: WorkingSiteComponent,
  },
  {
    path: "working-site-nolate/:siteid/year/:year/month/:month/report",
    component: WorkingSiteNolateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimeAttendanceRoutingModule {}
