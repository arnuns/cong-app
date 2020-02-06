import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { FormBuilder, Validators } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { SocialSecurityHistoryFilter, SocialSecurityHistory } from 'src/app/core/models/payroll';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { UserService } from 'src/app/core/services/user.service';
import { Hospital } from 'src/app/core/models/hospital';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Papa } from 'ngx-papaparse';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import * as FileSaver from 'file-saver';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Site } from 'src/app/core/models/site';
import { SiteService } from 'src/app/core/services/site.service';

@Component({
  selector: 'app-social-security',
  templateUrl: './social-security.component.html',
  styleUrls: ['./social-security.component.scss']
})
export class SocialSecurityComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false }) private datatableElement: DataTableDirective;
  nameMonths: any[] = [];
  hospitals: Hospital[] = [];
  sites: Site[] = [];
  socialSecurityHistoryFilter: SocialSecurityHistoryFilter;
  filterSessionName = 'socialSecurityHistoryFilter';
  socialSecurityHistories: SocialSecurityHistory[] = [];
  socialSecurityForm = this.fb.group({
    payroll_year_month: [undefined],
    search: [''],
    social_hospital_id: [undefined],
    site_id: [undefined]
  });
  editForm = this.fb.group({
    name: [''],
    idcard_no: ['', [Validators.required]],
    social_hospital_id: [undefined, [Validators.required]]
  });
  dtTrigger = new Subject();
  dtOptions: DataTables.Settings = {};
  constructor(
    private applicationStateService: ApplicationStateService,
    private fb: FormBuilder,
    private moment: MomentHelper,
    private ngxSmartModalService: NgxSmartModalService,
    private papa: Papa,
    private payrollService: PayrollService,
    private spinner: SpinnerHelper,
    private siteService: SiteService,
    private userService: UserService
  ) {
    this.updateView();
  }

  ngOnInit() {
    this.spinner.showLoadingSpinner();
    this.initialData();
    combineLatest(
      [
        this.payrollService.getSocialSecurityHistoryMonthName(),
        this.userService.getHospitals(),
        this.siteService.getSites()
      ]
    ).subscribe(results => {
      this.nameMonths = results[0].map(m => ({ view: m.monthName, viewValue: `${m.payrollYear},${m.payrollMonth}` }));
      this.socialSecurityForm.get('payroll_year_month').setValue(this.nameMonths[0].viewValue);
      this.hospitals = results[1];
      this.sites = results[2];
      this.refreshTable();
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  ngOnDestroy() {
    if (this.socialSecurityHistoryFilter) {
      localStorage.setItem(this.filterSessionName, JSON.stringify(this.socialSecurityHistoryFilter));
    }
    this.applicationStateService.setIsHiddenSearch = false;
  }

  ngAfterViewInit() {
    this.socialSecurityForm.get('search').valueChanges
      .pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
      });
  }

  initialData() {
    const that = this;
    that.dtOptions = {
      autoWidth: false,
      dom: 'tr<\'d-flex align-items-center w-100 mt-4\'<l><\'ml-auto pr-2\'i><p>\'>',
      lengthMenu: [50, 100, 200, 400],
      language: {
        emptyTable: '<strong>0</strong> data(s) returned',
        info: 'Viewing <strong>_START_-_END_</strong> of <strong>_TOTAL_</strong>',
        infoEmpty: 'No data(s) to show',
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
      order: [[0, 'asc']],
      pageLength: 50,
      pagingType: 'simple',
      serverSide: true,
      processing: true,
      ajax: ({ }: any, callback) => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          const orders = Object.values(dtInstance.order()[0]);
          const sortBy = String(orders[1]);
          let sortColumn = '';
          if (orders[0] === 1) {
            sortColumn = 'name';
          } else if (orders[0] === 2) {
            sortColumn = 'total_wage';
          } else if (orders[0] === 3) {
            sortColumn = 'social_security';
          } else if (orders[0] === 4) {
            sortColumn = 'hospital_name';
          } else {
            sortColumn = 'idcard_no';
          }
          const socialSecurityHistoryFilterString = localStorage.getItem(that.filterSessionName);
          if (socialSecurityHistoryFilterString) {
            const storageSocialSecurityHistoryFillter = JSON.parse(socialSecurityHistoryFilterString) as SocialSecurityHistoryFilter;
            that.socialSecurityForm.patchValue({
              payroll_year_month: `${storageSocialSecurityHistoryFillter.payrollYear},${storageSocialSecurityHistoryFillter.payrollMonth}`,
              search: storageSocialSecurityHistoryFillter.search,
              social_hospital_id: storageSocialSecurityHistoryFillter.socialHospitalId,
              site_id: storageSocialSecurityHistoryFillter.siteId
            });
            dtInstance.page(storageSocialSecurityHistoryFillter.page);
            dtInstance.page.len(storageSocialSecurityHistoryFillter.page_size);
            localStorage.removeItem(that.filterSessionName);
          }
          const payrollYearMonth = that.socialSecurityForm.get('payroll_year_month').value
            ? that.socialSecurityForm.get('payroll_year_month').value.split(',') : undefined;
          that.socialSecurityHistoryFilter = {
            search: that.socialSecurityForm.get('search').value,
            payrollYear: payrollYearMonth ? payrollYearMonth[0] : undefined,
            payrollMonth: payrollYearMonth ? payrollYearMonth[1] : undefined,
            socialHospitalId: that.socialSecurityForm.get('social_hospital_id').value,
            siteId: that.socialSecurityForm.get('site_id').value,
            sort_column: sortColumn,
            sort_by: sortBy,
            page: dtInstance.page.info().page,
            page_size: dtInstance.page.info().length
          };

          that.payrollService.getSocialSecurityHistoryFilter(
            that.socialSecurityHistoryFilter.search,
            that.socialSecurityHistoryFilter.payrollYear,
            that.socialSecurityHistoryFilter.payrollMonth,
            that.socialSecurityHistoryFilter.socialHospitalId,
            that.socialSecurityHistoryFilter.siteId,
            that.socialSecurityHistoryFilter.sort_column,
            that.socialSecurityHistoryFilter.sort_by,
            that.socialSecurityHistoryFilter.page + 1,
            that.socialSecurityHistoryFilter.page_size).subscribe(result => {
              that.spinner.hideLoadingSpinner(0);
              that.socialSecurityHistories = result.data;
              callback({
                recordsTotal: result.total,
                recordsFiltered: result.total,
                data: []
              });
            }, error => {
              that.spinner.hideLoadingSpinner(0);
              that.socialSecurityHistories = [];
              callback({
                recordsTotal: 0,
                recordsFiltered: 0,
                data: []
              });
            });
        });
      },
      columns: [
        { width: '170px' },
        null,
        { width: '120px' },
        { width: '120px' },
        { width: '260px' },
        { orderable: false, width: '20px' }
      ]
    };
  }

  refreshTable() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(0);
      dtInstance.ajax.reload(null, false);
    });
  }


  onYearMonthSelectionChange(data) {
    this.refreshTable();
  }

  onHospitalSelectionChange(data) {
    this.refreshTable();
  }

  onSiteSelectionChange(data) {
    this.refreshTable();
  }

  onClickEdit(socialSecurityHistory: SocialSecurityHistory) {
    this.editForm.patchValue({
      name: `${socialSecurityHistory.firstName} ${socialSecurityHistory.lastName}`,
      idcard_no: socialSecurityHistory.idCardNumber,
      social_hospital_id: socialSecurityHistory.socialHospitalId
    });
    this.ngxSmartModalService.getModal('editModal').open();
  }

  onEdit() {
    this.spinner.showLoadingSpinner();
    const payrollYearMonth = this.socialSecurityForm.get('payroll_year_month').value.split(',');
    const hospital = this.hospitals.filter(h => h.id === this.editForm.get('social_hospital_id').value)[0];
    this.payrollService.updateSocialSecurityHistory(
      payrollYearMonth[0],
      payrollYearMonth[1],
      this.editForm.get('idcard_no').value,
      hospital.id,
      hospital.name
    ).subscribe(socialSecurityHistory => {
      this.ngxSmartModalService.getModal('editModal').close();
      this.refreshTable();
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  onExport() {
    this.spinner.showLoadingSpinner();
    const payrollYearMonth = this.socialSecurityForm.get('payroll_year_month').value.split(',');
    this.payrollService.getSocialSecurityHistories(
      payrollYearMonth[0],
      payrollYearMonth[1],
      this.socialSecurityForm.get('site_id').value
    ).subscribe(socialSecurityHistories => {
      const data = socialSecurityHistories.map(s => ({
        'ปี': s.payrollYear,
        'เดือน': s.payrollMonth,
        'เลขประจำตัวประชาชน': `'${s.idCardNumber}`,
        'หน่วยงาน': s.siteName,
        'คำนำหน้าชื่อ': s.title,
        'ชื่อ': s.firstName,
        'นามสกุล': s.lastName,
        'ค่าจ้าง': s.totalWage,
        'จำนวนเงินสมทบ': s.socialSecurity,
        'สถานพยาบาล': s.socialHospitalId ? s.hospitalName : ''
      }));
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + this.papa.unparse(data)], { type: 'text/csv;charset=utf-8' });
      let fileName = `sso_${payrollYearMonth[0]}_${payrollYearMonth[1]}`;
      if (this.socialSecurityForm.get('site_id').value) {
        fileName = `sso_${payrollYearMonth[0]}_${payrollYearMonth[1]}_${this.socialSecurityForm.get('site_id').value}`;
      }
      FileSaver.saveAs(blob, `${fileName}.csv`);
      this.spinner.hideLoadingSpinner();
    }, error => {
      this.spinner.hideLoadingSpinner();
    });
  }


  updateView() {
    this.applicationStateService.setIsHiddenSearch = true;
  }

}
