import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user';
import { FormBuilder, Validators } from '@angular/forms';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { combineLatest } from 'rxjs';
import { Papa } from 'ngx-papaparse';
import * as FileSaver from 'file-saver';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';

@Component({
  selector: 'app-employee-report',
  templateUrl: './employee-report.component.html',
  styleUrls: ['./employee-report.component.scss']
})
export class EmployeeReportComponent implements OnInit {
  lastMonthUsers: User[] = [];
  compareMonthUsers: User[] = [];
  monthYears: {
    view: string,
    viewValue: string
  }[] = [];

  empInRateReportForm = this.fb.group({
    month_year: [undefined, [Validators.required]]
  });
  empInRateReportProcessing = false;
  empInRateReport: {
    before: number,
    after: number
  } = {
      before: 0,
      after: 0
    };

  empInOutReportForm = this.fb.group({
    date_range: [null, [Validators.required]]
  });
  empInOutReportProcessing = false;
  empInOutReport: {
    data: User[],
    begin: User[],
    resign: User[]
  } = {
      data: [],
      begin: [],
      resign: []
    };
  constructor(
    private fb: FormBuilder,
    private moment: MomentHelper,
    private papa: Papa,
    private spinner: SpinnerHelper,
    private userService: UserService) {
    const date = new Date();
    this.initialControlEmpInReport(new Date(date.getFullYear(), date.getMonth() - 1, 1, 7, 0, 0));
    this.empInRateReportForm.patchValue({
      month_year: this.monthYears[0].viewValue
    });
    this.empInOutReportForm.patchValue({
      date_range:
        [new Date(date.getFullYear(), date.getMonth() - 1, 1, 7, 0, 0), new Date(date.getFullYear(), date.getMonth(), 0, 7, 0, 0)]
    });
  }

  ngOnInit() {
    const monthYear: string = this.monthYears[0].viewValue;
    const monthYearArray = monthYear.split('-');
    const dateRange: Date[] = this.empInOutReportForm.get('date_range').value;
    Promise.all(
      [
        this.getCountEmployeeByMonthYear(Number(monthYearArray[1]), Number(monthYearArray[0])),
        this.getEmployeeByDateRange(dateRange[0], dateRange[1])]
    ).then(_ => {
      console.log('report loaded successfully.');
    });
  }

  initialControlEmpInReport(date: Date) {
    const selectDate = date;
    for (let index = 0; index < 6; index++) {
      this.monthYears.push({
        view: this.moment.format(selectDate, 'MM/YYYY'),
        viewValue: this.moment.format(selectDate, 'YYYY-MM')
      });
      let decreaseMonth = selectDate.getMonth() - 1;
      if (decreaseMonth === 0) {
        decreaseMonth = 12;
        selectDate.setFullYear(selectDate.getFullYear() - 1);
        selectDate.setMonth(decreaseMonth);
      } else {
        selectDate.setMonth(decreaseMonth);
      }
    }
  }

  getCountEmployeeByMonthYear(month: number, year: number) {
    this.empInRateReportProcessing = true;
    let afterMonth = month - 1;
    let afterYear = year;
    if (afterMonth === 0) {
      afterYear--;
      afterMonth = 12;
    }
    combineLatest(
      [
        this.userService.getCountUserByMonthYear(afterMonth, afterYear),
        this.userService.getCountUserByMonthYear(month, year)
      ]).subscribe(results => {
        this.empInRateReport = {
          before: results[0],
          after: results[1],
        };
        this.empInRateReportProcessing = false;
      }, error => {
        console.log(error);
        this.empInRateReportProcessing = false;
      });
  }

  getEmployeeByDateRange(startDate: Date, endDate: Date) {
    const that = this;
    const dateFormat = 'YYYY-MM-DD';
    this.empInOutReportProcessing = true;
    function toDateQuery(date: Date) { return that.moment.format(date, dateFormat); }
    const queryStartDate = toDateQuery(startDate);
    const queryEndDate = toDateQuery(endDate);
    this.userService.getUserByDateRange(toDateQuery(startDate), toDateQuery(endDate))
      .subscribe(users => {
        const rangeStart = this.moment.toDate(queryStartDate, dateFormat);
        const rangeEnd = this.moment.toDate(queryEndDate, dateFormat);
        this.empInOutReport = {
          data: users,
          begin: users.filter(u => {
            const registerOn = u.registerOn ? new Date(u.registerOn) : undefined;
            return registerOn && registerOn.getTime() >= rangeStart.getTime() && registerOn.getTime() <= rangeEnd.getTime();
          }),
          resign: users.filter(u => {
            const resignOn = u.endDate ? new Date(u.endDate) : undefined;
            return resignOn && resignOn.getTime() >= rangeStart.getTime() && resignOn.getTime() <= rangeEnd.getTime();
          })
        };
        this.empInOutReportProcessing = false;
      }, error => {
        console.log(error);
        this.empInOutReportProcessing = false;
      });
  }

  findPercentage(val, total) {
    return Math.round((100 / total) * val) || 0;
  }

  increasePercentage(before, after) {
    return (Math.round((100 / before) * after) - 100) || 0;
  }

  get overallBeginResign() {
    if (!this.empInOutReport) { return 0; }
    return this.empInOutReport.begin.length + this.empInOutReport.resign.length;
  }

  onSubmitEmpInOut() {
    const dateRange: Date[] = this.empInOutReportForm.get('date_range').value;
    this.getEmployeeByDateRange(dateRange[0], dateRange[1]);
  }

  onSubmitEmpInRate() {
    const monthYear: string = this.empInRateReportForm.get('month_year').value;
    const monthYearArray = monthYear.split('-');
    this.getCountEmployeeByMonthYear(Number(monthYearArray[1]), Number(monthYearArray[0]));
  }

  onExportEmpInOut() {
    this.spinner.showLoadingSpinner();
    const data = this.empInOutReport.data.map(u => ({
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
      'วันเกิด': !u.birthdate ? '' : this.convertToDateString(u.birthdate),
      'น้ำหนัก': u.weight && u.weight > 0 ? u.weight : '',
      'ส่วนสูง': u.height && u.height > 0 ? u.height : '',
      'เชื้อชาติ': u.ethnicity,
      'สัญชาติ': u.nationality,
      'ศาสนา': u.religion,
      'ที่อยู่ตามทะเบียนบ้าน': u.permanentAddress,
      'ที่อยู่ปัจจุบัน': u.currentAddress,
      'วันที่สมัคร': !u.registerOn ? '' : this.convertToDateString(u.registerOn),
      'วันเริ่มงาน': !u.startDate ? '' : this.convertToDateString(u.startDate),
      'วันที่ลาออก': !u.endDate ? '' : this.convertToDateString(u.endDate),
      'สาเหตุที่ออก': u.resignationCause,
      'กรณีฉุกเฉินบุคคลที่ติดต่อได้': u.refName_1 ? u.refName_1 : '',
      'ความสัมพันธ์ผู้ติดต่อ': u.refRelation_1 ? u.refRelation_1 : '',
      'เบอร์โทรศัพท์ผู้ติดต่อ': u.refPhoneNo_1 ? u.refPhoneNo_1 : '',
      'ที่อยู่ผู้ติดต่อ': u.refAddress_1 ? u.refAddress_1 : ''
    }));
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + this.papa.unparse(data)], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, `employee_inout_${this.moment.format(new Date(), 'YYYYMMDDHHmmss')}.csv`);
    this.spinner.hideLoadingSpinner();
  }

  onExportEmployeeByMonth() {
    const monthYear: string = this.empInRateReportForm.get('month_year').value;
    const monthYearArray = monthYear.split('-');
    this.userService.getUserByMonthYear(Number(monthYearArray[1]), Number(monthYearArray[0])).subscribe(users => {
      const data = users.map(u => ({
        'รหัสพนักงาน': `'${u.empNo}`,
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
        'วันเกิด': !u.birthdate ? '' : this.convertToThaiDateString(u.birthdate),
        'อายุ': !u.birthdate ? '' : this.convertToAge(u.birthdate),
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
        'อายุงาน (วัน)': !u.startDate ? '' : this.dateDiff(u.startDate),
        'สาเหตุที่ออก': u.resignationCause,
        'กรณีฉุกเฉินบุคคลที่ติดต่อได้': u.refName_1 ? u.refName_1 : '',
        'ความสัมพันธ์ผู้ติดต่อ': u.refRelation_1 ? u.refRelation_1 : '',
        'เบอร์โทรศัพท์ผู้ติดต่อ': u.refPhoneNo_1 ? u.refPhoneNo_1 : '',
        'ที่อยู่ผู้ติดต่อ': u.refAddress_1 ? u.refAddress_1 : '',
        'วันที่ยื่นเข้าประกันสังคม': !u.socialSecurityStartDate ? '' : this.convertToDateString(u.socialSecurityStartDate),
        'วันที่ยื่นออกประกันสังคม': !u.socialSecurityEndDate ? '' : this.convertToDateString(u.socialSecurityEndDate),
        'สถานพยาบาลประกันสังคม': u.hospital ? u.hospital.name : '',
        'เลขที่ใบอนุญาต': u.licenseNo ? `'${u.licenseNo}`: '',
        'วันเริ่มต้นใบอนุญาต': !u.licenseStartDate ? '' : this.convertToDateString(u.licenseStartDate),
        'วันที่สิ้นสุดใบอนุญาต': !u.licenseEndDate ? '' : this.convertToDateString(u.licenseEndDate),
        'เลขที่หนังสือรับรองการฝึกอบรม': u.certificateNo ? `'${u.certificateNo}`: '',
        'ฝึกอบรมเมื่อวันที่': !u.certificateStartDate ? '' : this.convertToDateString(u.certificateStartDate),
        'ฝึกอบรมถึงวันที่': !u.certificateEndDate ? '' : this.convertToDateString(u.certificateEndDate),
      }));
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + this.papa.unparse(data)], { type: 'text/csv;charset=utf-8' });
      FileSaver.saveAs(blob, `employee_inout_${this.moment.format(new Date(), 'YYYYMMDDHHmmss')}.csv`);
      this.spinner.hideLoadingSpinner();
    }, error => {
      console.log(error);
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

  convertToThaiDateString(dateString: string): string {
    if (dateString === null || dateString === undefined || dateString === '') {
      return '';
    }
    function pad(s) { return (s < 10) ? '0' + s : s; }
    const d = new Date(dateString);
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear() + 543].join('/');
  }

  dateDiff(dateString: string): number {
    if (dateString === null || dateString === undefined || dateString === '') {
      return 0;
    }
    const date = new Date(dateString);
    const today = new Date();
    return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  }
}
