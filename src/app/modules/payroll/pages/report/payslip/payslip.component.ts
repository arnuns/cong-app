import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PayrollCycle, Salary } from 'src/app/core/models/payroll';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { CacheService } from 'src/app/core/services/cache/cache.service';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';

@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss']
})
export class PayslipComponent implements OnDestroy, OnInit {
  public baseImagePath = environment.basePath;
  payrollCycle: PayrollCycle;
  userSalarys: Salary[] = [];
  salary: number;
  thaiMonth = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม',
    'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน',
    'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

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

  constructor(private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private electronService: ElectronService,
    private payrollService: PayrollService,
    private cacheService: CacheService,
    private spinner: SpinnerHelper) {
    document.body.style.backgroundColor = '#ffffff';
    this.updateView();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const payrollCycleId = Number(params['id']);
      const siteId = Number(params['siteid']);
      this.spinner.showLoadingSpinner();
      const payrollCycle = this.cacheService.get(`payrollCycle_${payrollCycleId}`,
        this.payrollService.getPayrollCycle(payrollCycleId), 50000);
      payrollCycle.toPromise().then((result: PayrollCycle) => {
        this.payrollCycle = result;
      }).then(_ => {
        return this.payrollService.getSitePayrollCycleSalary(payrollCycleId, siteId).toPromise();
      }).then(salaries => {
        this.userSalarys = salaries.filter(s => s.siteId === siteId);
        this.spinner.hideLoadingSpinner();
        if (this.electronService.isElectronApp) {
          setTimeout(() => this.electronService.ipcRenderer.send('print-to-pdf'), 5000);
        }
      }).catch(() => {
        this.spinner.hideLoadingSpinner(0);
      }).finally(() => {
        this.spinner.hideLoadingSpinner(0);
      });
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

  setTwoNumberDecimal($event) {
    $event.target.value = parseFloat($event.target.value).toFixed(2);
  }

  convertToDateString(dateString: string): string {
    if (dateString === '' || dateString === null || dateString === undefined) {
      return '';
    }
    const date = new Date(dateString);
    return `${date.getDate()} ${this.thaiMonth[date.getMonth()]} ${date.getFullYear() + 543}`;
  }

  convertToStartEndDateString(start: string, end: string): string {
    if (start === '' || start === null || start === undefined || end === '' || end === null || end === undefined) {
      return '';
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.getDate()} - ${endDate.getDate()} ${this.thaiMonth[endDate.getMonth()]} ${endDate.getFullYear() + 543}`;
  }
}
