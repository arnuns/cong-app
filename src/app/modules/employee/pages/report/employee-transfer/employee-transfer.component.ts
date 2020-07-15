import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { ElectronService } from 'ngx-electron';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { UserService } from 'src/app/core/services/user.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-employee-transfer',
  templateUrl: './employee-transfer.component.html',
  styleUrls: ['./employee-transfer.component.scss']
})
export class EmployeeTransferComponent implements OnDestroy, OnInit {
  public baseImagePath = environment.basePath;
  user: User;
  empNo: number;
  empNoString = '';
  birthDateString: string;
  age: number;
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private sanitizer: DomSanitizer,
    private electronService: ElectronService,
    private spinner: SpinnerHelper,
    private userService: UserService) {
    document.body.style.backgroundColor = '#ffffff';
    this.updateView();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.empNoString = params['empNo'];
      this.empNo = Number(this.empNoString);
      this.spinner.showLoadingSpinner();
      this.userService.getUser(this.empNo).subscribe(user => {
        this.user = user;
        this.birthDateString = this.convertToBirthdateString(new Date(this.user.birthdate));
        this.age = this.convertToAge(new Date(this.user.birthdate));
        this.spinner.hideLoadingSpinner(0);
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      }, () => {
        if (this.electronService.isElectronApp) {
          setTimeout(() => this.electronService.ipcRenderer.send('print-to-pdf'), 1000);
        }
      });
    });
  }

  getImageProfileSanitize(imageProfile: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`url(${imageProfile})`);
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

  convertToBirthdateString(birthdate: Date): string {
    if (!birthdate) {
      return '';
    }
    const thaiMonth = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม',
      'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน',
      'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const birthDate = new Date(this.user.birthdate);
    return `${birthDate.getDate()} ${thaiMonth[birthDate.getMonth()]} ${birthDate.getFullYear() + 543}`;
  }

  convertToAge(birthdate: Date): number {
    if (!birthdate) {
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

}
