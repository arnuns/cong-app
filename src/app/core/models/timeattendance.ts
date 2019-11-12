import { User } from './user';
import { Site } from './site';

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
    checkInTime: Date;
    checkInByName: string;
    leaveTime: Date;
    leaveByName: string;
    createBy: string;
    createOn: Date;
    updateBy: string;
    updateOn: Date;
}

