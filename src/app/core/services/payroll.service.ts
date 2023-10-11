import { Injectable } from "@angular/core";
import { BaseService, Paginate } from "./base.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CacheService } from "./cache/cache.service";
import { CookieService } from "ngx-cookie-service";
import {
  PayrollCycle,
  SitePayrollCycleSalary,
  SummarySalaryBySite,
  Salary,
  SiteSalary,
  SocialSecurityHistory,
  SocialSecurityHistoryMonthName,
  SocialSecurityRate,
} from "../models/payroll";
import { MomentHelper } from "../helpers/moment.helper";
import { UserIncomeTax } from "../models/user-income-tax.model";

@Injectable({
  providedIn: "root",
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
    return this.cacheService.get(
      "payroll_cycles",
      this.http.get<PayrollCycle[]>(`${this.serviceUrl}/payroll/all`)
    );
  }

  getPayrollCycle(id: number) {
    return this.http.get<PayrollCycle>(`${this.serviceUrl}/payroll/${id}`);
  }

  getAllPayrollCycleSalaryGroupBySite(payrollCycleId: number) {
    return this.http.get<SitePayrollCycleSalary[]>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/sitesalary/all`
    );
  }

  getPayrollCycleSiteSalary(payrollCycleId: number, siteId: number) {
    return this.http.get<SitePayrollCycleSalary>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/sitesalary/${siteId}`
    );
  }

  getPayrollCycleSalary(payrollCycleId: number) {
    return this.http.get<Salary[]>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/salary/all`
    );
  }

  getSitePayrollCycleSalary(payrollCycleId: number, siteId: number) {
    return this.http.get<Salary[]>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/salary/all`
    );
  }

  getSitePayrollCycleSalaryPayslip(payrollCycleId: number, siteId: number) {
    return this.http.get<Salary[]>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/salary/all?isPayslip=true`
    );
  }

  getSummaryPayrollSalaryBySite(payrollCycleId: number) {
    return this.http.get<SummarySalaryBySite[]>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/summary/bysite`
    );
  }

  deleteSitePayroll(payrollCycleId: number, siteId: number) {
    return this.http.delete(
      `${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}`
    );
  }

  addMultipleSiteSalary(payrollCycleId: number, siteIds: number[]) {
    return this.http.post<Salary[]>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/sites`,
      { siteIds }
    );
  }

  createPayrollCycle(
    startWorkDate: Date,
    endWorkDate: Date,
    isMonthly: boolean
  ) {
    const start = this.moment.formatISO8601(startWorkDate);
    const end = this.moment.formatISO8601(endWorkDate);
    return this.http.post<PayrollCycle>(`${this.serviceUrl}/payroll/cycle`, {
      start,
      end,
      isMonthly: isMonthly,
    });
  }

  suspendEmployeePayrollSalary(
    payrollCycleId: number,
    siteId: number,
    salaryId: number
  ) {
    return this.http.put<Salary>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/salary/${salaryId}/suspend`,
      {}
    );
  }

  deleteEmployeePayrollSalary(
    payrollCycleId: number,
    siteId: number,
    salaryId: number
  ) {
    return this.http.delete(
      `${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/salary/${salaryId}`
    );
  }

  updatePayrollDeduction(
    payrollCycleId: number,
    siteId: number,
    cremationFee: number
  ) {
    return this.http.put<Salary[]>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/deduction`,
      {
        cremation_fee: cremationFee,
      }
    );
  }

  updateCompletePayrollSiteSalary(payrollCycleId: number, siteId: number) {
    return this.http.put<Salary>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/complete`,
      {}
    );
  }

  updatePaydayPayrollSiteSalary(
    payrollCycleId: number,
    siteId: number,
    paydayDate: Date
  ) {
    const payday = this.moment.formatISO8601(paydayDate);
    return this.http.put<Salary[]>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/payday`,
      {
        payday: payday,
      }
    );
  }

  addSalary(payrollCycleId: number, siteId: number, salary: Salary) {
    return this.http.post<Salary>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}`,
      salary
    );
  }

  updateSalary(payrollCycleId: number, siteId: number, salary: Salary) {
    return this.http.put<Salary>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/site/${siteId}/salary/${salary.id}`,
      salary
    );
  }

  getSiteSalary(payrollCycleId: number, salaryId: number) {
    return this.http.get<SiteSalary[]>(
      `${this.serviceUrl}/payroll/${payrollCycleId}/salary/${salaryId}`
    );
  }

  getSocialSecurityHistoryMonthName() {
    return this.http.get<SocialSecurityHistoryMonthName[]>(
      `${this.serviceUrl}/Payroll/SocialSecurity/MonthNameHistory`
    );
  }

  getSocialSecurityHistoryFilter(
    search: string,
    payroll_year: number,
    payroll_month: number,
    social_hospital_id: number,
    site_id: number,
    sort_column: string,
    sort_by: string,
    page: number,
    page_size: number
  ) {
    const params = new HttpParams()
      .set("search", !search ? "" : search)
      .set("payroll_year", payroll_year ? String(payroll_year) : "")
      .set("payroll_month", payroll_month ? String(payroll_month) : "")
      .set(
        "social_hospital_id",
        !social_hospital_id ? "0" : `${social_hospital_id}`
      )
      .set("site_id", !site_id ? "0" : `${site_id}`)
      .set("sort_column", sort_column)
      .set("sort_by", sort_by)
      .set("page", String(page))
      .set("page_size", String(page_size));
    return this.http.get<Paginate<SocialSecurityHistory[]>>(
      `${this.serviceUrl}/Payroll/SocialSecurity/Filter`,
      { params: params }
    );
  }

  updateSocialSecurityHistory(
    payrollYear: number,
    payrollMonth: number,
    idCardNumber: string,
    socialHospitalId: number,
    hospitalName: string
  ) {
    return this.http.put<SocialSecurityHistory>(
      `${this.serviceUrl}/Payroll/SocialSecurity`,
      {
        payrollYear,
        payrollMonth,
        idCardNumber,
        socialHospitalId,
        hospitalName,
      }
    );
  }

  getSocialSecurityHistories(
    payrollYear: number,
    payrollMonth: number,
    siteId: number
  ) {
    const siteIdValue = !siteId ? "0" : `${siteId}`;
    // tslint:disable-next-line: max-line-length
    return this.http.get<SocialSecurityHistory[]>(
      `${this.serviceUrl}/Payroll/SocialSecurity/Year/${payrollYear}/Month/${payrollMonth}/Site/${siteIdValue}`
    );
  }

  getSocialSecurityRate(year: number, month: number) {
    const params = new HttpParams()
      .set("year", String(year))
      .set("month", String(month));
    return this.cacheService.get(
      `sso_rate_y${year}_m${month}`,
      this.http.get<SocialSecurityRate>(
        `${this.serviceUrl}/Payroll/SocialSecurity/Rate`,
        { params: params }
      )
    );
  }

  getUserIncomeTaxFilter(
    tax_type: string,
    search: string,
    year: number,
    month: number,
    site_id: number,
    sort_column: string,
    sort_by: string,
    page: number,
    page_size: number
  ) {
    let params = new HttpParams()
      .set("tax_type", tax_type)
      .set("search", !search ? "" : search)
      .set("sort_column", sort_column)
      .set("sort_by", sort_by)
      .set("page", String(page))
      .set("page_size", String(page_size));

    if (year) {
      params = params.append("year", String(year));
    }
    if (month) {
      params = params.append("month", String(month));
    }
    if (site_id) {
      params = params.append("site_id", String(site_id));
    }

    return this.http.get<Paginate<UserIncomeTax[]>>(
      `${this.serviceUrl}/Payroll/UserIncomeTax/Filter`,
      { params: params }
    );
  }

  getUserIncomeTaxSumByMonth(year: number, month: number, siteId: number) {
    let params = new HttpParams()
      .set("year", String(year))
      .set("month", String(month))
      .set("site_id", String(siteId));
    return this.http.get<UserIncomeTax[]>(
      `${this.serviceUrl}/Payroll/UserIncomeTax/SummaryByMonth`,
      { params: params }
    );
  }
}
