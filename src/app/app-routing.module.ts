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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
