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
    workDate: string;
    startTime: string;
    endTime: string;
    workerCount: number;
    hiringRatePerDay: number;
    replacementWage: number;
    isReplacementWage: boolean;
    checkInTime: string;
    checkInByName: string;
    leaveTime: string;
    leaveByName: string;
    createBy: string;
    createOn: Date;
    updateBy: string;
    updateOn: Date;
    timeAttendanceSiteCheckpoint: TimeAttendanceSiteCheckpoint;
}

export interface TimeAttendanceFilter extends PageFilter {
    siteId: number;
    startDate: Date;
    endDate: Date;
}

export class WorkingSiteMonthly {
    empNo: number;
    employeeName: string;
    startTime: string;
    endTime: string;
    workingDay: WorkingDay[];
    total: number;
    totalLateMinute: number;
}

export interface WorkingDay {
    empNo: number;
    workDate: Date;
    checkinTime: string;
    endTime: string;
    lateMinute: number;
    isLate: boolean;
    status: number;
}

export interface WorkingSitePeriod {
    startTime: string;
    endTime: string;
    workingSiteMonthly: WorkingSiteMonthly[];
}

export interface WorkingDaySummary {
    workDate: Date;
    workerCount: number;
}

export interface TimeAttendanceSiteCheckpoint {
  siteCheckpointId: number;
}