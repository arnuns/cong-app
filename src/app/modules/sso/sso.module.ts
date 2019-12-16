import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SsoRoutingModule } from './sso-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SocialSecurityComponent } from './pages/social-security/social-security.component';


@NgModule({
  declarations: [SocialSecurityComponent],
  imports: [
    CommonModule,
    SsoRoutingModule,
    SharedModule
  ]
})
export class SsoModule { }
