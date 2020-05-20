import { Province } from './address';
import { PageFilter } from './page-filter.model';
import { Role } from './user';

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
    minimumWage: number;
    isPayroll: boolean;
    isMonthly: boolean;
    selfCheckIn: boolean;
    status: boolean;
    createOn: Date;
    createBy: string;
    siteWorkRates: SiteWorkRate[];
    siteRoles: SiteRole[];
}

export interface SiteRole {
    siteId: number;
    roleId: string;
    site: Site;
    role: Role;
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

export interface SiteFilter extends PageFilter {
    search: string;
}
