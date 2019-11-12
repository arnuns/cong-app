import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache/cache.service';
import { CookieService } from 'ngx-cookie-service';
import { TimeAttendance } from '../models/timeattendance';
import { MomentHelper } from '../helpers/moment.helper';

@Injectable({
    providedIn: 'root'
})
export class TimeAttendanceService extends BaseService {

    constructor(
        private cacheService: CacheService,
        private moment: MomentHelper,
        private http: HttpClient,
        cookieService: CookieService
    ) {
        super(cookieService);
    }

    getUserTimeAttendances(empNo: number) {
        return this.http.get<TimeAttendance[]>(`${this.serviceUrl}/timeattendance/user/${empNo}`);
    }

    getUserTimeAttendanceByWorkDate(empNo: number, workDate: Date) {
        const workDateString = this.moment.format(workDate, 'DDMMYYYY');
        return this.http.get<TimeAttendance[]>(`${this.serviceUrl}/timeattendance/user/${empNo}/workDate/${workDateString}`);
    }

    getUserTimeAttendanceByMonthDate(empNo: number, monthDate: Date) {
        const monthDateString = this.moment.format(monthDate, 'DDMMYYYY');
        return this.http.get<TimeAttendance[]>(`${this.serviceUrl}/timeattendance/user/${empNo}/monthDate/${monthDateString}`);
    }

}
