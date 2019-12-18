import { Injectable } from '@angular/core';
import { BaseService, Paginate } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CacheService } from './cache/cache.service';
import { CookieService } from 'ngx-cookie-service';
import { TimeAttendance, WorkingSiteMonthly, WorkingDay, WorkingDaySummary } from '../models/timeattendance';
import { MomentHelper } from '../helpers/moment.helper';
import { Site } from '../models/site';

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

    getSiteTimeAttendanceByWorkDate(siteId: number, workDate: Date) {
        const workDateString = this.moment.format(workDate, 'DDMMYYYY');
        return this.http.get<TimeAttendance[]>(`${this.serviceUrl}/timeattendance/site/${siteId}/workdate/${workDateString}`);
    }

    createTimeAttendance(timeAttendance: TimeAttendance) {
        return this.http.post<TimeAttendance>(`${this.serviceUrl}/timeattendance`, timeAttendance);
    }

    updateTimeAttendance(id: number, timeAttendance: TimeAttendance) {
        return this.http.put<TimeAttendance>(`${this.serviceUrl}/timeattendance/${id}`, timeAttendance);
    }

    deleteTimeAttendance(id: number) {
        return this.http.delete(`${this.serviceUrl}/timeattendance/${id}`);
    }

    getTimeAttendanceSites() {
        return this.http.get<Site[]>(`${this.serviceUrl}/timeattendance/sites`);
    }

    getTimeAttendanceFilter(
        site_id: number,
        work_date: Date,
        sort_column: string,
        sort_by: string,
        page: number,
        page_size: number) {
        const workDate = this.moment.format(work_date, 'YYYYMMDD');
        const params = new HttpParams()
            .set('site_id', (!site_id) ? '0' : String(site_id))
            .set('work_date', workDate)
            .set('sort_column', sort_column)
            .set('sort_by', sort_by)
            .set('page', String(page))
            .set('page_size', String(page_size));
        return this.http.get<Paginate<TimeAttendance[]>>(
            `${this.serviceUrl}/timeattendance/filter`, { params: params });
    }

    getWorkingSiteMonthlyTimeAttendances(siteId: number, year: number, month: number) {
        return this.http.get<WorkingSiteMonthly[]>(`${this.serviceUrl}/timeattendance/working-site/${siteId}/year/${year}/month/${month}`);
    }

    getWorkingDaySummary(siteId: number, year: number, month: number) {
        return this.http.get<WorkingDaySummary[]>(`${this.serviceUrl}/timeattendance/working-site/${siteId}/year/${year}/month/${month}/daily`);
    }

}
