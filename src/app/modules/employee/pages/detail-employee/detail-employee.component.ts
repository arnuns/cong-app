import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { ActivatedRoute } from '@angular/router';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-detail-employee',
  templateUrl: './detail-employee.component.html',
  styleUrls: ['./detail-employee.component.scss']
})
export class DetailEmployeeComponent implements OnDestroy, OnInit {
  public defaultImagePath = environment.basePath;
  empNo: number;
  user: User;
  sub: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private electronService: ElectronService,
    private spinner: SpinnerHelper,
    private userService: UserService,
  ) {
    this.updateView();
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.empNo = Number(params['empNo']);
    });
  }

  ngOnInit() {
    this.initialData();
  }

  ngOnDestroy() {
    this.applicationStateService.setIsHiddenLeftMenu = false;
    this.applicationStateService.setIsHiddenSearch = false;
    this.applicationStateService.setIsHiddenTopMenu = false;
  }

  initialData() {
    this.spinner.showLoadingSpinner();
    this.userService.getUser(this.empNo).subscribe(user => {
      this.user = user;
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
}
