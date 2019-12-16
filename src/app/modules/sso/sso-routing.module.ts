import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SocialSecurityComponent } from './pages/social-security/social-security.component';


const routes: Routes = [
  {
    path: '',
    component: SocialSecurityComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SsoRoutingModule { }
