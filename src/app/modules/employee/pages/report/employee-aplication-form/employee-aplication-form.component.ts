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
  thaiMonth = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม',
    'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน',
    'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  equipments = [
    {sort_no_left: 1, description_left: 'เสื้อยืดคอกลม สีดำ ไซส์..................', qty_left: null, price_left: 130, sort_no_right: 27, description_right: 'หมวกหม้อตาล ขาว ไซส์..................', qty_right: null, price_right: 420},
    {sort_no_left: 2, description_left: 'เสื้อยืดคอกลม สีขาว ไซส์..................', qty_left: null, price_left: 130, sort_no_right: 28, description_right: 'หมวกหม้อตาล กรม ไซส์..................', qty_right: null, price_right: 420},
    {sort_no_left: 3, description_left: 'เสื้อเชิ้ตแขนสั้น ไซส์..................', qty_left: null, price_left: 520, sort_no_right: 29, description_right: 'หมวกหม้อตาลมีช่อ ขาว ไซส์..................', qty_right: null, price_right: 500},
    {sort_no_left: 4, description_left: 'เสื้อสูท HP / BOT ไซส์..................', qty_left: null, price_left: 800, sort_no_right: 30, description_right: 'หมวกหม้อตาลมีช่อ กรม ไซส์..................', qty_right: null, price_right: 500},
    {sort_no_left: 5, description_left: 'เสื้อโปโล สีเทา ไซส์​..................', qty_left: null, price_left: 400, sort_no_right: 31, description_right: 'เสื้อเชิ้ตแขนยาว แสนสิริ ไซส์..................', qty_right: null, price_right: 300},
    {sort_no_left: 6, description_left: 'เสื้อโปโล สีกรม ไซส์​..................', qty_left: null, price_left: 400, sort_no_right: 32, description_right: 'กางเกงสีกรม แสนสิริ ไซส์..................', qty_right: null, price_right: 1000},
    {sort_no_left: 7, description_left: 'เสื้อซาฟารี ไซส์..................', qty_left: null, price_left: 550, sort_no_right: 33, description_right: 'เสื้อจราจร สีดำ AP', qty_right: null, price_right: 300},
    {sort_no_left: 8, description_left: 'เสื้อราชปะแตน สีขาว ไซส์..................', qty_left: null, price_left: 680, sort_no_right: 34, description_right: 'เสื้อจราจร สีดำ GSAFE', qty_right: null, price_right: 300},
    {sort_no_left: 9, description_left: 'เสื้อราชปะแตนมีอินธนู สีขาว ไซส์..........', qty_left: null, price_left: 680, sort_no_right: 35, description_right: 'เสื้อจราจร สีส้ม สกรีน GSF', qty_right: null, price_right: 480},
    {sort_no_left: 10, description_left: 'กางเกงราชปะแตน สีขาว ไซส์................', qty_left: null, price_left: 380, sort_no_right: 36, description_right: 'เสื้อกันฝนแบบแยกส่วน', qty_right: null, price_right: 500},
    {sort_no_left: 11, description_left: 'เสื้อราชปะแตน สีกรม ไซส์..................', qty_left: null, price_left: 680, sort_no_right: 37, description_right: 'กระบองไฟ แบบชาร์จ', qty_right: null, price_right: 300},
    {sort_no_left: 12, description_left: 'กางเกงราชปะแตน สีกรม ไซส์..........', qty_left: null, price_left: 380, sort_no_right: 38, description_right: 'ไฟฉายสปอร์ตไลท์', qty_right: null, price_right: 350},
    {sort_no_left: 13, description_left: 'กางเกงขายาวสีดำ ไซส์..................', qty_left: null, price_left: 380, sort_no_right: 39, description_right: 'วิทยุ Zignal', qty_right: null, price_right: 1700},
    {sort_no_left: 14, description_left: 'กางเกงประเป๋าข้าง ไซส์..................', qty_left: null, price_left: 500, sort_no_right: 40, description_right: 'วิทยุ Italk', qty_right: null, price_right: 2000},
    {sort_no_left: 15, description_left: 'เสื้อการ์ด', qty_left: null, price_left: 550, sort_no_right: 41, description_right: 'แบตเตอรี่', qty_right: null, price_right: 850},
    {sort_no_left: 16, description_left: 'เข็มขัดหนัง', qty_left: null, price_left: 180, sort_no_right: 42, description_right: 'แท่นชาร์จ', qty_right: null, price_right: 550},
    {sort_no_left: 17, description_left: 'เนคไท', qty_left: null, price_left: 200, sort_no_right: 43, description_right: 'ป้ายชื่อ', qty_right: null, price_right: 200},
    {sort_no_left: 18, description_left: 'อินธนู', qty_left: null, price_left: 165, sort_no_right: 44, description_right: 'ป้าย Security', qty_right: null, price_right: 200},
    {sort_no_left: 19, description_left: 'นกหวีดพร้อมสาย', qty_left: null, price_left: 65, sort_no_right: 45, description_right: 'ป้าย Supervisor', qty_right: null, price_right: 200},
    {sort_no_left: 20, description_left: 'อาร์มคู่ละ(โลโก้)', qty_left: null, price_left: 70, sort_no_right: 46, description_right: 'บัตรพนักงาน', qty_right: null, price_right: 200},
    {sort_no_left: 21, description_left: 'รองเท้าจังเกิ้ล ไซส์..................', qty_left: null, price_left: 700, sort_no_right: 47, description_right: 'เข็มกลัดใบอนุญาต', qty_right: null, price_right: 200},
    {sort_no_left: 22, description_left: 'รองเท้าบูท', qty_left: null, price_left: 200, sort_no_right: 48, description_right: 'ชุดตรวจสารเสพติด', qty_right: null, price_right: 0},
    {sort_no_left: 23, description_left: 'รองเท้าเซฟตี้ ไซส์..................', qty_left: null, price_left: 700, sort_no_right: 49, description_right: '', qty_right: null, price_right: 0},
    {sort_no_left: 24, description_left: 'รองเท้าหนัง ไซส์..................', qty_left: null, price_left: 700, sort_no_right: 50, description_right: '', qty_right: null, price_right: 0},
    {sort_no_left: 25, description_left: 'หมวกแก็ป Security', qty_left: null, price_left: 200, sort_no_right: 51, description_right: '', qty_right: null, price_right: 0},
    {sort_no_left: 26, description_left: 'หมวกแก็ปครูฝึก', qty_left: null, price_left: 200, sort_no_right: 52, description_right: '', qty_right: null, price_right: 0},
  ];

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
          setTimeout(() => this.electronService.ipcRenderer.send('print-to-pdf'), 1500);
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

  checkIsLongName(user: User): boolean {
    let stringLength = 0;
    if (user) {
      stringLength += user.firstName.length;
      stringLength += user.lastName.length;
    }
    return stringLength > 24;
  }

  signatureName(user: User): string {
    if (!user) return '';
    return `${user.title}${user.firstName} ${user.lastName}`;
  }

  getJobHistory(sequence: number): JobHistory {
    if (!this.user || this.user.jobHistories.length <= 0) return null;
    return this.user.jobHistories.filter(j => j.seq === sequence)[0];
  }

  spaceIfNull(text: string): string {
    return text || '&nbsp;';
  }

  thaiYearString(): string {
    const date = new Date();
    return `${date.getFullYear() + 543}`;
   }

  toThaiDateString(date: Date): string {
    if (!date) { return '' };
    date = new Date(date);
    return date ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}` : '';
  }

  convertToDateString(d: Date): string {
    const date = new Date(d);
    return `${date.getDate()} ${this.thaiMonth[date.getMonth()]} ${date.getFullYear() + 543}`;
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

  toDayOfMonth(date: Date): number {
    date = new Date(date);
    return date.getDate();
  }

  toThaiMonth(date: Date): string {
    date = new Date(date);
    return this.thaiMonth[date.getMonth()];
  }

  toThaiYear(date: Date): string {
    date = new Date(date);
    return `${date.getFullYear() + 543}`;
  }

}
