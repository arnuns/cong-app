import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private hoursToStorageData = 8; // Reset when storage is more than 24hours
  protected serviceUrl = `${environment.apiUrl}/api`;

  constructor(
    protected cookieService: CookieService) { }

  protected setUserDataStorage(user: User) {
    const hours = this.hoursToStorageData; // Reset when storage is more than 24hours
    const now = new Date().getTime();
    // const loginTime = this.cookieService.get('loginTime');
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) {
      // this.cookieService.set('loginTime', String(now));
      localStorage.setItem('loginTime', String(now));
    } else {
      if (now - Number(loginTime) > hours * 60 * 60 * 1000) {
        // this.cookieService.delete('loginTime', null);
        // this.cookieService.set('loginTime', String(now));
        localStorage.removeItem('loginTime');
        localStorage.setItem('loginTime', String(now));
      }
    }
    // this.cookieService.set('user', JSON.stringify({
    //   empNo: user.empNo,
    //   roleId: user.roleId,
    //   companyId: user.companyId,
    //   siteId: user.siteId,
    //   title: user.title,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   imageProfile: user.imageProfile,
    //   email: user.email,
    //   phoneNo: user.phoneNo,
    //   token: user.token
    // }));
    localStorage.setItem('user', JSON.stringify(user));
  }

  protected get userDataStorage() {
    const hours = this.hoursToStorageData;
    const now = new Date().getTime();
    // const loginTime = this.cookieService.get('loginTime');
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime || now - Number(loginTime) > hours * 60 * 60 * 1000) {
      // this.cookieService.delete('loginTime');
      localStorage.removeItem('loginTime');
      return null;
    }
    // return this.cookieService.get('user');
    return localStorage.getItem('user');
  }

  protected get userData() {
    if (!this.userDataStorage) { return null; }
    return JSON.parse(this.userDataStorage) as User;
  }

  protected downloadFile(response) {
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = response.filename;
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
    a.remove();
  }
}

export class ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface Paginate<T> {
  data: T;
  data_count: number;
  total: number;
}

