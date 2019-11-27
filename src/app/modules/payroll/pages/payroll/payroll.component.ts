import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { combineLatest, Subject } from 'rxjs';
import { PayrollCycle, SitePayrollCycleSalary } from 'src/app/core/models/payroll';
import { SiteService } from 'src/app/core/services/site.service';
import { Site } from 'src/app/core/models/site';
import { DataTableDirective } from 'angular-datatables';
import { FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

const thaiMonth = new Array('มกราคม', 'กุมภาพันธ์', 'มีนาคม',
  'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน',
  'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม');

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false }) private datatableElement: DataTableDirective;
  payrollCycleSelectList: any[] = [];

  payrollCycle: PayrollCycle;
  payrollCycles: PayrollCycle[] = [];
  allSitePayrollCycleSalary: SitePayrollCycleSalary[] = [];
  sites: Site[] = [];
  siteItemList: Site[] = [];

  payrollForm = this.fb.group({
    payroll_cycle_id: [undefined],
    search: [''],
    status: [undefined]
  });

  dtTrigger = new Subject();
  dtOptions: DataTables.Settings = {};

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private spinner: SpinnerHelper,
    private siteService: SiteService
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
      ]
    ).subscribe(results => {
      this.payrollCycles = results[0];
      this.sites = results[1];
      this.payrollCycleSelectList = this.payrollCycles.slice(0, 12).map(p => ({
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
  }

  ngAfterViewInit() {
    this.payrollForm.get('search').valueChanges
      .pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
      });
  }

  initialTable() {
    this.dtOptions = {
      autoWidth: false,
      dom: 'tr<\'d-flex align-items-center w-100 mt-4\'<l><\'ml-auto pr-2\'i><p>\'>',
      columns: [
        { width: '30px' },
        { width: '100px' },
        null,
        { orderable: false, width: '120px' },
        { orderable: false, width: '120px' },
        { orderable: false, width: '120px' },
        { orderable: false, width: '20px' }
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
      pagingType: 'simple',
    };
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
    this.payrollService.getAllSitePayrollCycleSalary(payrollCycleId).subscribe(allSitePayrollCycleSalary => {
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

  convertToStartEndDateString(start: string, end: string): string {
    if (start === '' || start === null || start === undefined || end === '' || end === null || end === undefined) {
      return '';
    }
    return this.concatStartEndString(new Date(start), new Date(end));
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
}
