import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private hoursToStorageData = 2; // Reset when storage is more than 24hours

  protected serviceUrl = `${environment.apiUrl}/api`;

  constructor() { }

  protected setUserDataStorage(user: User) {
    const hours = this.hoursToStorageData; // Reset when storage is more than 24hours
    const now = new Date().getTime();
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) {
      localStorage.setItem('loginTime', String(now));
    } else {
      if (now - Number(loginTime) > hours * 60 * 60 * 1000) {
        localStorage.removeItem('loginTime');
        localStorage.setItem('loginTime', String(now));
      }
    }
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  protected get userDataStorage() {
    const hours = this.hoursToStorageData;
    const now = new Date().getTime();
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime || now - Number(loginTime) > hours * 60 * 60 * 1000) {
      localStorage.removeItem('loginTime');
      return null;
    }
    return sessionStorage.getItem('user');
  }

  protected get userData() {
    if (!this.userDataStorage) { return null; }
    return JSON.parse(this.userDataStorage) as User;
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

