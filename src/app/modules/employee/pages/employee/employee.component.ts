import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { User, UserFilter } from 'src/app/core/models/user';
import { Subject } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';
import { FormBuilder } from '@angular/forms';
import { SiteService } from 'src/app/core/services/site.service';
import { Site } from 'src/app/core/models/site';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import * as _ from 'lodash';
import { ElectronService } from 'ngx-electron';
import { Router } from '@angular/router';
import { Papa } from 'ngx-papaparse';
import * as FileSaver from 'file-saver';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild(DataTableDirective, { static: false }) private datatableElement: DataTableDirective;
  public defaultImagePath = environment.basePath;
  user: User;
  sites: Site[] = [];
  users: User[] = [];
  userFilter: UserFilter;
  filterSessionName = 'userFilter';

  dtTrigger = new Subject();
  dtOptions: DataTables.Settings = {};
  totalUsers = 0;

  userForm = this.fb.group({
    site_array: [[]],
    user_status: [true]
  });

  constructor(
    private authService: AuthService,
    private electronService: ElectronService,
    private fb: FormBuilder,
    private moment: MomentHelper,
    private ngxSmartModalService: NgxSmartModalService,
    private papa: Papa,
    private router: Router,
    private siteService: SiteService,
    private spinner: SpinnerHelper,
    private userService: UserService
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
  }

  ngOnInit() {
    this.siteService.getSites().subscribe(sites => {
      this.sites = sites;
    });
    this.initialData();
  }

  ngOnDestroy() {
    if (this.userFilter) {
      localStorage.setItem(this.filterSessionName, JSON.stringify(this.userFilter));
    }
  }

  ngAfterViewInit() {
    this.ngxSmartModalService.getModal('confirmModal').onClose.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData();
      if (data) {
        if (data.isSuccess) {
          this.createUserPassword(data.empNo);
        }
      }
    });
  }

  initialData() {
    const that = this;
    that.dtOptions = {
      autoWidth: false,
      dom: 'tr<\'d-flex align-items-center w-100 mt-4\'<l><\'ml-auto pr-2\'i><p>\'>',
      lengthMenu: [10, 20, 50],
      language: {
        emptyTable: '<strong>0</strong> user(s) returned',
        info: 'Viewing <strong>_START_-_END_</strong> of <strong>_TOTAL_</strong>',
        infoEmpty: 'No user(s) to show',
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
      pageLength: 10,
      pagingType: 'simple',
      serverSide: true,
      processing: true,
      ajax: ({ }: any, callback) => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          const orders = Object.values(dtInstance.order()[0]);
          const sortBy = String(orders[1]);
          let sortColumn = '';
          if (orders[0] === 2) {
            sortColumn = 'name';
          } else if (orders[0] === 6) {
            sortColumn = 'site';
          } else {
            sortColumn = 'empNo';
          }
          const userFilterString = localStorage.getItem(that.filterSessionName);
          if (userFilterString) {
            const storageUserFillter = JSON.parse(userFilterString) as UserFilter;
            that.userForm.patchValue({
              site_array: storageUserFillter.site_array ? storageUserFillter.site_array : [],
              user_status: storageUserFillter.user_status
            });
            dtInstance.page(storageUserFillter.page);
            dtInstance.page.len(storageUserFillter.page_size);
            localStorage.removeItem(that.filterSessionName);
          }
          that.userFilter = {
            search: '',
            site_array: that.userForm.get('site_array').value,
            user_status: that.userForm.get('user_status').value,
            sort_column: sortColumn,
            sort_by: sortBy,
            page: dtInstance.page.info().page,
            page_size: dtInstance.page.info().length
          };

          that.userService.getUserFilter(
            that.userFilter.search,
            that.userFilter.site_array ? that.userFilter.site_array.map(s => s.id).join(',') : '',
            that.userFilter.user_status,
            that.userFilter.sort_column,
            that.userFilter.sort_by,
            that.userFilter.page + 1,
            that.userFilter.page_size).subscribe(result => {
              that.users = result.data;
              that.totalUsers = result.total;
              callback({
                recordsTotal: result.total,
                recordsFiltered: result.total,
                data: []
              });
            });
        });
      },
      columns: [
        { width: '90px' },
        { orderable: false, width: '40px' },
        { width: '250px' },
        { orderable: false, width: '70px' },
        { orderable: false, width: '150px' },
        { orderable: false, width: '100px' },
        { width: '270px' },
        { orderable: false, width: '100px' },
        { orderable: false, width: '20px' }
      ]
    };
  }

  onSiteSelectionChange() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(0);
      dtInstance.ajax.reload(null, false);
    });
  }

  onUserStatusSelectionChange() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(0);
      dtInstance.ajax.reload(null, false);
    });
  }

  viewUserInfo(empNo: string) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-user', empNo);
    }
  }

  editUserInfo(empNo: string) {
    this.router.navigate(['/employee/edit', empNo]);
  }

  onClickCreateUserPasword(empNo: string) {
    this.ngxSmartModalService.getModal('confirmModal').setData({
      title: 'ยืนยันข้อมูล',
      message: 'คุณต้องการสร้างรหัสผู้ใช้งานนี้ใช่หรือไม่',
      isSuccess: false,
      empNo: empNo
    }, true);
    this.ngxSmartModalService.getModal('confirmModal').open();
  }

  createUserPassword(empNo: string) {
    this.spinner.showLoadingSpinner();
    this.authService.createDefaultUserPassword(empNo).subscribe(_ => {
      this.ngxSmartModalService.getModal('confirmModal').setData(null, true);
      this.spinner.hideLoadingSpinner(0);
      this.ngxSmartModalService.getModal('successModal').setData('สร้างรหัสผู้ใช้งานสำเร็จ', true);
      this.ngxSmartModalService.getModal('successModal').open();
    }, error => {
      this.ngxSmartModalService.getModal('confirmModal').setData(null, true);
      this.spinner.hideLoadingSpinner();
    });
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

  previewEmployeeApplicationForm(empNo: string) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-employee-application-form', empNo);
    }
  }

  previewEmployeeCertificateForm(empNo: string) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-employee-certificate-report', empNo);
    }
  }

  onExportUserToCsv() {
    this.spinner.showLoadingSpinner();
    this.userService.getUsers().subscribe(users => {
      const data = users.map(u => ({
        'รหัสพนักงาน': `'${u.empNo}`,
        'บริษัท': u.companyId,
        'หน่วยงาน': u.site.name,
        'ตำแหน่ง': u.role.nameTH,
        'เลขที่บัตรประชาชน': `'${u.idCardNumber}`,
        'วันที่ออกบัตร': !u.dateIssued ? '' : this.convertToDateString(u.dateIssued),
        'วันหมดอายุ': !u.expiryDate ? '' : this.convertToDateString(u.expiryDate),
        'คำนำหน้า': u.title,
        'ชื่อ': u.firstName,
        'นามสกุล': u.lastName,
        'คำนำหน้าภาษาอังกฤษ': u.titleEn,
        'ชื่อภาษาอังกฤษ': u.firstnameEn,
        'นามสกุลอังกฤษ': u.lastnameEn,
        'เพศ': u.gender,
        'ธนาคาร': u.bankName,
        'เลขที่บัญชี': `'${u.bankAccount}`,
        'เบอร์โทรศัพท์': u.phoneNo,
        'ระดับการศึกษา': u.education,
        'วันเกิด': !u.birthdate ? '' : this.convertToDateString(u.birthdate),
        'อายุ': this.convertToAge(u.birthdate),
        'อายุงาน': u.workExperience,
        'อายุเกษียณ': 60,
        'น้ำหนัก': u.weight && u.weight > 0 ? u.weight : '',
        'ส่วนสูง': u.height && u.height > 0 ? u.height : '',
        'เชื้อชาติ': u.ethnicity,
        'สัญชาติ': u.nationality,
        'ศาสนา': u.religion,
        'ที่อยู่ตามทะเบียนบ้าน': u.permanentAddress,
        'ที่อยู่ปัจจุบัน': u.currentAddress,
        'วันเริ่มงาน': !u.startDate ? '' : this.convertToDateString(u.startDate),
        'วันที่ลาออก': !u.endDate ? '' : this.convertToDateString(u.endDate),
        'อายุงาน (วัน)': !u.startDate ? 0
          : Math.ceil(Math.abs((!u.endDate ? new Date().getTime() : new Date(u.endDate).getTime())
            - new Date(u.startDate).getTime()) / (1000 * 3600 * 24)),
        'สาเหตุที่ออก': u.resignationCause,
        'กรณีฉุกเฉินบุคคลที่ติดต่อได้': u.refName_1 ? u.refName_1 : '',
        'ความสัมพันธ์ผู้ติดต่อ': u.refRelation_1 ? u.refRelation_1 : '',
        'เบอร์โทรศัพท์ผู้ติดต่อ': u.refPhoneNo_1 ? u.refPhoneNo_1 : '',
        'ที่อยู่ผู้ติดต่อ': u.refAddress_1 ? u.refAddress_1 : '',
        'วันที่ยื่นเข้าประกันสังคม': !u.socialSecurityStartDate ? '' : this.convertToDateString(u.socialSecurityStartDate),
        'วันที่ยื่นออกประกันสังคม': !u.socialSecurityEndDate ? '' : this.convertToDateString(u.socialSecurityEndDate),
        'สถานพยาบาลประกันสังคม': !u.hospital ? '' : u.hospital.name,
        'เลขที่ใบอนุญาต': !u.licenseNo ? '' : u.licenseNo,
        'วันเริ่มต้นใบอนุญาต': !u.licenseStartDate ? '' : this.convertToDateString(u.licenseStartDate),
        'วันที่สิ้นสุดใบอนุญาต': !u.licenseEndDate ? '' : this.convertToDateString(u.licenseEndDate),
        'เงินเดือน': (!u.siteUserPosition || !u.site || !u.site.province) ? 0 : u.siteUserPosition.minimumManday * u.site.minimumWage,
        'วันทำงานต่อเดือน': !u.siteUserPosition ? 0 : u.siteUserPosition.minimumManday,
        'ค่าแรงขั้นต่ำ': (!u.site || !u.site.province) ? 0 : u.site.minimumWage
      }));
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + this.papa.unparse(data)], { type: 'text/csv;charset=utf-8' });
      FileSaver.saveAs(blob, `users_${this.moment.format(new Date(), 'YYYYMMDDHHmmss')}.csv`);
      this.spinner.hideLoadingSpinner();
    }, error => {
      this.spinner.hideLoadingSpinner();
    });
  }

  convertToAge(birthdate: string): number {
    if (birthdate === undefined || birthdate === null || birthdate === '') {
      return 0;
    }
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  convertToDateString(dateString: string): string {
    if (dateString === null || dateString === undefined || dateString === '') {
      return '';
    }
    function pad(s) { return (s < 10) ? '0' + s : s; }
    const d = new Date(dateString);
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
  }

  get HasEmployeePermission() {
    const allowed = ['registrar', 'hr', 'hrm', 'admin'];
    return this.matchingRole(this.user.role.id, allowed);
  }

  get HasAdminPerrmission() {
    return this.matchingRole(this.user.role.id, ['admin']);
  }

  private matchingRole(role, allowedRoles): boolean {
    return _.indexOf(allowedRoles, role) !== -1;
  }
}
