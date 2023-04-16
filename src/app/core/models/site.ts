import { Province } from './address';
import { PageFilter } from './page-filter.model';
import { Role, UserPosition } from './user';

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
    isSsoAnnualHoliday: boolean;
    selfCheckIn: boolean;
    status: boolean;
    createOn: Date;
    createBy: string;
    siteWorkRates: SiteWorkRate[];
    siteCheckpoints: SiteCheckpoint[];
    siteUserPositions: SiteUserPosition[];
}

export interface SiteUserPosition {
    siteId: number;
    userPositionId: number;
    site: Site;
    userPosition: UserPosition;
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

export interface SiteCheckpoint {
    id: number;
    siteId: number;
    startTime: string;
    endTime: string;
    checkpointName: string;
    pointValue: number;
    workerCount: number;
    latitude: number;
    longitude: number;
    sequence: number;
    createOn: Date;
    createBy: string;
    updateOn: Date;
    updateBy: string;
}

export interface SiteFilter extends PageFilter {
    search: string;
}
