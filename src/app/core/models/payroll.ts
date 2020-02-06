import { Site } from './site';
import { Role, User } from './user';
import { PageFilter } from './page-filter.model';

export interface PayrollCycle {
    id: number;
    start: string;
    end: string;
    isMonthly: boolean;
    createOn: Date;
    createBy: string;
}

export interface Salary {
    id: number;
    payrollCycleId: number;
    siteId: number;
    siteCode: string;
    siteName: string;
    site: Site;
    roleId: string;
    roleNameTH: string;
    role: Role;
    empNo: number;
    user: User;
    title: string;
    firstName: string;
    lastName: string;
    idCardNumber: string;
    startDate: string;
    bankAccount: string;
    bankId: number;
    minimumWage: number;
    minimumManday: number;
    hiringRatePerDay: number;
    siteManday: number;
    manday: number;
    totalWage: number;
    positionValue: number;
    pointValue: number;
    annualHoliday: number;
    telephoneCharge: number;
    refund: number;
    dutyAllowance: number;
    bonus: number;
    overtime: number;
    otherIncome: number;
    extraReplaceValue: number;
    extraOvertime: number;
    extraPointValue: number;
    socialSecurity: number;
    inventory: number;
    discipline: number;
    transferFee: number;
    absence: number;
    licenseFee: number;
    advance: number;
    rentHouse: number;
    cremationFee: number;
    otherFee: number;
    remark: string;
    withholdingTax: number;
    isComplete: boolean;
    isPaid: boolean;
    payDay: string;
    isMonthly: boolean;
    isSuspend: boolean;
    isTemporary: boolean;
    isSocialSecurity: boolean;
    createBy: string;
    createOn: Date;
    updateBy: string;
    updateOn: Date;
    siteSalaries: SiteSalary[];
    totalIncome: number;
    totalDeductible: number;
    totalAmount: number;
}

export interface SiteSalary {
    payrollCycleId: number;
    empNo: number;
    siteId: number;
    site: Site;
    salaryId: number;
    siteCode: string;
    siteName: string;
    manday: number;
    isDefault: boolean;
    createOn: Date;
    createBy: string;
    updateOn: Date;
    updateBy: string;
}

export interface SitePayrollCycleSalary {
    payrollCycleId: number;
    siteId: number;
    siteCode: string;
    siteName: string;
    numOfRow: number;
    siteManday: number;
    totalManday: number;
    totalAmount: number;
    status: string;
    payDay: string;
}

export interface SocialSecurityHistory {
    payrollYear: number;
    payrollMonth: number;
    idCardNumber: string;
    siteName: string;
    title: string;
    firstName: string;
    lastName: string;
    totalWage: number;
    socialSecurity: number;
    hospitalName: string;
    createOn: Date;
    socialHospitalId: number;
    updateOn: Date;
}

export interface SocialSecurityHistoryMonthName {
    payrollYear: number;
    payrollMonth: number;
    monthName: string;
}

export interface PayrollYearMonth {
    year: number;
    month: number;
}

export interface SummarySalaryBySite {
    payrollCycleId: number;
    siteId: number;
    siteCode: string;
    siteName: string;
    totalEmployee: number;
    totalManday: number;
    totalWage: number;
    positionValue: number;
    pointValue: number;
    annualHoliday: number;
    telephoneCharge: number;
    refund: number;
    dutyAllowance: number;
    bonus: number;
    overtime: number;
    otherIncome: number;
    replaceValue: number;
    extraReplaceValue: number;
    extraOvertime: number;
    extraPointValue: number;
    socialSecurity: number;
    inventory: number;
    discipline: number;
    transferFee: number;
    absence: number;
    licenseFee: number;
    advance: number;
    rentHouse: number;
    cremationFee: number;
    otherFee: number;
    withholdingTax: number;
    totalIncome: number;
    totalDeductible: number;
    totalAmount: number;
    approveOn: string;
    approveBy: string;
}

export interface PayrollDeductible {
    cremationFee: number;
}

export interface SocialSecurityHistoryFilter extends PageFilter {
    search: string;
    payrollYear: number;
    payrollMonth: number;
    socialHospitalId: number;
    siteId: number;
}
