import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache/cache.service';

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
}
