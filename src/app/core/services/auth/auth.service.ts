import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  private loginUrl = '/login';
  private redirectUrl = '/';

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  getRedirectUrl(): string {
    return this.redirectUrl;
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  getLoginUrl(): string {
    return this.loginUrl;
  }

  logoutUser(): void {
    this.currentUserSubject.next(null);
    this.cookieService.deleteAll();
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate([this.getLoginUrl()]);
  }

  constructor(
    public http: HttpClient,
    public router: Router,
    cookieService: CookieService) {
    super(cookieService);
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(this.userDataStorage));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(username: string, password: string) {
    return this.http.post<User>(`${this.serviceUrl}/authen`, { username, password }, {
      headers: new HttpHeaders(
        {
          'api-version': environment.apiVersion
        }
      )
    })
      .pipe(map(response => {
        this.setUserDataStorage(response);
        this.currentUserSubject.next(response);
        const allowedRoleId = ['admin', 'hr'];
        if (!allowedRoleId.includes(response.roleId)) {
          this.logoutUser();
        }
        return response;
      }));
  }
}
