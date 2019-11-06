import { Injectable } from '@angular/core';
import { BaseService, Paginate } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CacheService } from './cache/cache.service';
import { User, Role } from '../models/user';
import { Company } from '../models/company';
import { Hospital } from '../models/hospital';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {

  constructor(
    private cacheService: CacheService,
    private http: HttpClient
  ) {
    super();
  }

  getCountUser() {
    return this.cacheService.get('user_count', this.http.get<number>(`${this.serviceUrl}/user/count`));
  }

  getUserFilter(
    search: string,
    site_array: string,
    user_status: string,
    sort_column: string,
    sort_by: string,
    page: number,
    page_size: number) {
    const params = new HttpParams()
      .set('search', (!search) ? '' : search)
      .set('site_array', (!site_array) ? '' : site_array)
      .set('user_status', (user_status === undefined
        || user_status === null) ? '' : user_status)
      .set('sort_column', sort_column)
      .set('sort_by', sort_by)
      .set('page', String(page))
      .set('page_size', String(page_size));
    return this.http.get<Paginate<User[]>>(
      `${this.serviceUrl}/user/filter`, { params: params });
  }

  getUserRoles() {
    return this.cacheService.get('roles', this.http.get<Role[]>(`${this.serviceUrl}/user/roles`));
  }

  getUserCompanies() {
    return this.cacheService.get('companies', this.http.get<Company[]>(`${this.serviceUrl}/user/companies`));
  }

  getAvailableBanks() {
    return this.cacheService.get('banks', this.http.get<Company[]>(`${this.serviceUrl}/user/availablebanks`));
  }

  getHospitals() {
    return this.cacheService.get('hospitals', this.http.get<Hospital[]>(`${this.serviceUrl}/user/hospitals`));
  }
}
