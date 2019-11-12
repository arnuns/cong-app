import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { User } from 'src/app/core/models/user';
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

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false }) private datatableElement: DataTableDirective;
  public defaultImagePath = environment.basePath;
  user: User;
  sites: Site[] = [];
  users: User[] = [];
  dtTrigger = new Subject();
  dtOptions: DataTables.Settings = {};
  totalUsers = 0;

  userForm = this.fb.group({
    site_array: [[]],
    user_status: [undefined]
  });

  constructor(
    private authService: AuthService,
    private electronService: ElectronService,
    private fb: FormBuilder,
    private router: Router,
    private siteService: SiteService,
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
          let siteArray = '';
          if (that.userForm.get('site_array').value) {
            siteArray = that.userForm.get('site_array').value.map(s => s.id).join(',');
          }
          that.userService.getUserFilter(
            '',
            siteArray,
            that.userForm.get('user_status').value,
            sortColumn,
            sortBy,
            dtInstance.page.info().page + 1,
            dtInstance.page.info().length).subscribe(result => {
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
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-employee-card', empNo);
    }
  }

  get HasEmployeePermission() {
    const allowed = ['registrar', 'hr', 'hrm', 'admin'];
    return this.matchingRole(this.user.role.id, allowed);
  }

  private matchingRole(role, allowedRoles): boolean {
    return _.indexOf(allowedRoles, role) !== -1;
  }
}
