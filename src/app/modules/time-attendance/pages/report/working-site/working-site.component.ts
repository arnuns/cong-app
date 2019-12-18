import { Component, OnInit, OnDestroy } from '@angular/core';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { ElectronService } from 'ngx-electron';
import { TimeAttendanceService } from 'src/app/core/services/time-attendance.service';
import { ActivatedRoute } from '@angular/router';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { environment } from 'src/environments/environment';
import { Site } from 'src/app/core/models/site';
import { WorkingSitePeriod, WorkingSiteMonthly, WorkingDaySummary, WorkingDay } from 'src/app/core/models/timeattendance';
import { SiteService } from 'src/app/core/services/site.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-working-site',
  templateUrl: './working-site.component.html',
  styleUrls: ['./working-site.component.scss']
})
export class WorkingSiteComponent implements OnDestroy, OnInit {
  public baseImagePath = environment.basePath;
  siteId: number;
  year: number;
  month: number;
  companyReportHeader = {
    FullName: environment.companyFullName,
    FullNameEn: environment.companyFullNameEn,
    Address1: environment.companyAddress1,
    Address2: environment.companyAddress2,
    Tel: environment.companyTel,
    Fax: environment.companyFax,
    Mobile: environment.companyMobile,
    Email: environment.companyEmail,
    Website: environment.companyWebsite
  };

  monthDate: Date;
  workingSitePeriod: WorkingSitePeriod[] = [];
  workingSiteMonthly: WorkingSiteMonthly[] = [];
  workingDaySummary: WorkingDaySummary[] = [];
  site: Site;
  numberDays: number;
  summaryLateMinute = 0;
  summaryManday = 0;

  thaiMonth = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม',
    'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน',
    'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  displayMonth = '';
  displayYear = '';


  constructor(
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private electronService: ElectronService,
    private spinner: SpinnerHelper,
    private siteService: SiteService,
    private timeAttendanceService: TimeAttendanceService
  ) {
    document.body.style.backgroundColor = '#ffffff';
    this.updateView();
  }

  ngOnInit() {
    this.spinner.showLoadingSpinner();
    this.activatedRoute.params.subscribe(params => {
      this.siteId = Number(params['siteid']);
      this.year = Number(params['year']);
      this.month = Number(params['month']) - 1;
      const buddhaYear = this.year + 543;
      this.displayYear = `${buddhaYear}`;
      this.displayMonth = this.thaiMonth[this.month];
      this.monthDate = new Date(this.year, this.month, 1);
      this.siteService.getSite(this.siteId).subscribe(site => {
        this.site = site;
        this.initalizeReport();
      });
    });
  }

  initalizeReport(): void {
    combineLatest(
      [
        this.timeAttendanceService.getWorkingSiteMonthlyTimeAttendances(this.siteId, this.year, this.month),
        this.timeAttendanceService.getWorkingDaySummary(this.siteId, this.year, this.month)
      ]
    ).subscribe(results => {
      this.numberDays = new Date(this.year, this.month + 1, 0).getDate();
      this.workingSiteMonthly = results[0];
      this.site.siteWorkRates.forEach(x => {
        if (this.workingSiteMonthly.filter(w => w.startTime === x.startTime && w.endTime === x.endTime).length > 0) {
          this.workingSitePeriod.push(
            {
              startTime: x.startTime,
              endTime: x.endTime,
              workingSiteMonthly: this.workingSiteMonthly.filter(w => w.startTime === x.startTime && w.endTime === x.endTime)
            });
        }
      });
      this.workingSitePeriod.forEach(s => {
        s.workingSiteMonthly.forEach(w => {
          const workingDay: WorkingDay[] = [];
          for (let index = 0; index < 31; index++) {
            const day = index + 1;
            const date = new Date(this.year, this.month, day);
            const validWorkingDay = w.workingDay.filter(f => new Date(f.workDate).getDate() === day);
            const wkd: WorkingDay = {
              empNo: w.empNo,
              workDate: date,
              checkinTime: null,
              endTime: null,
              lateMinute: day > this.numberDays || validWorkingDay.length <= 0 ? 0 : validWorkingDay[0].lateMinute,
              isLate: day > this.numberDays || validWorkingDay.length <= 0 ? true : validWorkingDay[0].isLate,
              status: day > this.numberDays || validWorkingDay.length <= 0 ? 0 : 1
            };
            workingDay.push(wkd);
          }
          w.totalLateMinute = workingDay.reduce(function (prevVal, elem) {
            return prevVal + elem.lateMinute;
          }, 0) || 0;
          w.workingDay = workingDay;
        });
      });
      const workingDaySum = results[1];
      for (let index = 0; index < 31; index++) {
        const day = index + 1;
        const date = new Date(this.year, this.month, day);
        const validWorkingDay = workingDaySum.filter(f => new Date(f.workDate).getDate() === day);
        this.workingDaySummary.push({
          workDate: date,
          workerCount: validWorkingDay.length <= 0 ? 0 : validWorkingDay[0].workerCount
        });
      }
      this.summaryLateMinute = this.workingSiteMonthly.reduce(function (prevVal, elem) {
        return prevVal + (!elem.totalLateMinute ? 0 : elem.totalLateMinute);
      }, 0 || 0);
      this.summaryManday = this.workingDaySummary.reduce(function (prevVal, elem) {
        return prevVal + elem.workerCount;
      }, 0) || 0;
      this.spinner.hideLoadingSpinner(0);
    }, error => {
    }, () => {
      if (this.electronService.isElectronApp) {
        setTimeout(() => this.electronService.ipcRenderer.send('print-to-pdf-landscape'), 1000);
      }
    });
  }

  ngOnDestroy() {
    this.applicationStateService.setIsHiddenLeftMenu = false;
    this.applicationStateService.setIsHiddenSearch = false;
    this.applicationStateService.setIsHiddenTopMenu = false;
  }

  updateView() {
    this.applicationStateService.setIsHiddenLeftMenu = true;
    this.applicationStateService.setIsHiddenSearch = true;
    this.applicationStateService.setIsHiddenTopMenu = true;
  }


  convertToDateUrlFormat(date: Date) {
    return `${this.padZeroLeft(date.getDate())}-${this.padZeroLeft(date.getMonth() + 1)}-${date.getFullYear()}`;
  }

  padZeroLeft(value: number): string {
    return (value < 10 ? '0' : '') + value;
  }

}
