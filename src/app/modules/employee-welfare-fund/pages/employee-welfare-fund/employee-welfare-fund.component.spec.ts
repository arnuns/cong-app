import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import * as FileSaver from 'file-saver';
import { NEVER, of, throwError } from 'rxjs';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { EmployeeWelfareFundComponent } from './employee-welfare-fund.component';

describe('EmployeeWelfareFundComponent', () => {
  let component: EmployeeWelfareFundComponent;
  let fixture: ComponentFixture<EmployeeWelfareFundComponent>;
  let getEmployeeWelfareFundSummary: jasmine.Spy;
  let downloadEmployeeWelfareFundReport: jasmine.Spy;

  beforeEach(async(() => {
    getEmployeeWelfareFundSummary = jasmine.createSpy('getEmployeeWelfareFundSummary').and.returnValue(NEVER);
    downloadEmployeeWelfareFundReport = jasmine.createSpy('downloadEmployeeWelfareFundReport').and.returnValue(NEVER);
    TestBed.configureTestingModule({
      declarations: [EmployeeWelfareFundComponent],
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        BsDatepickerModule.forRoot(),
        NgSelectModule
      ],
      providers: [
        MomentHelper,
        {
          provide: PayrollService,
          useValue: {
            downloadEmployeeWelfareFundReport,
            getEmployeeWelfareFundSummary
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeWelfareFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the existing fund workflow in a dedicated full-page shell', () => {
    const pageText = fixture.nativeElement.textContent;

    expect(pageText).toContain('กองทุนสงเคราะห์ลูกจ้าง');
    expect(pageText).toContain('เดือนที่จ่าย');
    expect(pageText).not.toContain('บริษัท');
    expect(pageText).toContain('วันที่นำส่ง');
    expect(pageText).toContain('ดูสรุป');
    expect(pageText).toContain('ดาวน์โหลดแบบทางการ .xlsx');
  });

  it('starts with recent pay months and no company control', () => {
    expect(component.monthYears.length).toBe(6);
    expect(component.employeeWelfareFundForm.get('month_year').value).toBe(component.monthYears[0].viewValue);
    expect(component.employeeWelfareFundForm.get('company_id')).toBeNull();
  });

  it('loads and displays paid Employee Welfare Fund rows for the selected period and company', () => {
    getEmployeeWelfareFundSummary.and.returnValue(of([
      {
        empNo: 1001,
        companyId: 'GSF',
        companyName: 'GSF',
        title: 'นาย',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        identityNumber: '1234567890123',
        eligibleWage: 12000,
        employeeSavings: 60,
        employerContribution: 60,
        requiresReview: true
      }
    ]));
    component.employeeWelfareFundForm.patchValue({
      month_year: '2026-10'
    });

    component.onLoadEmployeeWelfareFund();
    fixture.detectChanges();

    expect(getEmployeeWelfareFundSummary).toHaveBeenCalledWith(2026, 10, 'GSF');
    expect(fixture.nativeElement.textContent).toContain('สมชาย ใจดี');
    expect(fixture.nativeElement.textContent).toContain('ต้องตรวจสอบ');
  });

  it('shows the API error and clears stale rows when the summary cannot be loaded', () => {
    component.employeeWelfareFundRows = [{ empNo: 1001 } as any];
    getEmployeeWelfareFundSummary.and.returnValue(throwError({ error: 'ไม่พบรอบเงินเดือน' }));

    component.onLoadEmployeeWelfareFund();
    fixture.detectChanges();

    expect(component.employeeWelfareFundRows).toEqual([]);
    expect(component.employeeWelfareFundProcessing).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('ไม่พบรอบเงินเดือน');
  });

  it('downloads the official workbook for the selected submission details', () => {
    const workbook = new Blob(['workbook']);
    const saveAs = spyOn(FileSaver, 'saveAs');
    downloadEmployeeWelfareFundReport.and.returnValue(of(workbook));
    component.employeeWelfareFundForm.patchValue({
      month_year: '2026-10',
      submission_date: new Date(2026, 10, 15)
    });

    component.onExportEmployeeWelfareFund();

    expect(downloadEmployeeWelfareFundReport).toHaveBeenCalledWith(2026, 10, 'GSF', '2026-11-15');
    expect(saveAs).toHaveBeenCalledWith(workbook, 'employee-welfare-fund-GSF-2026-10.xlsx');
    expect(component.employeeWelfareFundProcessing).toBe(false);
  });

  it('explains when the official workbook cannot be downloaded', () => {
    downloadEmployeeWelfareFundReport.and.returnValue(throwError({ status: 400 }));

    component.onExportEmployeeWelfareFund();
    fixture.detectChanges();

    expect(component.employeeWelfareFundProcessing).toBe(false);
    expect(fixture.nativeElement.textContent)
      .toContain('ไม่สามารถดาวน์โหลดไฟล์กองทุนได้ กรุณาตรวจข้อมูลพนักงานในรายงาน');
  });
});
