import { Province } from './address';

export interface Site {
    id: number;
    code: string;
    name: string;
    fullName: string;
    address: string;
    districtId: number;
    amphurId: number;
    provinceId: number;
    province: Province;
    latitude: number;
    longitude: number;
    isPayroll: boolean;
    isMonthly: boolean;
    status: boolean;
    createOn: Date;
    createBy: string;
    siteWorkRates: SiteWorkRate[];
    siteRoles: SiteRole[];
}

export interface SiteRole {
    siteId: number;
    roleId: string;
    hiringRatePerDay: number;
    minimumManday: number;
    createOn: Date;
    createBy: string;
    updateOn: Date;
    updateBy: string;
}

export interface SiteWorkRate {
    siteId: number;
    startTime: string;
    endTime: string;
    workerCount: number;
    createOn: Date;
    createBy: string;
}
