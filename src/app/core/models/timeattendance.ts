import { DatePicker } from './datepicker';

export class Time {
    hour: number;
    minute: number;
    second: number;
    constructor(
        hour: number,
        minute: number,
        second: number) {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    }
}

export class TimeAttendance {
    id: number;
    empNo: number;
    employeeName: string;
    roleId: string;
    roleNameTH: string;
    siteId: number;
    siteName: string;
    workDate: string;
    startTime: string;
    endTime: string;
    checkInTime: string;
    checkInBy: number;
    checkInByName: string;
    leaveTime: string;
    leaveBy: number;
    leaveByName: string;
    createBy: string;
    createOn: string;
    updateBy: string;
    updateOn: string;

    workDatePicker: DatePicker;
    leaveWorkDatePicker: DatePicker;
    checkInTimeStruct: Time;
    leaveTimeStruct: Time;
    startTimeEndTime: string;

    constructor(
        id: number,
        empNo: number,
        employeeName: string,
        roleId: string,
        roleNameTH: string,
        siteId: number,
        siteName: string,
        workDate: string,
        checkInTime: string,
        checkInBy: number,
        checkInByName: string,
        createBy: string,
        createOn: string
    ) {
        this.id = id;
        this.empNo = empNo;
        this.employeeName = employeeName;
        this.roleId = roleId;
        this.roleNameTH = roleNameTH;
        this.siteId = siteId;
        this.siteName = siteName;
        this.workDate = workDate;
        this.checkInTime = checkInTime;
        this.checkInBy = checkInBy;
        this.checkInByName = checkInByName;
        this.createBy = createBy;
        this.createOn = createOn;
        this.checkInTimeStruct = new Time(0, 0, 0);
        this.leaveTimeStruct = new Time(0, 0, 0);
        this.startTimeEndTime = '';
    }
}

