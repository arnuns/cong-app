import { PageFilter } from "./page-filter.model";

export interface UserIncomeTax {
    id: number;
    payrollDate: Date;
    empNo: number;
    employeeIdCardNumber: string;
    employeeName: string;
    siteId: number;
    sitetName: string;
    income: number;
    tax: number;
    createOn: Date;
    createBy: string;
}

export interface UserIncomTaxFilter extends PageFilter {
    incomeTaxType: string;
    search: string;
    yearName: string;
    monthName: string;
    siteId: number;
}