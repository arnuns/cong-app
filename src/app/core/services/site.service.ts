import { Injectable } from '@angular/core';
import { BaseService, Paginate } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CacheService } from './cache/cache.service';
import { Site } from '../models/site';
import { CookieService } from 'ngx-cookie-service';
import { Province, Amphur, District, Postcode } from '../models/address';
import { Observable } from 'rxjs';

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

  getCountActiveSite() {
    return this.cacheService.get('active_site_count', this.http.get<number>(`${this.serviceUrl}/site/active/count`));
  }

  getSites() {
    return this.cacheService.get('site_all', this.http.get<Site[]>(`${this.serviceUrl}/site/backoffice/all`));
  }

  getSite(siteId: number) {
    return this.http.get<Site>(`${this.serviceUrl}/site/${siteId}`);
  }

  getSiteFilter(
    search: string,
    site_status: string,
    sort_column: string,
    sort_by: string,
    page: number,
    page_size: number) {
    const params = new HttpParams()
      .set('search', (!search) ? '' : search)
      .set('status', (site_status === undefined || site_status === null) ? '' : site_status)
      .set('sort_column', sort_column)
      .set('sort_by', sort_by)
      .set('page', String(page))
      .set('page_size', String(page_size));
    return this.http.get<Paginate<Site[]>>(
      `${this.serviceUrl}/site/filter`, { params: params });
  }

  getProvinces(): Observable<Province[]> {
    return this.cacheService.get('province_all', this.http.get<Province[]>(`${this.serviceUrl}/site/provinces`));
  }

  getAmphurs(): Observable<Amphur[]> {
    return this.cacheService.get('amphur_all', this.http.get<Amphur[]>(`${this.serviceUrl}/site/amphurs`));
  }

  getDistricts(): Observable<District[]> {
    return this.cacheService.get('district_all', this.http.get<District[]>(`${this.serviceUrl}/site/districts`));
  }

  getPostcodes(): Observable<Postcode[]> {
    return this.cacheService.get('postcode_all', this.http.get<Postcode[]>(`${this.serviceUrl}/site/postcodes`));
  }

  addSite(site: Site) {
    return this.http.post<Site>(`${this.serviceUrl}/site`, site);
  }

  updateSite(siteId: number, site: Site) {
    return this.http.put<Site>(`${this.serviceUrl}/site/${siteId}`, site);
  }

  activateSite(siteId: number) {
    return this.http.delete(`${this.serviceUrl}/site/${siteId}/activate`);
  }

  deactivateSite(siteId: number) {
    return this.http.delete(`${this.serviceUrl}/site/${siteId}/deactivate`);
  }
}
