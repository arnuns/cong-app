import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache/cache.service';
import { Site } from '../models/site';

@Injectable({
  providedIn: 'root'
})
export class SiteService extends BaseService {

  constructor(
    private cacheService: CacheService,
    private http: HttpClient
  ) {
    super();
  }

  getCountSite() {
    return this.cacheService.get('site_count', this.http.get<number>(`${this.serviceUrl}/site/count`));
  }

  getSites() {
    return this.cacheService.get('site_all', this.http.get<Site[]>(`${this.serviceUrl}/site/all`));
  }
}
