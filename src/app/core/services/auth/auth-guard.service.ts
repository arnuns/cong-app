import { Injectable } from '@angular/core';
import { Router, CanLoad, Route } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanLoad {
  constructor(
    private authService: AuthService,
    private router: Router) {
  }

  canLoad(route: Route): boolean {
    const url: string = route.path;
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      return true;
    }
    this.authService.setRedirectUrl(url);
    this.router.navigate([this.authService.getLoginUrl()]);
    return false;
  }
}
