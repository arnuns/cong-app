import { Injectable } from '@angular/core';
import { BaseService, Paginate } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CacheService } from './cache/cache.service';
import { User, Role, Document, BeginResign, UserPosition } from '../models/user';
import { Company } from '../models/company';
import { Hospital } from '../models/hospital';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';
import { SpinnerHelper } from '../helpers/spinner.helper';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {

  constructor(
    private cacheService: CacheService,
    private http: HttpClient,
    private spinner: SpinnerHelper,
    cookieService: CookieService
  ) {
    super(cookieService);
  }

  getCountUser() {
    return this.cacheService.get('user_count', this.http.get<number>(`${this.serviceUrl}/user/count`));
  }

  getCountActiveUser() {
    return this.cacheService.get('active_user_count', this.http.get<number>(`${this.serviceUrl}/user/active/count`));
  }

  getUserByIdCardNumber(idCardNumber: string) {
    return this.http.get<User>(`${this.serviceUrl}/user/idcardnumber/${idCardNumber}`);
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

  getUsers() {
    return this.http.get<User[]>(`${this.serviceUrl}/user/all`);
  }

  getUserPositions() {
    return this.cacheService.get('roles', this.http.get<UserPosition[]>(`${this.serviceUrl}/user/userpositions`));
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

  createUser(formData) {
    return this.http.post<User>(`${this.serviceUrl}/user`, formData);
  }

  updateUser(empNo: number, formData) {
    return this.http.put<User>(`${this.serviceUrl}/user/${empNo}`, formData);
  }

  getUser(empNo: number) {
    return this.http.get<User>(`${this.serviceUrl}/user/${empNo}`);
  }

  getDocument(empNo: number, documentId: number) {
    return this.http.get<Document>(`${this.serviceUrl}/user/${empNo}/document/${documentId}`);
  }

  updateUserBeginResign(empNo: number, data: BeginResign) {
    return this.http.put<User>(`${this.serviceUrl}/user/${empNo}/beginresign`, data);
  }

  getUserByDateRange(startDateString: string, endDateString: string) {
    const params = new HttpParams()
      .set('start_date', startDateString)
      .set('end_date', endDateString);
    return this.http.get<User[]>(`${this.serviceUrl}/user/bydaterange`, { params: params });
  }

  getUserByMonthYear(month: number, year: number) {
    const params = new HttpParams()
      .set('year', String(year))
      .set('month', String(month));
    return this.http.get<User[]>(`${this.serviceUrl}/user/bymonthyear`, { params: params });
  }

  getCountUserByMonthYear(month: number, year: number) {
    const params = new HttpParams()
      .set('year', String(year))
      .set('month', String(month));
    return this.http.get<number>(`${this.serviceUrl}/user/countbymonthyear`, { params: params });
  }

  downloadEmployeeCard(empNo: string) {
    this.spinner.showLoadingSpinner();
    return this.http
      .get(`${this.serviceUrl}/user/${empNo}/Report/EmployeeCard`, {
        responseType: 'blob'
      }).pipe(map(response => {
        return {
          filename: `${empNo}.pdf`,
          data: response
        };
      })).subscribe(response => {
        this.spinner.hideLoadingSpinner(0);
        setTimeout(() => {
          this.downloadFile(response);
        }, 1000);
      });
  }

  uploadImageProfile(formData) {
    return this.http.post<any>(`${this.serviceUrl}/user/storage/UploadImageProfile`, formData);
  }

  getUserByNfcRefId(nfcRefId: number) {
    return this.http.get<User>(`${this.serviceUrl}/user/NfcRefId/${nfcRefId}`);
  }

  updateNfcRefId(empNo: number, nfcRefId: number) {
    return this.http.put<User>(`${this.serviceUrl}/user/${empNo}/nfcCard/${nfcRefId}`, {});
  }

  getImageAsBlob(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' })
  }

  downloadEmployeeDocument(empNo: number, documentId: number, fileName: string) {
    this.spinner.showLoadingSpinner();
    return this.http
      .get(`${this.serviceUrl}/user/${empNo}/document/${documentId}/download`, {
        responseType: 'blob'
      }).pipe(map(response => {
        return {
          filename: fileName,
          data: response
        };
      })).subscribe(response => {
        this.spinner.hideLoadingSpinner(0);
        setTimeout(() => {
          this.downloadFile(response);
        }, 1000);
      });
  }

  getUserNotCheckedInByDateRange(startDateString: string, endDateString: string) {
    const params = new HttpParams()
      .set('start_date', startDateString)
      .set('end_date', endDateString);
    return this.http.get<User[]>(`${this.serviceUrl}/User/NotCheckIn3Days`, { params: params });
  }
}
