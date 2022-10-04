import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { UserService } from 'src/app/core/services/user.service';
import { JobHistory, LanguageAbility, User } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-employee-aplication-form',
  templateUrl: './employee-aplication-form.component.html',
  styleUrls: ['./employee-aplication-form.component.scss']
})
export class EmployeeAplicationFormComponent implements OnDestroy, OnInit {
  public baseImagePath = environment.basePath;
  user: User;
  empNo: number;
  empNoString = '';
  birthDateString: string;
  age: number;
  currentDate = new Date();
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

  // const languageAbilityTh = this.user.languageAbilities.filter(l => l.language === 'Thai')[0];
  // const languageAbilityEn = this.user.languageAbilities.filter(l => l.language === 'English')[0];

  getLanguageAbility(lang: string, ability: string): string {
    let result = '&nbsp;';
    if (!this.user || this.user.languageAbilities.length <= 0) return result;
    const languageAbility = this.user.languageAbilities.filter(f => f.language === lang)[0];
    if (languageAbility) {
      switch (ability) {
        case 'read':
          const abilityRead = Number(languageAbility.read);
          result = abilityRead === 3 ? 'ดีมาก' : (abilityRead === 2 ? 'ดี' : 'พอใช้');
          break;
        case 'write':
          const abilityWrite = Number(languageAbility.write);
          result = abilityWrite === 3 ? 'ดีมาก' : (abilityWrite === 2 ? 'ดี' : 'พอใช้');
          break;
        default:
          const abilityConversation = Number(languageAbility.conversation);
          result = abilityConversation === 3 ? 'ดีมาก' : (abilityConversation === 2 ? 'ดี' : 'พอใช้');
          break;
      }
    }
    return result;
  }

  getJobHistory(sequence: number): JobHistory {
    if (!this.user || this.user.jobHistories.length <= 0) return null;
    return this.user.jobHistories.filter(j => j.seq === sequence)[0];
  }

  spaceIfNull(text: string): string {
    return text || '&nbsp;';
  }

  toThaiDateString(date: Date): string {
    if (!date) { return '' };
    date = new Date(date);
    return date ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}` : '';
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
