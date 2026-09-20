import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { Company } from 'src/app/core/models/company';
import { EmployeeWelfareFundSummary } from 'src/app/core/models/payroll';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-employee-welfare-fund',
  templateUrl: './employee-welfare-fund.component.html',
  styleUrls: ['./employee-welfare-fund.component.scss']
})
export class EmployeeWelfareFundComponent implements OnInit {
  companies: Company[] = [];
  employeeWelfareFundRows: EmployeeWelfareFundSummary[] = [];
  employeeWelfareFundProcessing = false;
  employeeWelfareFundError: string;
  monthYears: { view: string, viewValue: string }[] = [];

  employeeWelfareFundForm = this.fb.group({
    month_year: [undefined, [Validators.required]],
    company_id: [undefined, [Validators.required]],
    submission_date: [new Date(), [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private moment: MomentHelper,
    private payrollService: PayrollService,
    private userService: UserService) {
    this.initializePayMonths(new Date());
    this.employeeWelfareFundForm.patchValue({
      month_year: this.monthYears[0].viewValue
    });
  }

  ngOnInit() {
    this.userService.getUserCompanies().subscribe(companies => {
      this.companies = companies.filter(company => company.status);
      if (this.companies.length > 0) {
        this.employeeWelfareFundForm.patchValue({ company_id: this.companies[0].code });
      }
    });
  }

  private initializePayMonths(currentDate: Date) {
    for (let index = 0; index < 6; index++) {
      const payMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - index, 1);
      this.monthYears.push({
        view: this.moment.format(payMonth, 'MM/YYYY'),
        viewValue: this.moment.format(payMonth, 'YYYY-MM')
      });
    }
  }

  onLoadEmployeeWelfareFund() {
    const request = this.prepareRequest();
    if (!request) { return; }
    this.payrollService.getEmployeeWelfareFundSummary(request.year, request.month, request.companyId)
      .subscribe(rows => {
        this.employeeWelfareFundRows = rows;
        this.employeeWelfareFundProcessing = false;
      }, error => {
        this.employeeWelfareFundRows = [];
        this.employeeWelfareFundError = error.error || 'ไม่สามารถโหลดรายงานกองทุนได้';
        this.employeeWelfareFundProcessing = false;
      });
  }

  onExportEmployeeWelfareFund() {
    const request = this.prepareRequest();
    if (!request) { return; }
    const submissionDate = this.moment.format(
      this.employeeWelfareFundForm.get('submission_date').value, 'YYYY-MM-DD');
    this.payrollService.downloadEmployeeWelfareFundReport(
      request.year, request.month, request.companyId, submissionDate)
      .subscribe(file => {
        FileSaver.saveAs(
          file,
          `employee-welfare-fund-${request.companyId}-${request.year}-${request.monthText}.xlsx`);
        this.employeeWelfareFundProcessing = false;
      }, _ => {
        this.employeeWelfareFundError = 'ไม่สามารถดาวน์โหลดไฟล์กองทุนได้ กรุณาตรวจข้อมูลพนักงานในรายงาน';
        this.employeeWelfareFundProcessing = false;
      });
  }

  private prepareRequest() {
    if (this.employeeWelfareFundForm.invalid) { return undefined; }
    const period = this.employeeWelfareFundForm.get('month_year').value.split('-');
    this.employeeWelfareFundProcessing = true;
    this.employeeWelfareFundError = undefined;
    return {
      year: Number(period[0]),
      month: Number(period[1]),
      monthText: period[1],
      companyId: this.employeeWelfareFundForm.get('company_id').value
    };
  }
}
