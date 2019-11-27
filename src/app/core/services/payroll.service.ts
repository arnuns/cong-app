import { Injectable } from '@angular/core';
import { BaseService, Paginate } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CacheService } from './cache/cache.service';
import { Site } from '../models/site';
import { CookieService } from 'ngx-cookie-service';
import { Province, Amphur, District, Postcode } from '../models/address';
import { Observable } from 'rxjs';
import { PayrollCycle, SitePayrollCycleSalary } from '../models/payroll';

@Injectable({
    providedIn: 'root'
})
export class PayrollService extends BaseService {

    constructor(
        private cacheService: CacheService,
        private http: HttpClient,
        cookieService: CookieService
    ) {
        super(cookieService);
    }

    getPayrollCycles() {
        return this.cacheService.get('payroll_cycles', this.http.get<PayrollCycle[]>(`${this.serviceUrl}/payroll/all`));
    }

    getPayrollCycle(id: number) {
        return this.http.get<PayrollCycle>(`${this.serviceUrl}/payroll/${id}`);
    }

    getAllSitePayrollCycleSalary(payrollCycleId: number) {
        return this.http.get<SitePayrollCycleSalary[]>(`${this.serviceUrl}/payroll/${payrollCycleId}/sitesalary/all`);
    }

    getSitePayrollCycleSalary(payrollCycleId: number, siteId: number) {
        return this.http.get<SitePayrollCycleSalary>(`${this.serviceUrl}/payroll/${payrollCycleId}/sitesalary/${siteId}`);
    }
}
