import {fakeAsync, tick} from '@angular/core/testing';
import {FormBuilder} from '@angular/forms';
import {EMPTY, of, Subject, throwError} from 'rxjs';
import {SalaryComponent} from './salary.component';
import {Salary, PayrollCycle} from 'src/app/core/models/payroll';
import {Site} from 'src/app/core/models/site';

describe('SalaryComponent EWF compensation classification', () => {
  let component: SalaryComponent;
  let payroll: any;
  let close: jasmine.Spy;
  let modalEvents: {onOpen: Subject<Event>; onClose: Subject<Event>};

  beforeEach(() => {
    payroll = jasmine.createSpyObj('PayrollService', [
      'addSalary', 'updateSalary', 'getSiteSalary', 'previewEmployeeWelfareFund'
    ]);
    payroll.addSalary.and.returnValue(EMPTY);
    payroll.updateSalary.and.returnValue(EMPTY);
    payroll.getSiteSalary.and.returnValue(of([]));
    payroll.previewEmployeeWelfareFund.and.returnValue(of({
      eligibleWage: 0, rate: 0.0025, employeeRate: 0.0025, employerRate: 0.0025,
      employeeSavings: 0, employerContribution: 0, requiresReview: false
    }));
    close = jasmine.createSpy('close');
    modalEvents = {onOpen: new Subject<Event>(), onClose: new Subject<Event>()};
    const spinner = jasmine.createSpyObj('SpinnerHelper', ['showLoadingSpinner', 'hideLoadingSpinner']);
    component = new SalaryComponent(
      {params: of({id: 1, siteid: 1})} as any, {} as any, {} as any, new FormBuilder(),
      {getModal: () => ({open: () => {}, close, ...modalEvents})} as any, payroll, spinner, {} as any, {} as any);
    component.site = {id: 1, code: 'A', name: 'Primary', minimumWage: 400, siteUserPositions: []} as Site;
    component.payrollCycle = {
      id: 1, start: '2026-10-01T00:00:00', end: '2026-10-15T00:00:00',
      isMonthly: false, createOn: new Date(2026, 8, 19), createBy: 'Test'
    } as PayrollCycle;
    component.updateSalaryForm.patchValue({
      empno: 7, user_position_id: 20, idcard_no: '0000000000001', firstname: 'Test', lastname: 'Employee',
      bank_id: 1, bank_account: '123', income_compensation: '1000.00'
    });
  });

  it('defaults eligible income compensation to zero for a new salary', () => {
    expect(component.updateSalaryForm.get('ewf_eligible_income_compensation').value).toBe(0);
  });

  it('resets eligible income compensation to zero when the salary modal closes', fakeAsync(() => {
    component.ngAfterViewInit();
    component.updateSalaryForm.get('ewf_eligible_income_compensation').setValue(600);

    modalEvents.onClose.next(new Event('close'));

    expect(component.updateSalaryForm.get('ewf_eligible_income_compensation').value).toBe(0);
    tick(1000);
  }));

  ['-0.01', '1000.01', '0.001'].forEach(portion => {
    it('blocks saving an invalid/unclassified portion: ' + portion, () => {
      component.updateSalaryForm.patchValue({ewf_eligible_income_compensation: portion});
      expect(component.updateSalaryForm.invalid).toBe(true);
      component.onSubmit();
      expect(payroll.addSalary).not.toHaveBeenCalled();
    });
  });

  [null, ''].forEach(portion => {
    it('does not hardcode the database activation schedule for an unclassified portion: ' + portion, () => {
      component.payrollCycle.end = '2035-01-15T00:00:00';
      component.updateSalaryForm.patchValue({ewf_eligible_income_compensation: portion});

      expect(component.updateSalaryForm.valid).toBe(true);
      component.onSubmit();
      expect(payroll.addSalary).toHaveBeenCalled();
    });
  });

  [0, 600, 1000].forEach(portion => {
    it('sends an explicit eligible portion without adding income twice: ' + portion, () => {
      component.updateSalaryForm.patchValue({ewf_eligible_income_compensation: portion});
      expect(component.updateSalaryForm.valid).toBe(true);
      expect(component.totalIncome).toBe(1000);
      component.onSubmit();
      const payload: Salary = payroll.addSalary.calls.mostRecent().args[2];
      expect((payload as any).ewfEligibleIncomeCompensation).toBe(portion);
      expect(Number(payload.incomeCompensation)).toBe(1000);
    });
  });

  it('does not silently convert unclassified historical amounts to zero', () => {
    component.payrollCycle.end = '2026-09-30T00:00:00';
    component.updateSalaryForm.patchValue({ewf_eligible_income_compensation: null, salary_id: 1});
    expect(component.updateSalaryForm.valid).toBe(true);
    component.onSubmit();
    expect(payroll.updateSalary.calls.mostRecent().args[2].ewfEligibleIncomeCompensation).toBeNull();
  });

  it('revalidates the portion when HR lowers the total compensation', () => {
    component.updateSalaryForm.patchValue({ewf_eligible_income_compensation: 600});
    expect(component.updateSalaryForm.valid).toBe(true);
    component.updateSalaryForm.get('income_compensation').setValue(500);
    expect(component.updateSalaryForm.invalid).toBe(true);
  });

  it('does not require a classification when there is no compensation', () => {
    component.updateSalaryForm.patchValue({income_compensation: '0.00', ewf_eligible_income_compensation: null});
    expect(component.updateSalaryForm.valid).toBe(true);
  });

  it('refreshes the authoritative preview when HR edits a site working day', fakeAsync(() => {
    component.updateSalaryForm.patchValue({ewf_eligible_income_compensation: 0});
    component.ngAfterViewInit();
    component.addSite();
    tick(351);
    payroll.previewEmployeeWelfareFund.calls.reset();

    component.siteForms.at(0).get('manday').setValue(16);
    tick(351);

    expect(payroll.previewEmployeeWelfareFund).toHaveBeenCalledTimes(1);
    const payload = payroll.previewEmployeeWelfareFund.calls.mostRecent().args[3];
    expect(payload.siteSalaries[0].manday).toBe(16);
  }));

  it('stores separate employee and employer rates from the authoritative preview', fakeAsync(() => {
    payroll.previewEmployeeWelfareFund.and.returnValue(of({
      eligibleWage: 6400, rate: 0.0025, employeeRate: 0.0025, employerRate: 0.005,
      employeeSavings: 16, employerContribution: 32, requiresReview: false
    }));
    component.updateSalaryForm.patchValue({ewf_eligible_income_compensation: 0});
    component.ngAfterViewInit();
    component.addSite();
    component.siteForms.at(0).get('manday').setValue(16);
    tick(351);

    expect(component.updateSalaryForm.get('ewf_employee_rate').value).toBe(0.0025);
    expect(component.updateSalaryForm.get('ewf_employer_rate').value).toBe(0.005);
  }));

  it('surfaces backend schedule errors from the authoritative preview', fakeAsync(() => {
    payroll.previewEmployeeWelfareFund.and.returnValue(throwError({
      error: 'Employee Welfare Fund rate schedule is empty.'
    }));
    component.updateSalaryForm.patchValue({ewf_eligible_income_compensation: 0});
    component.ngAfterViewInit();
    component.addSite();
    component.siteForms.at(0).get('manday').setValue(16);
    tick(351);

    expect(component.ewfPreviewError).toContain('rate schedule is empty');
  }));
});
