import {Component, OnInit, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import {PayrollService} from 'src/app/core/services/payroll.service';
import {SpinnerHelper} from 'src/app/core/helpers/spinner.helper';
import {combineLatest, Subject} from 'rxjs';
import {PayrollCycle, SitePayrollCycleSalary, Salary} from 'src/app/core/models/payroll';
import {SiteService} from 'src/app/core/services/site.service';
import {Site} from 'src/app/core/models/site';
import {DataTableDirective} from 'angular-datatables';
import {FormBuilder, Validators} from '@angular/forms';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {NgxSmartModalService} from 'ngx-smart-modal';
import {Papa} from 'ngx-papaparse';
import * as FileSaver from 'file-saver';
import {MomentHelper} from 'src/app/core/helpers/moment.helper';
import {Router} from '@angular/router';
import {ElectronService} from 'ngx-electron';
import {AvailableBank} from 'src/app/core/models/available-bank.model';
import {UserService} from 'src/app/core/services/user.service';

export interface PayrollFilter {
  payroll_cycle_id: number;
  search: string;
  status: string;
  sort_by: string;
  page: number;
  page_size: number;
}

const thaiMonth = new Array('มกราคม', 'กุมภาพันธ์', 'มีนาคม',
  'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน',
  'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม');

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild(DataTableDirective, {static: false}) private datatableElement: DataTableDirective;
  payrollCycleSelectList: any[] = [];

  payrollCycle: PayrollCycle;
  payrollCycles: PayrollCycle[] = [];
  allSitePayrollCycleSalary: SitePayrollCycleSalary[] = [];
  sites: Site[] = [];
  siteItemList: Site[] = [];
  selectedSiteItems = [];
  deleteSiteId = 0;
  deleteSiteName = '';

  payrollFilter: PayrollFilter;
  filterSessionName = 'payrollFilter';

  payrollForm = this.fb.group({
    payroll_cycle_id: [undefined],
    search: [''],
    status: [undefined]
  });

  createPayrollForm = this.fb.group({
    payrollDateRange: [[], [Validators.required]],
    isMonthly: [false, [Validators.required]]
  });

  dtTrigger = new Subject();
  dtOptions: DataTables.Settings = {};
  banks: AvailableBank[] = [];

  constructor(
    private electronService: ElectronService,
    private fb: FormBuilder,
    private moment: MomentHelper,
    private ngxSmartModalService: NgxSmartModalService,
    private papa: Papa,
    private payrollService: PayrollService,
    private router: Router,
    private spinner: SpinnerHelper,
    private siteService: SiteService,
    private userService: UserService
  ) {
    this.spinner.showLoadingSpinner();
  }

  ngOnInit() {
    this.searchFilter();
    this.initialTable();
    combineLatest(
      [
        this.payrollService.getPayrollCycles(),
        this.siteService.getSites(),
        this.userService.getAvailableBanks()
      ]
    ).subscribe(results => {
      this.payrollCycles = results[0];
      this.sites = results[1];
      this.banks = results[2];
      this.payrollCycleSelectList = this.payrollCycles.slice(0, 24).map(p => ({
        value: p.id,
        viewValue: this.convertToStartEndDateString(p.start, p.end)
      }));
      this.payrollCycle = this.payrollCycles[0];
      this.getPayrollCycleSalary(this.payrollCycle.id);
      this.payrollForm.get('payroll_cycle_id').setValue(this.payrollCycle.id);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();

    if (this.payrollFilter) {
      sessionStorage.setItem(this.filterSessionName, JSON.stringify(this.payrollFilter));
    }
  }

  ngAfterViewInit() {
    this.payrollForm.get('search').valueChanges
      .pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
      });
    this.ngxSmartModalService.getModal('deleteModal').onClose.subscribe((event: Event) => {
      this.deleteSiteId = 0;
      this.deleteSiteName = '';
    });

    this.ngxSmartModalService.getModal('addSiteModal').onClose.subscribe((event: Event) => {
      this.selectedSiteItems = [];
    });

    this.ngxSmartModalService.getModal('newPayrollModal').onClose.subscribe((event: Event) => {
      this.createPayrollForm.reset({
        payrollDateRange: [],
        isMonthly: false
      });
    });
  }

  initialTable() {
    this.dtOptions = {
      autoWidth: false,
      dom: 'tr<\'d-flex align-items-center w-100 mt-4\'<l><\'ml-auto pr-2\'i><p>\'>',
      columns: [
        {width: '30px'},
        {width: '100px'},
        null,
        {orderable: false, width: '120px'},
        {orderable: false, width: '120px'},
        {orderable: false, width: '120px'},
        {orderable: false, width: '20px'}
      ],
      lengthMenu: [10, 20, 50],
      language: {
        emptyTable: '<strong>0</strong> payroll(s) returned',
        info: 'Viewing <strong>_START_-_END_</strong> of <strong>_TOTAL_</strong>',
        infoEmpty: 'No payroll(s) to show',
        zeroRecords: 'No matching payroll(s) found',
        infoFiltered: '',
        infoPostFix: '',
        lengthMenu: '_MENU_',
        paginate: {
          first: '',
          last: '',
          next: '<img class=\'paging-arrow\' src=\'assets/img/ico-arrow-right.png\'>',
          previous: '<img class=\'paging-arrow\' src=\'assets/img/ico-arrow-left.png\'>'
        }
      },
      order: [[2, 'asc']],
      pageLength: 10,
      pagingType: 'simple'
    };
  }

  onRowClickHandler(payrollCycleId: number, siteId: number) {
    this.router.navigate(['/payroll', payrollCycleId, 'site', siteId, 'salary']);
  }

  searchFilter() {
    $.fn['dataTable'].ext.search.push((settings, data, dataIndex) => {
      const searchText = this.payrollForm.get('search').value ? this.payrollForm.get('search').value.toLowerCase() : '';
      const status = this.payrollForm.get('status').value;
      const siteCode = String(data[1]).toLowerCase();
      const siteName = String(data[2]).toLowerCase();
      const statusText = String(data[5]).toLowerCase();
      let filterStatus = false;
      switch (status) {
        case 'inprogress':
          filterStatus = statusText.indexOf('รอดำเนินการ') !== -1;
          break;
        case 'done':
          filterStatus = statusText.indexOf('รอตรวจสอบ') !== -1;
          break;
        case 'complete':
          filterStatus = statusText.indexOf('รอสั่งจ่าย') !== -1;
          break;
        case 'paid':
          filterStatus = statusText.indexOf('สั่งจ่ายแล้ว') !== -1;
          break;
        case 'suspend':
          filterStatus = statusText.indexOf('ระงับการจ่าย') !== -1;
          break;
        default:
          filterStatus = true;
          break;
      }

      if ((siteCode.indexOf(searchText) !== -1
        || siteName.indexOf(searchText) !== -1) && filterStatus) {
        return true;
      }
      return false;
    });
  }

  getPayrollCycleSalary(payrollCycleId: number, rerender = false) {
    this.spinner.showLoadingSpinner();
    this.payrollService.getAllPayrollCycleSalaryGroupBySite(payrollCycleId).subscribe(allSitePayrollCycleSalary => {
      this.allSitePayrollCycleSalary = allSitePayrollCycleSalary;
      this.siteItemList = this.sites.filter(s => s.isPayroll
        && this.allSitePayrollCycleSalary.map(p => p.siteId).indexOf(s.id) === -1);
      if (rerender) {
        this.rerender();
      } else {
        this.dtTrigger.next();
      }
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      if (rerender) {
        this.rerender();
      } else {
        this.dtTrigger.next();
      }
      this.spinner.hideLoadingSpinner(0);
    });
  }

  onPayrollCycleSelectionChange(event) {
    this.getPayrollCycleSalary(Number(event.value), true);
  }

  onFilterStatusChange($event) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  addSite() {
    this.spinner.showLoadingSpinner();
    this.payrollService.addMultipleSiteSalary(this.payrollForm.get('payroll_cycle_id').value,
      this.selectedSiteItems).subscribe(salaries => {
        this.getPayrollCycleSalary(this.payrollForm.get('payroll_cycle_id').value, true);
        this.ngxSmartModalService.getModal('addSiteModal').close();
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      });
  }

  onClickAddNewSite() {
    this.ngxSmartModalService.getModal('addSiteModal').open();
  }

  onClickDeleteSite(siteName: string, siteId: number) {
    this.deleteSiteId = siteId;
    this.deleteSiteName = siteName;
    this.ngxSmartModalService.getModal('deleteModal').open();
  }

  onDeleteSite() {
    this.spinner.showLoadingSpinner();
    this.payrollService.deleteSitePayroll(this.payrollForm.get('payroll_cycle_id').value, this.deleteSiteId).subscribe(_ => {
      this.getPayrollCycleSalary(this.payrollForm.get('payroll_cycle_id').value, true);
      this.ngxSmartModalService.getModal('deleteModal').close();
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  onCreatePayroll() {
    this.spinner.showLoadingSpinner();
    const dateRange: Date[] = this.createPayrollForm.get('payrollDateRange').value;
    this.payrollService.createPayrollCycle(dateRange[0], dateRange[1], this.createPayrollForm.get('isMonthly').value)
      .subscribe(payrollCycle => {
        this.payrollCycle = payrollCycle;
        this.payrollForm.get('payroll_cycle_id').setValue(payrollCycle.id);
        if (this.payrollCycleSelectList.filter(p => p.id === payrollCycle.id).length <= 0) {
          this.payrollCycleSelectList = [{
            value: payrollCycle.id,
            viewValue: this.convertToStartEndDateString(payrollCycle.start, payrollCycle.end)
          }].concat(this.payrollCycleSelectList);
        }
        this.getPayrollCycleSalary(payrollCycle.id, true);
        this.ngxSmartModalService.getModal('newPayrollModal').close();
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      });
  }

  onExportAllSalaryToCsv() {
    this.spinner.showLoadingSpinner();
    this.payrollService.getPayrollCycleSalary(this.payrollForm.get('payroll_cycle_id').value).subscribe(salaries => {
      const data = salaries.map(s => {
        let bankName = (s.bankId === 0 || (!this.banks.filter(b => b.id === s.bankId)[0]))
          ? '' : this.banks.filter(b => b.id === s.bankId)[0].name;
        return {
          'รหัสพนักงาน': s.empNo,
          'หน่วยงาน': s.siteName,
          'ตำแหน่ง': s.userPosition.nameTH,
          'เลขที่บัตรประชาชน': `'${s.idCardNumber}`,
          'คำนำหน้าชื่อ': s.title,
          'ชื่อ': s.firstName,
          'นามสกุล': s.lastName,
          'วันเริ่มงาน': !s.startDate ? '' : this.convertToDateString(s.startDate),
          'เลขที่ใบอนุญาต': !s.user.licenseNo ? '' : `${s.user.licenseNo}`,
          'วันเริ่มต้นใบอนุญาต': !s.user.licenseStartDate ? '' : this.convertToDateString(s.user.licenseStartDate),
          'วันสิ้นสุดใบอนุญาต': !s.user.licenseEndDate ? '' : this.convertToDateString(s.user.licenseEndDate),
          'ธนาคาร': bankName,
          'เลขที่บัญชี': !s.bankAccount ? '' : `'${s.bankAccount}`,
          'วันทำงานต่อเดือน': s.minimumManday,
          'ค่าแรงขั้นต่ำ': s.minimumWage,
          'แรงละ': s.hiringRatePerDay,
          'จำนวนแรง': s.manday,
          'ค่าแรงปกติ': s.totalWage,
          'ค่าตำแหน่ง': s.otherAdvance > 0 ? 0 : s.positionValue,
          'ค่าจุด': s.otherAdvance > 0 ? 0 :s.pointValue,
          'นักขัตฤกษ์': s.otherAdvance > 0 ? 0 :s.annualHoliday,
          'ค่าโทรศัพท์': s.otherAdvance > 0 ? 0 :s.telephoneCharge,
          'คืนเงินหัก': s.otherAdvance > 0 ? 0 :s.refund,
          'เบี้ยขยัน': s.otherAdvance > 0 ? 0 :s.dutyAllowance,
          'เบี้ยขยันรายวัน': s.otherAdvance > 0 ? 0 :s.dutyAllowanceDaily,
          'โบนัส': s.otherAdvance > 0 ? 0 :s.bonus,
          'ค่าล่วงเวลา (OT)': s.overtime + (!s.extraOvertime ? 0 : s.extraOvertime),
          'ชดเชยรายได้': s.otherAdvance > 0 ? 0 :s.incomeCompensation,
          'รายได้อื่นๆ': s.otherAdvance > 0 ? 0 :s.otherIncome,
          'ค่าแทนจุด': s.extraReplaceValue,
          'รายได้จุดพิเศษ': s.extraPointValue,
          'ประกันสังคม': s.otherAdvance > 0 ? 0 :s.socialSecurity,
          'ค่าอุปกรณ์': s.otherAdvance > 0 ? 0 :s.inventory,
          'ผิดวินัย': s.otherAdvance > 0 ? 0 :s.discipline,
          'ค่าธรรมเนียม': s.otherAdvance > 0 ? 0 :s.transferFee,
          'ขาดงาน': s.otherAdvance > 0 ? 0 :s.absence,
          'ใบอนุญาต': s.otherAdvance > 0 ? 0 :s.licenseFee,
          'เบิกล่วงหน้า': s.otherAdvance > 0 ? s.otherAdvance : s.advance,
          'ค่าเช่าบ้าน': s.otherAdvance > 0 ? 0 :s.rentHouse,
          'พิธีการทางศาสนา': s.otherAdvance > 0 ? 0 :s.cremationFee,
          'รายการหักอื่นๆ': s.otherAdvance > 0 ? 0 :s.otherFee,
          'หมายเหตุ': !s.remark ? '' : s.remark,
          'ภาษีหัก ณ ที่จ่าย': s.withholdingTax,
          'รวมรายได้': s.totalIncome,
          'รวมรายการหัก': s.totalDeductible,
          'เงินได้สุทธิ': s.totalAmount
        };
      });
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + this.papa.unparse(data)], {type: 'text/csv;charset=utf-8'});
      FileSaver.saveAs(blob, `salary_${this.payrollForm.get('payroll_cycle_id').value}_${this.moment.format(new Date(), 'YYYYMMDDHHmmss')}.csv`);
      this.spinner.hideLoadingSpinner();
    }, error => {
      this.spinner.hideLoadingSpinner();
    });
  }

  onExportSummaryBySiteToCsv() {
    this.spinner.showLoadingSpinner();
    this.payrollService.getSummaryPayrollSalaryBySite(this.payrollForm.get('payroll_cycle_id').value).subscribe(salaries => {
      const data = salaries.map(s => ({
        'หน่วยงาน': s.siteName,
        'รหัสหน่วยงาน': !s.siteCode ? '' : s.siteCode,
        'จำนวนพนักงาน': s.totalEmployee,
        'จำนวนแรง': s.totalManday,
        'ค่าแรงปกติ': s.totalWage,
        'ค่าตำแหน่ง': s.positionValue,
        'ค่าจุด': s.pointValue,
        'นักขัตฤกษ์': s.annualHoliday,
        'ค่าโทรศัพท์': s.telephoneCharge,
        'คืนเงินหัก': s.refund,
        'เบี้ยขยัน': s.dutyAllowance,
        'เบี้ยขยันรายวัน': s.dutyAllowanceDaily,
        'โบนัส': s.bonus,
        'ค่าล่วงเวลา (OT)': s.overtime + (!s.extraOvertime ? 0 : s.extraOvertime),
        'ชดเชยรายได้': s.incomeCompensation,
        'รายได้อื่นๆ': s.otherIncome,
        'ค่าแทนจุด': s.extraReplaceValue,
        'รายได้จุดพิเศษ': s.extraPointValue,
        'ประกันสังคม': s.socialSecurity,
        'ค่าอุปกรณ์': s.inventory,
        'ผิดวินัย': s.discipline,
        'ค่าธรรมเนียม': s.transferFee,
        'ขาดงาน': s.absence,
        'ใบอนุญาต': s.licenseFee,
        'เบิกล่วงหน้า': s.advance,
        'ค่าเช่าบ้าน': s.rentHouse,
        'พิธีการทางศาสนา': s.cremationFee,
        'รายการหักอื่นๆ': s.otherFee,
        'ภาษีหัก ณ ที่จ่าย': s.withholdingTax,
        'รวมรายได้': s.totalIncome,
        'รวมรายการหัก': s.totalDeductible,
        'เงินได้สุทธิ': s.totalAmount
      }));
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + this.papa.unparse(data)], {type: 'text/csv;charset=utf-8'});
      FileSaver.saveAs(blob, `summary_salary_${this.payrollForm.get('payroll_cycle_id').value}_${this.moment.format(new Date(), 'YYYYMMDDHHmmss')}.csv`);
      this.spinner.hideLoadingSpinner();
    }, error => {
      this.spinner.hideLoadingSpinner();
    });
  }

  onExportSiteSalaryToCsv(siteId: number) {
    this.spinner.showLoadingSpinner();
    this.payrollService.getSitePayrollCycleSalary(this.payrollForm.get('payroll_cycle_id').value, siteId).subscribe(salaries => {
      const data = salaries.map(s => {
        let bankName = (s.bankId === 0 || (!this.banks.filter(b => b.id === s.bankId)[0]))
          ? '' : this.banks.filter(b => b.id === s.bankId)[0].name;
        return {
          'รหัสพนักงาน': s.empNo,
          'หน่วยงาน': s.siteName,
          'ตำแหน่ง': s.userPosition.nameTH,
          'เลขที่บัตรประชาชน': `'${s.idCardNumber}`,
          'คำนำหน้าชื่อ': s.title,
          'ชื่อ': s.firstName,
          'นามสกุล': s.lastName,
          'วันเริ่มงาน': !s.startDate ? '' : this.convertToDateString(s.startDate),
          'เลขที่ใบอนุญาต': !s.user.licenseNo ? '' : `${s.user.licenseNo}`,
          'วันเริ่มต้นใบอนุญาต': !s.user.licenseStartDate ? '' : this.convertToDateString(s.user.licenseStartDate),
          'วันสิ้นสุดใบอนุญาต': !s.user.licenseEndDate ? '' : this.convertToDateString(s.user.licenseEndDate),
          'ธนาคาร': bankName,
          'เลขที่บัญชี': !s.bankAccount ? '' : `'${s.bankAccount}`,
          'วันทำงานต่อเดือน': s.minimumManday,
          'ค่าแรงขั้นต่ำ': s.minimumWage,
          'แรงละ': s.hiringRatePerDay,
          'จำนวนแรง': s.manday,
          'ค่าแรงปกติ': s.totalWage,
          'ค่าตำแหน่ง': s.positionValue,
          'ค่าจุด': s.pointValue,
          'นักขัตฤกษ์': s.annualHoliday,
          'ค่าโทรศัพท์': s.telephoneCharge,
          'คืนเงินหัก': s.refund,
          'เบี้ยขยัน': s.dutyAllowance,
          'เบี้ยขยันรายวัน': s.dutyAllowanceDaily,
          'โบนัส': s.bonus,
          'ค่าล่วงเวลา (OT)': s.overtime + (!s.extraOvertime ? 0 : s.extraOvertime),
          'ชดเชยรายได้': s.incomeCompensation,
          'รายได้อื่นๆ': s.otherIncome,
          'ค่าแทนจุด': s.extraReplaceValue,
          'รายได้จุดพิเศษ': s.extraPointValue,
          'ประกันสังคม': s.socialSecurity,
          'ค่าอุปกรณ์': s.inventory,
          'ผิดวินัย': s.discipline,
          'ค่าธรรมเนียม': s.transferFee,
          'ขาดงาน': s.absence,
          'ใบอนุญาต': s.licenseFee,
          'เบิกล่วงหน้า': s.advance,
          'ค่าเช่าบ้าน': s.rentHouse,
          'พิธีการทางศาสนา': s.cremationFee,
          'รายการหักอื่นๆ': s.otherFee,
          'หมายเหตุ': !s.remark ? '' : s.remark,
          'ภาษีหัก ณ ที่จ่าย': s.withholdingTax,
          'รวมรายได้': s.totalIncome,
          'รวมรายการหัก': s.totalDeductible,
          'เงินได้สุทธิ': s.totalAmount
        };
      });
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + this.papa.unparse(data)], {type: 'text/csv;charset=utf-8'});
      FileSaver.saveAs(blob, `salary_site_${siteId}_${this.payrollForm.get('payroll_cycle_id').value}_${this.moment.format(new Date(), 'YYYYMMDDHHmmss')}.csv`);
      this.spinner.hideLoadingSpinner();
    }, error => {
      this.spinner.hideLoadingSpinner();
    });
  }

  exportPayslipReport(payrollCycleId: number, siteId: number) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-payslip', payrollCycleId, siteId);
    }
  }

  // summaryTotalIncome(salary: Salary) {
  //   return (!salary.totalWage ? 0 : salary.totalWage)
  //     + (!salary.extraReplaceValue ? 0 : salary.extraReplaceValue)
  //     + (!salary.overtime ? 0 : salary.overtime)
  //     + (!salary.extraOvertime ? 0 : salary.extraOvertime)
  //     + (!salary.extraPointValue ? 0 : salary.extraPointValue)
  //     + (!salary.totalIncome ? 0 : salary.totalIncome);
  // }

  convertToStartEndDateString(start: string, end: string): string {
    if (start === '' || start === null || start === undefined || end === '' || end === null || end === undefined) {
      return '';
    }
    return this.concatStartEndString(new Date(start), new Date(end));
  }

  convertToDateString(dateString: string): string {
    if (dateString === null || dateString === undefined || dateString === '') {
      return '';
    }
    function pad(s) {return (s < 10) ? '0' + s : s;}
    const d = new Date(dateString);
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
  }

  concatStartEndString(startDate: Date, endDate: Date): string {
    return `${startDate.getDate()} - ${endDate.getDate()} ${thaiMonth[endDate.getMonth()]} ${endDate.getFullYear()}`;
  }

  rerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  get summaryTotalManday() {
    if (!this.allSitePayrollCycleSalary || this.allSitePayrollCycleSalary.length <= 0) {return 0;}
    return this.allSitePayrollCycleSalary.map(s => s.totalManday).reduce((a, b) => a + b, 0);
  }

  get summaryTotalAmount() {
    if (!this.allSitePayrollCycleSalary || this.allSitePayrollCycleSalary.length <= 0) {return 0;}
    return this.allSitePayrollCycleSalary.map(s => s.totalAmount).reduce((a, b) => a + b, 0);
  }
}
