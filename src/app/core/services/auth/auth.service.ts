import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
    sessionStorage.clear();
    this.router.navigate([this.getLoginUrl()]);
  }

  constructor(
    public http: HttpClient,
    public router: Router) {
    super();
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(this.userDataStorage));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(empNo: string, password: string) {
    return this.http.post<User>(`${this.serviceUrl}/authen`, { empNo, password }, {
      headers: new HttpHeaders(
        {
          'api-version': environment.apiVersion
        }
      )
    })
      .pipe(map(response => {
        this.setUserDataStorage(response);
        this.currentUserSubject.next(response);
        return response;
      }));
  }
}
