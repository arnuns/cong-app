import { Injectable } from '@angular/core';
import { BaseService, Paginate } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CacheService } from './cache/cache.service';
import { Site } from '../models/site';
import { CookieService } from 'ngx-cookie-service';
import { Province, Amphur, District, Postcode } from '../models/address';
import { Observable } from 'rxjs';
import { PayrollCycle, SitePayrollCycleSalary, SummarySalaryBySite, Salary } from '../models/payroll';

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

    getAllPayrollCycleSalaryGroupBySite(payrollCycleId: number) {
        return this.http.get<SitePayrollCycleSalary[]>(`${this.serviceUrl}/payroll/${payrollCycleId}/sitesalary/all`);
    }

    getPayrollCycleSiteSalary(payrollCycleId: number, siteId: number) {
        return this.http.get<SitePayrollCycleSalary>(`${this.serviceUrl}/payroll/${payrollCycleId}/sitesalary/${siteId}`);
    }

    getPayrollCycleSalary(payrollCycleId: number) {
        return this.http.get<Salary[]>(`${this.serviceUrl}/payroll/${payrollCycleId}/salary/all`);
    }

    getSitePayrollCycleSalary(payrollCycleId: number, siteId: number) {
        return this.http.get<Salary[]>(`${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/salary/all`);
    }

    getSummaryPayrollSalaryBySite(payrollCycleId: number) {
        return this.http.get<SummarySalaryBySite[]>(`${this.serviceUrl}/payroll/${payrollCycleId}/summary/bysite`);
    }

    deleteSitePayroll(payrollCycleId: number, siteId: number) {
        return this.http.delete(`${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}`);
    }

    addMultipleSiteSalary(payrollCycleId: number, siteIds: number[]) {
        return this.http.post<Salary[]>(`${this.serviceUrl}/payroll/${payrollCycleId}/sites`, { siteIds });
    }
}
