import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { TimeAttendanceService } from 'src/app/core/services/time-attendance.service';
import { Site, SiteWorkRate } from 'src/app/core/models/site';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { TimeAttendance, TimeAttendanceFilter } from 'src/app/core/models/timeattendance';
import { DataTableDirective } from 'angular-datatables';
import { Papa } from 'ngx-papaparse';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import * as FileSaver from 'file-saver';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { User } from 'src/app/core/models/user';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-time-attendance',
  templateUrl: './time-attendance.component.html',
  styleUrls: ['./time-attendance.component.scss']
})
export class TimeAttendanceComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false }) private datatableElement: DataTableDirective;
  searching = false;
  sites: Site[] = [];
  timeAttendanceFilter: TimeAttendanceFilter;
  filterSessionName = 'timeAttendanceFilter';
  timeAttendances: TimeAttendance[] = [];
  employees: User[] = [];
  siteWorkRates: any[] = [];
  timeAttendanceForm = this.fb.group({
    site_id: [undefined],
    work_date: [new Date()]
  });

  editForm = this.fb.group({
    id: [0],
    site_id: [undefined],
    work_date: [new Date(), [Validators.required]],
    period_time: [undefined, [Validators.required]],
    search: [''],
    emp_no: [undefined, Validators.required],
    name: [''],
    checkin_date: [{ value: new Date(), disabled: true }],
    leave_date: [undefined, [Validators.required]],
    checkin_time: [undefined, [Validators.required]],
    leave_time: [undefined, [Validators.required]]
  });

  deleteForm = this.fb.group({
    id: [undefined, [Validators.required]]
  });

  dtTrigger = new Subject();
  dtOptions: DataTables.Settings = {};
  constructor(
    private applicationStateService: ApplicationStateService,
    private electronService: ElectronService,
    private fb: FormBuilder,
    private moment: MomentHelper,
    private ngxSmartModalService: NgxSmartModalService,
    private papa: Papa,
    private spinner: SpinnerHelper,
    private timeAttendanceService: TimeAttendanceService,
    private userService: UserService
  ) {
    this.updateView();
  }

  ngOnInit() {
    this.spinner.showLoadingSpinner();
    combineLatest([
      this.timeAttendanceService.getTimeAttendanceSites()
    ]).subscribe(results => {
      this.sites = results[0];
      // this.timeAttendanceForm.patchValue({
      //   site_id: this.sites[0].id
      // });
      // this.timeAttendanceForm.get('site_id').setValue(this.sites[0].id);
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
    this.initialData();
  }

  ngOnDestroy() {
    if (this.timeAttendanceFilter) {
      localStorage.setItem(this.filterSessionName, JSON.stringify(this.timeAttendanceFilter));
    }
    this.applicationStateService.setIsHiddenSearch = false;
  }

  ngAfterViewInit() {
    this.ngxSmartModalService.getModal('deleteModal').onClose.subscribe((event: Event) => {
      this.deleteForm.reset({
        id: undefined
      });
    });

    this.ngxSmartModalService.getModal('newTimeAttendanceModal').onClose.subscribe((event: Event) => {
      this.editForm.reset({
        id: 0,
        site_id: undefined,
        work_date: new Date(),
        period_time: undefined,
        search: '',
        emp_no: undefined,
        name: '',
        checkin_date: new Date(),
        leave_date: undefined,
        checkin_time: undefined,
        leave_time: undefined
      });
    });

    this.editForm.get('search').valueChanges
      .pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
        if (val.length < 2) {
          this.employees = [];
          this.searching = false;
        } else {
          this.userService.getUserFilter(val, null, null, 'name', 'asc', 1, 12).subscribe(results => {
            if (results.data.length > 0) {
              this.employees = results.data.splice(0, 10);
            }
            this.searching = false;
          }, error => {
            this.employees = [];
            this.searching = false;
          });
        }
      });

    this.editForm.get('work_date').valueChanges.subscribe(val => {
      const workDate: Date = val;
      workDate.setHours(7);
      this.editForm.get('checkin_date').setValue(workDate);
    });
  }

  initialData() {
    const that = this;
    that.dtOptions = {
      autoWidth: false,
      dom: 'tr<\'d-flex align-items-center w-100 mt-4\'<l><\'ml-auto pr-2\'i><p>\'>',
      lengthMenu: [20, 50, 100],
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
      order: [[5, 'asc']],
      pageLength: 20,
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
            sortColumn = 'role_name';
          } else if (orders[0] === 6) {
            sortColumn = 'leave_time';
          } else {
            sortColumn = 'checkin_time';
          }
          const timeAttendanceFilterString = localStorage.getItem(that.filterSessionName);
          if (timeAttendanceFilterString) {
            const storageTimeAttendanceFillter = JSON.parse(timeAttendanceFilterString) as TimeAttendanceFilter;
            that.timeAttendanceForm.patchValue({
              site_id: storageTimeAttendanceFillter.siteId,
              work_date: new Date(storageTimeAttendanceFillter.workDate)
            });
            dtInstance.page(storageTimeAttendanceFillter.page);
            dtInstance.page.len(storageTimeAttendanceFillter.page_size);
            localStorage.removeItem(that.filterSessionName);
          }
          that.timeAttendanceFilter = {
            siteId: that.timeAttendanceForm.get('site_id').value,
            workDate: that.timeAttendanceForm.get('work_date').value,
            sort_column: sortColumn,
            sort_by: sortBy,
            page: dtInstance.page.info().page,
            page_size: dtInstance.page.info().length
          };

          that.timeAttendanceService.getTimeAttendanceFilter(
            that.timeAttendanceFilter.siteId,
            that.timeAttendanceFilter.workDate,
            that.timeAttendanceFilter.sort_column,
            that.timeAttendanceFilter.sort_by,
            that.timeAttendanceFilter.page + 1,
            that.timeAttendanceFilter.page_size).subscribe(result => {
              that.spinner.hideLoadingSpinner(0);
              that.timeAttendances = result.data;
              that.timeAttendanceForm.get('site_id').setValue(
                that.timeAttendances.length > 0
                  ? that.timeAttendances[0].siteId : that.timeAttendanceFilter.siteId);
              callback({
                recordsTotal: result.total,
                recordsFiltered: result.total,
                data: []
              });
            }, error => {
              that.spinner.hideLoadingSpinner(0);
              that.timeAttendances = [];
              callback({
                recordsTotal: 0,
                recordsFiltered: 0,
                data: []
              });
            });
        });
      },
      columns: [
        { orderable: false, width: '40px' },
        { width: '200px' },
        { width: '160px' },
        { orderable: false, width: '220px' },
        { orderable: false, width: '100px' },
        { width: '100px' },
        { width: '100px' },
        { orderable: false, width: '20px' }
      ]
    };
  }

  onSiteSelectionChange(value) {
    this.refreshTable();
  }

  onWorkDateSelectionChange(value) {
    this.refreshTable();
  }

  onSearchChange() {
    this.searching = true;
    this.employees = [];
  }

  onClickAdd() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const wDate: Date = this.timeAttendanceForm.get('work_date').value;
    wDate.setHours(7);
    this.editForm.patchValue({
      id: 0,
      site_id: this.timeAttendanceForm.get('site_id').value,
      work_date: wDate,
      checkin_date: wDate,
      checkin_time: this.moment.toDate(d, 'HH:mm:ss'),
      leave_time: this.moment.toDate(d, 'HH:mm:ss')
    });
    this.siteWorkRates = this.sites.filter(s => s.id === this.timeAttendanceForm.get('site_id').value).length > 0
      ? this.sites.filter(s => s.id === this.timeAttendanceForm.get('site_id').value).map(s => s.siteWorkRates.map((r, index) => ({
        startTime: r.startTime,
        endTime: r.endTime,
        view: `${r.startTime} - ${r.endTime}`,
        viewValue: index,
      })))[0]
      : [];
    this.editForm.get('site_id').enable();
    this.editForm.get('work_date').enable();
    this.ngxSmartModalService.get('newTimeAttendanceModal').open();
  }

  onClickEdit(timeAttendance: TimeAttendance) {
    this.siteWorkRates = this.sites.filter(s => s.id === this.timeAttendanceForm.get('site_id').value).length > 0
      ? this.sites.filter(s => s.id === this.timeAttendanceForm.get('site_id').value).map(s => s.siteWorkRates.map((r, index) => ({
        startTime: r.startTime,
        endTime: r.endTime,
        view: `${r.startTime} - ${r.endTime}`,
        viewValue: index,
      })))[0]
      : [];
    const workDate = new Date(timeAttendance.workDate);
    if (workDate) {
      workDate.setHours(7);
    }
    const leaveDate = new Date(timeAttendance.leaveTime);
    if (leaveDate) {
      leaveDate.setHours(7);
    }
    this.editForm.patchValue({
      id: timeAttendance.id,
      site_id: timeAttendance.siteId,
      work_date: workDate,
      period_time: this.siteWorkRates.filter(r => r.startTime === timeAttendance.startTime
        && r.endTime === timeAttendance.endTime)[0].viewValue,
      emp_no: timeAttendance.empNo,
      name: timeAttendance.employeeName,
      leave_date: leaveDate,
      checkin_time: new Date(timeAttendance.checkInTime),
      leave_time: new Date(timeAttendance.leaveTime)
    });
    this.editForm.get('site_id').disable();
    this.editForm.get('work_date').disable();
    this.ngxSmartModalService.get('newTimeAttendanceModal').open();
  }

  onExport() {
    this.spinner.showLoadingSpinner();
    const site = this.sites.filter(s => s.id === this.timeAttendanceForm.get('site_id').value)[0];
    const workDate = this.timeAttendanceForm.get('work_date').value;
    if (site && workDate) {
      this.timeAttendanceService.getSiteTimeAttendanceByWorkDate(
        site.id,
        workDate
      ).subscribe(timeAttendances => {
        const data = timeAttendances.map(s => ({
          'หน่วยงาน': s.site.name,
          'วันที่': this.moment.format(s.workDate, 'DD/MM/YYYY'),
          'รหัสพนักงาน': `'${s.empNo}`,
          'ตำแหน่ง': s.user.role.nameTH,
          'ชื่อ-สกุล': s.employeeName,
          'รอบเวลา': `${s.startTime.substr(0, 5)} - ${s.endTime.substr(0, 5)} `,
          'เวลาเข้า': s.checkInTime === undefined ? '' : this.moment.format(s.checkInTime, 'HH:mm:ss'),
          'เวลาออก': s.leaveTime === undefined ? '' : this.moment.format(s.leaveTime, 'HH:mm:ss'),
          'สาย (นาที)': this.diffMinutes(new Date(s.checkInTime), new Date(String(s.checkInTime).substr(0, 11) + s.startTime))
        }));
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + this.papa.unparse(data)], { type: 'text/csv;charset=utf-8' });
        FileSaver.saveAs(blob, `${site.name}_${this.moment.format(workDate, 'YYYYMMDD')}.csv`);
        this.spinner.hideLoadingSpinner();
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      });
    } else {
      this.spinner.hideLoadingSpinner(0);
    }
  }

  onExportWorkingSiteMonthlyReport() {
    if (this.electronService.isElectronApp) {
      const workDate: Date = this.timeAttendanceForm.get('work_date').value;
      this.electronService.ipcRenderer.send('view-working-site-report'
        , this.timeAttendanceForm.get('site_id').value, workDate.getFullYear(), workDate.getMonth() + 1);
    }
  }

  onClickSearchUser(user: User) {
    this.editForm.patchValue({
      emp_no: user.empNo,
      name: `${user.firstName} ${user.lastName}`
    });
    this.editForm.get('search').setValue('');
    this.employees = [];
  }

  openDeleteDialog(timeAttendance: TimeAttendance) {
    this.deleteForm.get('id').setValue(timeAttendance.id);
    this.ngxSmartModalService.get('deleteModal').open();
  }

  onDelete() {
    this.spinner.showLoadingSpinner();
    this.timeAttendanceService.deleteTimeAttendance(this.deleteForm.get('id').value).subscribe(_ => {
      this.refreshTable();
      this.ngxSmartModalService.get('deleteModal').close();
      this.spinner.hideLoadingSpinner();
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  onSubmit() {
    // this.spinner.showLoadingSpinner();
    const that = this;
    function getValue(controlName) {
      return that.editForm.get(controlName).value;
    }
    function padLeftZero(value: number) {
      return `${(value < 10 ? '0' : '') + value}`;
    }
    const periodTime = this.siteWorkRates.filter(r => r.viewValue === getValue('period_time'))[0];
    const checkInDate: Date = getValue('checkin_date');
    const checkInTime: Date = getValue('checkin_time');
    const leaveDate: Date = getValue('leave_date');
    const leaveTime: Date = getValue('leave_time');
    const checkInDateTime = `${this.moment.format(checkInDate, 'YYYY-MM-DD')}T${this.moment.format(checkInTime, 'HH:mm:00')}Z`;
    const leaveDateTime = `${this.moment.format(leaveDate, 'YYYY-MM-DD')}T${this.moment.format(leaveTime, 'HH:mm:00')}Z`;
    if (this.editForm.get('id').value === 0) {
      const timeAttendance: TimeAttendance = {
        id: 0,
        empNo: getValue('emp_no'),
        user: null,
        employeeName: getValue('name'),
        siteId: getValue('site_id'),
        site: null,
        workDate: this.moment.formatISO8601(getValue('work_date')),
        startTime: periodTime.startTime,
        endTime: periodTime.endTime,
        checkInTime: checkInDateTime,
        checkInByName: '',
        leaveTime: leaveDateTime,
        leaveByName: '',
        createBy: '',
        createOn: new Date(),
        updateBy: '',
        updateOn: new Date()
      };
      this.timeAttendanceService.createTimeAttendance(timeAttendance).subscribe(_ => {
        this.refreshTable();
        this.ngxSmartModalService.getModal('newTimeAttendanceModal').close();
        this.spinner.hideLoadingSpinner(0);
      });
    } else {
      const timeAttendance: TimeAttendance = {
        id: getValue('id'),
        empNo: getValue('emp_no'),
        user: null,
        employeeName: getValue('name'),
        siteId: getValue('site_id'),
        site: null,
        workDate: this.moment.formatISO8601(getValue('work_date')),
        startTime: periodTime.startTime,
        endTime: periodTime.endTime,
        checkInTime: checkInDateTime,
        checkInByName: '',
        leaveTime: leaveDateTime,
        leaveByName: '',
        createBy: '',
        createOn: new Date(),
        updateBy: '',
        updateOn: new Date()
      };
      this.timeAttendanceService.updateTimeAttendance(timeAttendance.id, timeAttendance).subscribe(_ => {
        this.refreshTable();
        this.ngxSmartModalService.getModal('newTimeAttendanceModal').close();
        this.spinner.hideLoadingSpinner(0);
      });
    }
  }

  refreshTable() {
    if (this.datatableElement) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.page(0);
        dtInstance.ajax.reload(null, false);
      });
    }
  }

  diffMinutes(dt2: Date, dt1: Date) {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.round(diff) < 0 ? 0 : Math.round(diff);
  }

  updateView() {
    this.applicationStateService.setIsHiddenSearch = true;
  }
}
