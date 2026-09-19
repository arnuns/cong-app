import {FormBuilder} from '@angular/forms';
import {EMPTY, of} from 'rxjs';
import {SalaryComponent} from './salary.component';
import {Salary, PayrollCycle} from 'src/app/core/models/payroll';
import {Site} from 'src/app/core/models/site';

describe('SalaryComponent EWF compensation classification', () => {
  let component: SalaryComponent;
  let payroll: any;
  let close: jasmine.Spy;

  beforeEach(() => {
    payroll = jasmine.createSpyObj('PayrollService', ['addSalary', 'updateSalary', 'getSiteSalary']);
    payroll.addSalary.and.returnValue(EMPTY);
    payroll.updateSalary.and.returnValue(EMPTY);
    payroll.getSiteSalary.and.returnValue(of([]));
    close = jasmine.createSpy('close');
    const spinner = jasmine.createSpyObj('SpinnerHelper', ['showLoadingSpinner', 'hideLoadingSpinner']);
    component = new SalaryComponent(
      {params: of({id: 1, siteid: 1})} as any, {} as any, {} as any, new FormBuilder(),
      {getModal: () => ({open: () => {}, close})} as any, payroll, spinner, {} as any, {} as any);
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

  [null, '', '-0.01', '1000.01', '0.001'].forEach(portion => {
    it('blocks saving an invalid/unclassified portion: ' + portion, () => {
      component.updateSalaryForm.patchValue({ewf_eligible_income_compensation: portion});
      expect(component.updateSalaryForm.invalid).toBe(true);
      component.onSubmit();
      expect(payroll.addSalary).not.toHaveBeenCalled();
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
});
