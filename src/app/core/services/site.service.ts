import { Injectable } from '@angular/core';
import { BaseService, Paginate } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CacheService } from './cache/cache.service';
import { Site } from '../models/site';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class SiteService extends BaseService {

  constructor(
    private cacheService: CacheService,
    private http: HttpClient,
    cookieService: CookieService
  ) {
    super(cookieService);
  }

  getCountSite() {
    return this.cacheService.get('site_count', this.http.get<number>(`${this.serviceUrl}/site/count`));
  }

  getSites() {
    return this.cacheService.get('site_all', this.http.get<Site[]>(`${this.serviceUrl}/site/all`));
  }

  getSiteFilter(
    search: string,
    sort_column: string,
    sort_by: string,
    page: number,
    page_size: number) {
    const params = new HttpParams()
      .set('search', (!search) ? '' : search)
      .set('sort_column', sort_column)
      .set('sort_by', sort_by)
      .set('page', String(page))
      .set('page_size', String(page_size));
    return this.http.get<Paginate<Site[]>>(
      `${this.serviceUrl}/site/filter`, { params: params });
  }
}
