import { User } from './user';
import { Site } from './site';
import { PageFilter } from './page-filter.model';

export interface TimeAttendance {

    id: number;
    empNo: number;
    user: User;
    employeeName: string;
    siteId: number;
    site: Site;
    workDate: Date;
    startTime: string;
    endTime: string;
    checkInTime: string;
    checkInByName: string;
    leaveTime: string;
    leaveByName: string;
    createBy: string;
    createOn: Date;
    updateBy: string;
    updateOn: Date;
}

export interface TimeAttendanceFilter extends PageFilter {
    siteId: number;
    workDate: Date;
}

