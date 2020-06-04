import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { ActivatedRoute } from '@angular/router';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment';
import { ElectronService } from 'ngx-electron';
import { TimeAttendanceService } from 'src/app/core/services/time-attendance.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { TimeAttendance } from 'src/app/core/models/timeattendance';
import { MonthHelper } from 'src/app/core/helpers/month.helper';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-detail-employee',
  templateUrl: './detail-employee.component.html',
  styleUrls: ['./detail-employee.component.scss']
})
export class DetailEmployeeComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild(DataTableDirective, { static: false }) private datatableElement: DataTableDirective;
  @ViewChild('nfcDecInput', { static: false }) nfcDecInput: ElementRef;
  public defaultImagePath = environment.basePath;
  dtTrigger = new Subject();
  timeAttendances: TimeAttendance[] = [];
  empNo: number;
  user: User;
  sub: any;
  months: {}[] = [];
  years: {}[] = [];
  timeAttendanceForm = this.fb.group({
    year: [new Date().getFullYear(), [Validators.required]],
    month: [new Date().getMonth() + 1]
  });
  scanForm = this.fb.group({
    nfcRefId: ['', [Validators.required]]
  });
  processing = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private electronService: ElectronService,
    private fb: FormBuilder,
    private monthHelper: MonthHelper,
    private ngxSmartModalService: NgxSmartModalService,
    private spinner: SpinnerHelper,
    private timeAttendanceService: TimeAttendanceService,
    private userService: UserService,
  ) {
    this.updateView();
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.empNo = Number(params['empNo']);
    });
  }

  ngAfterViewInit() {
    this.ngxSmartModalService.getModal('scanNfcCardModal').onOpen.subscribe((event: Event) => {
      setTimeout(() => {
        this.nfcDecInput.nativeElement.focus();
      }, 300);
    });

    this.ngxSmartModalService.getModal('scanNfcCardModal').onClose.subscribe((event: Event) => {
      this.scanForm.reset({
        id: ''
      });
    });
  }

  ngOnInit() {
    this.initialData();
  }

  ngOnDestroy() {
    this.applicationStateService.setIsHiddenLeftMenu = false;
    this.applicationStateService.setIsHiddenSearch = false;
    this.applicationStateService.setIsHiddenTopMenu = false;
    this.dtTrigger.unsubscribe();
  }

  initialData() {
    this.spinner.showLoadingSpinner();
    const currentYear = new Date().getFullYear();
    this.months = this.monthHelper.months;
    for (let year = currentYear - 5; year < currentYear + 5; year++) {
      this.years.push({ view: year, viewValue: year });
    }
    this.userService.getUser(this.empNo).subscribe(user => {
      this.user = user;
      if (this.user.timelineUsers) {
        this.user.timelineUsers = this.user.timelineUsers.sort((a, b) => (a.createOn > b.createOn ? -1 : 1));
      }
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  updateView() {
    this.applicationStateService.setIsHiddenLeftMenu = true;
    this.applicationStateService.setIsHiddenSearch = true;
    this.applicationStateService.setIsHiddenTopMenu = true;
  }

  viewUserDococuments(documentId: number) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-document', this.empNo, documentId);
    }
  }

  onLoadTimeAttendance() {
    this.spinner.showLoadingSpinner();
    const monthDate = new Date(
      this.timeAttendanceForm.get('year').value, this.timeAttendanceForm.get('month').value - 1, 1);
    this.timeAttendanceService.getUserTimeAttendanceByMonthDate(this.empNo, monthDate).subscribe(timeAttendances => {
      this.timeAttendances = timeAttendances;
      if (this.datatableElement.dtInstance) {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
        });
      } else {
        this.dtTrigger.next();
      }
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  onSelectTimeAttendanceTab() {
    this.onLoadTimeAttendance();
  }

  onYearSelectionChange() {
    this.onLoadTimeAttendance();
  }

  onMonthSelectionChange() {
    this.onLoadTimeAttendance();
  }

  onScan() {
    this.processing = true;
    this.userService.updateNfcRefId(this.empNo, this.scanForm.get('nfcRefId').value).subscribe(user => {
      this.processing = false;
      this.ngxSmartModalService.getModal('scanNfcCardModal').close();
    }, error => {
      this.processing = false;
    });
  }

  get dtOptions(): DataTables.Settings {
    return {
      autoWidth: false,
      dom: 'tr<\'d-flex align-items-center w-100 mt-4\'<l><\'ml-auto pr-2\'i><p>\'>',
      lengthMenu: [10, 20, 50],
      language: {
        emptyTable: '<strong>0</strong> row(s) returned',
        info: 'Viewing <strong>_START_-_END_</strong> of <strong>_TOTAL_</strong>',
        infoEmpty: 'No row(s) to show',
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
      order: [[0, 'desc']],
      pageLength: 10,
      pagingType: 'simple',
      columns: [
        { width: '150px' },
        { orderable: false, width: '200px' },
        { orderable: false, width: '250px' }
      ]
    };
  }

  convertToTimeRangeString(startTimeString: string, endTimeString: string): string {
    if (startTimeString === '' || startTimeString === null || startTimeString === undefined) {
      return '';
    }
    const start = new Date(startTimeString);
    const startTime = `${this.padLeftZero(start.getHours())}:${this.padLeftZero(start.getMinutes())}`;
    let endTime = '';
    if (endTimeString === '' || endTimeString === null || endTimeString === undefined) {
      endTime = '??:??';
    } else {
      const end = new Date(endTimeString);
      endTime = `${this.padLeftZero(end.getHours())}:${this.padLeftZero(end.getMinutes())}`;
    }
    return `${startTime} - ${endTime}`;
  }

  padLeftZero(value: number): string {
    return `${(value < 10 ? '0' : '') + value}`;
  }

  convertToAge(birthdate: string): number {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  capitalizeFirstLetter(value: string): string {
    if (value === '' || value === undefined || value === null) {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  convertDocumentTypeName(type: string): string {
    let documentTypeName = '';
    switch (type) {
      case 'CopyOfBookBank':
        documentTypeName = 'สำเนาบุ๊คแบงค์';
        break;
      case 'CopyOfIdCardNumber':
        documentTypeName = 'สำเนาบัตรประชาชน';
        break;
      case 'CopyOfHouseRegistration':
        documentTypeName = 'สำเนาทะเบียนบ้าน';
        break;
      case 'CopyOfTranscript':
        documentTypeName = 'หลักฐานการศึกษา';
        break;
      default:
        documentTypeName = 'อื่นๆ';
        break;
    }
    return documentTypeName;
  }

  previewTransferReport(empNo: string) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-employee-transfer', empNo);
    }
  }

  previewEmployeeProfileReport(empNo: string) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-employee-profile', empNo);
    }
  }

  previewEmployeeProfileMiniReport(empNo: string) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-employee-profile-mini', empNo);
    }
  }

  previewEmployeeLicense(empNo: string) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-employee-license', empNo);
    }
  }

  previewEmployeeCard(empNo: string) {
    this.userService.downloadEmployeeCard(empNo);
  }

  navigateMainToEditPage(empNo: string) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('navigate-main-to-edit-employee', empNo);
    }
  }
}
