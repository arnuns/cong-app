import { Injectable } from '@angular/core';
import { BaseService, Paginate } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CacheService } from './cache/cache.service';
import { CookieService } from 'ngx-cookie-service';
import { PayrollCycle, SitePayrollCycleSalary, SummarySalaryBySite, Salary } from '../models/payroll';
import { MomentHelper } from '../helpers/moment.helper';

@Injectable({
    providedIn: 'root'
})
export class PayrollService extends BaseService {

    constructor(
        private cacheService: CacheService,
        private moment: MomentHelper,
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

    createPayrollCycle(startWorkDate: Date, endWorkDate: Date, isMonthly: boolean) {
        const start = this.moment.formatISO8601(startWorkDate);
        const end = this.moment.formatISO8601(endWorkDate);
        return this.http.post<PayrollCycle>(`${this.serviceUrl}/payroll/cycle`,
            {
                start,
                end,
                isMonthly: isMonthly
            });
    }

    suspendEmployeePayrollSalary(payrollCycleId: number, siteId: number, salaryId: number) {
        return this.http.put<Salary>(`${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/salary/${salaryId}/suspend`, {});
    }

    deleteEmployeePayrollSalary(payrollCycleId: number, siteId: number, salaryId: number) {
        return this.http.delete(`${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/salary/${salaryId}`);
    }

    updatePayrollDeduction(payrollCycleId: number, siteId: number, cremationFee: number) {
        return this.http.put<Salary[]>(`${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/deduction`, {
            cremation_fee: cremationFee
        });
    }

    updateCompletePayrollSiteSalary(payrollCycleId: number, siteId: number) {
        return this.http.put<Salary>(`${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/complete`, {});
    }

    updatePaydayPayrollSiteSalary(payrollCycleId: number, siteId: number, paydayDate: Date) {
        const payday = this.moment.formatISO8601(paydayDate);
        return this.http.put<Salary[]>(`${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/payday`, {
            payday: payday
        });
    }

    addSalary(payrollCycleId: number, siteId: number, salary: Salary) {
        return this.http.post<Salary>(`${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}`, salary);
    }

    updateSalary(payrollCycleId: number, siteId: number, salary: Salary) {
        return this.http.put<Salary>(`${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/salary/${salary.id}`, salary);
    }
}
