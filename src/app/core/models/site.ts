import { TimePicker } from './datepicker';
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
    postCode: string;
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

export class SiteWorkRate {
    siteId: number;
    startTime: string;
    startTimePicker: TimePicker;
    endTime: string;
    endTimePicker: TimePicker;
    workerCount: number;
    createOn: Date;
    createBy: string;
    constructor(
        siteId: number,
        startTime: string,
        endTime: string,
        workerCount: number,
        createOn: Date,
        createBy: string
    ) {
        this.siteId = siteId;
        this.startTime = startTime;
        this.startTimePicker = new TimePicker(parseInt(startTime.split(':')[0], 0), parseInt(startTime.split(':')[1], 0), 0);
        this.endTime = endTime;
        this.endTimePicker = new TimePicker(parseInt(endTime.split(':')[0], 0), parseInt(endTime.split(':')[1], 0), 0);
        this.workerCount = workerCount;
        this.createOn = createOn;
        this.createBy = createBy;
    }
}
