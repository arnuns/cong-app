import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthGuardService } from './core/services/auth/auth-guard.service';
import { LayoutComponent } from './modules/shared/pages/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: './modules/auth/auth.module#AuthModule'
  },
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        canLoad: [AuthGuardService],
        loadChildren: './modules/home/home.module#HomeModule'
      },
      {
        path: 'employee',
        canLoad: [AuthGuardService],
        loadChildren: './modules/employee/employee.module#EmployeeModule'
      },
      {
        path: 'site',
        canLoad: [AuthGuardService],
        loadChildren: './modules/site/site.module#SiteModule'
      },
      {
        path: 'payroll',
        canLoad: [AuthGuardService],
        loadChildren: './modules/payroll/payroll.module#PayrollModule'
      },
      {
        path: 'sso',
        canLoad: [AuthGuardService],
        loadChildren: './modules/sso/sso.module#SsoModule'
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
