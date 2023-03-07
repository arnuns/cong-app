import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { User } from 'src/app/core/models/user';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { UserService } from 'src/app/core/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-employee-certificate',
  templateUrl: './employee-certificate.component.html',
  styleUrls: ['./employee-certificate.component.scss']
})
export class EmployeeCertificateComponent implements OnInit {
  public baseImagePath = environment.basePath;
  certificateNo: string = '๖๒๕๖๗๗๙';
  empNo: number;
  user: User;
  numbArabicMapping: { num: string, arabic: string }[] = [
    {num: '1', arabic: '๑'},
    {num: '2', arabic: '๒'},
    {num: '3', arabic: '๓'},
    {num: '4', arabic: '๔'},
    {num: '5', arabic: '๕'},
    {num: '6', arabic: '๖'},
    {num: '7', arabic: '๗'},
    {num: '8', arabic: '๘'},
    {num: '9', arabic: '๙'},
    {num: '0', arabic: '๐'}
  ];
  thaiMonth = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม',
    'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน',
    'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  constructor(
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private electronService: ElectronService,
    private spinner: SpinnerHelper,
    private userService: UserService) {
    document.body.style.backgroundColor = '#ffffff';
    this.updateView();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.empNo = Number(params['empNo']);
      this.spinner.showLoadingSpinner();
      this.userService.getUser(this.empNo).subscribe(user => {
        this.user = user;
        this.spinner.hideLoadingSpinner(0);
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      }, () => {
        if (this.electronService.isElectronApp) {
          setTimeout(() => this.electronService.ipcRenderer.send('print-to-pdf-landscape'), 1000);
        }
      });
    });
  }

  convertNumberToArabic(str) {
    let result = '';
    if (str) {
      str = String(str);
      for (let i = 0; i < str.length; i++) {
        if (this.numbArabicMapping.filter(m => m.num === str.charAt(i)).length > 0) {
          result = result + this.numbArabicMapping.filter(m => m.num === str.charAt(i))[0].arabic;
        } else {
          result = result + str.charAt(i);
        }
      }
    } else {
      result = 'ไม่มีข้อมูล';
    }
    return result;
  }

  convertDateToThaiArabicDate(date: Date): string {
    let str = '';
    if (date) {
      date = new Date(date);
      str = `วันที่ ${this.convertNumberToArabic(date.getDate())} เดือน ${this.thaiMonth[date.getMonth()]} พุทธศักราช ${date.getFullYear() + 543}`;
    } else {
      str = 'ไม่มีข้อมูล';
    }
    return str;
  }

  updateView(): void {
    this.applicationStateService.setIsHiddenLeftMenu = true;
    this.applicationStateService.setIsHiddenSearch = true;
    this.applicationStateService.setIsHiddenTopMenu = true;
  }
}