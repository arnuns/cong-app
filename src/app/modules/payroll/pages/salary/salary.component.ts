import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { combineLatest, Subject } from 'rxjs';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { PayrollCycle, Salary, SiteSalary, SitePayrollCycleSalary, SocialSecurityRate } from 'src/app/core/models/payroll';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { SiteService } from 'src/app/core/services/site.service';
import { Site } from 'src/app/core/models/site';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { User } from 'src/app/core/models/user';
import { UserService } from 'src/app/core/services/user.service';
import { AvailableBank } from 'src/app/core/models/available-bank.model';
import { IDCardNumber } from 'src/app/core/validators/idcard-no.validator';
import { ElectronService } from 'ngx-electron';

const thaiMonth = new Array('มกราคม', 'กุมภาพันธ์', 'มีนาคม',
  'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน',
  'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม');

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.scss']
})
export class SalaryComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false }) private datatableElement: DataTableDirective;

  searching = false;

  payrollCycleId: number;
  siteId: number;
  payrollCycle: PayrollCycle;
  sitePayrollCycleSalary: SitePayrollCycleSalary;
  socialSecurityRate: SocialSecurityRate;
  sites: Site[] = [];
  site: Site;
  salaries: Salary[] = [];
  salaryForm = this.fb.group({
    search: ['']
  });

  salaryEmployees: User[] = [];
  banks: AvailableBank[] = [];
  salarySites: Site[] = [];

  dtTrigger = new Subject();
  dtOptions: DataTables.Settings = {};

  suspendForm = this.fb.group({
    salary_id: [undefined],
    full_name: ['']
  });

  deleteForm = this.fb.group({
    salary_id: [undefined],
    full_name: ['']
  });

  deductionForm = this.fb.group({
    deduction: ['cremation_fee', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(1)]]
  });

  paidForm = this.fb.group({
    payday: [undefined, [Validators.required]]
  });

  hiringRatePerDay = '0.00';

  updateSalaryForm = this.fb.group({
    search: [''],
    salary_id: [undefined],
    empno: [0, [Validators.required]],
    role_id: ['', [Validators.required]],
    is_temporary: [false],
    idcard_no: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
    title: ['นาย', Validators.required],
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    bank_id: [undefined, [Validators.required]],
    bank_account: ['', [Validators.required]],
    site_search: [''],
    site_array: this.fb.array([]),
    position_value: ['0.00', [Validators.required, Validators.min(0)]],
    point_value: ['0.00', [Validators.required, Validators.min(0)]],
    is_overtime: [false],
    overtime: ['0.00', [Validators.required, Validators.min(0)]],
    is_annual_holiday: [false],
    annual_holiday: ['0.00', [Validators.required, Validators.min(0)]],
    is_telephone_charge: [false],
    telephone_charge: ['0.00', [Validators.required, Validators.min(0)]],
    is_refund: [false],
    refund: ['0.00', [Validators.required, Validators.min(0)]],
    is_duty_allowance: [false],
    duty_allowance: ['0.00', [Validators.required, Validators.min(0)]],
    is_bonus: [false],
    bonus: ['0.00', [Validators.required, Validators.min(0)]],
    is_other_income: [false],
    other_income: ['0.00', [Validators.required, Validators.min(0)]],
    income_other: [undefined],
    withholding_tax: ['0.00', [Validators.required, Validators.min(0)]],
    transfer_fee: ['0.00', [Validators.required, Validators.min(0)]],
    inventory: ['0.00', [Validators.required, Validators.min(0)]],
    is_discipline: [false],
    discipline: ['0.00', [Validators.required, Validators.min(0)]],
    is_license_fee: [false],
    license_fee: ['0.00', [Validators.required, Validators.min(0)]],
    is_advance: [false],
    advance: ['0.00', [Validators.required, Validators.min(0)]],
    is_absence: [false],
    absence: ['0.00', [Validators.required, Validators.min(0)]],
    is_cremation_fee: [false],
    cremation_fee: ['0.00', [Validators.required, Validators.min(0)]],
    is_rent_house: [false],
    rent_house: ['0.00', [Validators.required, Validators.min(0)]],
    is_other: [false],
    other: ['0.00', [Validators.required, Validators.min(0)]],
    fee_other: [undefined],
    is_social_security: [true],
    remark: [''],
    is_complete: [false],
    is_suspend: [false],
    is_paid: [false]
  }, {
    validator: IDCardNumber('idcard_no')
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private electronService: ElectronService,
    private fb: FormBuilder,
    private ngxSmartModalService: NgxSmartModalService,
    private payrollService: PayrollService,
    private spinner: SpinnerHelper,
    private siteService: SiteService,
    private userService: UserService) {
    this.spinner.showLoadingSpinner();
    this.updateView();
    this.activatedRoute.params.subscribe(params => {
      this.payrollCycleId = params['id'];
      this.siteId = params['siteid'];
    });
  }

  ngOnInit() {
    this.searchFilter();
    this.initialTable();
    combineLatest(
      [
        this.payrollService.getPayrollCycle(this.payrollCycleId),
        this.siteService.getSite(this.siteId)
      ]
    ).subscribe(results => {
      this.payrollCycle = results[0];
      this.site = results[1];
      this.getSitePayrollCycleSalary(false);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  ngOnDestroy() {
    this.applicationStateService.setIsHiddenLeftMenu = false;
    this.applicationStateService.setIsHiddenSearch = false;
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  ngAfterViewInit() {
    this.salaryForm.get('search').valueChanges
      .pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
      });

    this.ngxSmartModalService.getModal('suspendModal').onClose.subscribe((event: Event) => {
      this.suspendForm.reset({
        salary_id: [undefined],
        full_name: ['']
      });
    });

    this.ngxSmartModalService.getModal('deleteModal').onClose.subscribe((event: Event) => {
      this.deleteForm.reset({
        salary_id: [undefined],
        full_name: ['']
      });
    });

    this.ngxSmartModalService.getModal('deductionModal').onClose.subscribe((event: Event) => {
      this.deductionForm.reset({
        deduction: 'cremation_fee',
        amount: 0
      });
    });

    this.ngxSmartModalService.getModal('salaryModal').onOpen.subscribe((event: Event) => {
      this.spinner.showLoadingSpinner();
      if (!this.updateSalaryForm.get('salary_id').value) {
        this.addSite();
        const siteRole = this.site.siteRoles.filter(r => r.roleId === 'security')[0];
        const hiringRatePerDay = siteRole ? siteRole.hiringRatePerDay : this.site.province.minimumWage;
        this.hiringRatePerDay = hiringRatePerDay.toFixed(2);
      }
      combineLatest(
        [
          this.siteService.getSites(),
          this.userService.getAvailableBanks()
        ]
      ).subscribe(results => {
        this.sites = results[0];
        this.banks = results[1];
        this.spinner.hideLoadingSpinner(0);
      });
    });

    this.ngxSmartModalService.getModal('salaryModal').onClose.subscribe((event: Event) => {
      this.hiringRatePerDay = '0.00';
      this.updateSalaryForm.reset({
        search: '',
        salary_id: undefined,
        empno: 0,
        role_id: '',
        is_temporary: false,
        idcard_no: '',
        title: 'นาย',
        firstname: '',
        lastname: '',
        bank_id: undefined,
        bank_account: '',
        site_search: '',
        position_value: '0.00',
        point_value: '0.00',
        is_overtime: false,
        overtime: '0.00',
        is_annual_holiday: false,
        annual_holiday: '0.00',
        is_telephone_charge: false,
        telephone_charge: '0.00',
        is_refund: false,
        refund: '0.00',
        is_duty_allowance: false,
        duty_allowance: '0.00',
        is_bonus: false,
        bonus: '0.00',
        is_other_income: false,
        other_income: '0.00',
        income_other: undefined,
        withholding_tax: '0.00',
        transfer_fee: '0.00',
        inventory: '0.00',
        is_discipline: false,
        discipline: '0.00',
        is_license_fee: false,
        license_fee: '0.00',
        is_advance: false,
        advance: '0.00',
        is_absence: false,
        absence: '0.00',
        is_cremation_fee: false,
        cremation_fee: '0.00',
        is_rent_house: false,
        rent_house: '0.00',
        is_other: false,
        other: '0.00',
        fee_other: undefined,
        is_social_security: true,
        remark: '',
        is_complete: false,
        is_suspend: false,
        is_paid: false
      });
      this.updateSalaryForm.enable();
      this.clearFormArray(this.siteForms);
    });

    this.updateSalaryForm.get('search').valueChanges
      .pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
        if (val.length < 2) {
          this.salaryEmployees = [];
          this.searching = false;
        } else {
          this.userService.getUserFilter(val, null, null, 'name', 'asc', 1, 12).subscribe(results => {
            this.salaryEmployees = results.data.filter(d => this.salaries.map(s => s.empNo).indexOf(d.empNo) === -1);
            this.searching = false;
          }, error => {
            this.salaryEmployees = [];
            this.searching = false;
          });
        }
      });

    this.updateSalaryForm.get('site_search').valueChanges
      .pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
        if (val.length < 2) {
          this.salarySites = [];
        } else {
          this.siteService.getSiteFilter(val, 'name', 'asc', 1, 12).subscribe(sites => {
            this.salarySites = sites.data;
          });
        }
      });

    this.updateSalaryForm.get('is_overtime').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('overtime').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_annual_holiday').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('annual_holiday').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_telephone_charge').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('telephone_charge').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_refund').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('refund').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_duty_allowance').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('duty_allowance').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_bonus').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('bonus').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_discipline').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('discipline').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_license_fee').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('license_fee').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_advance').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('advance').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_absence').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('absence').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_cremation_fee').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('cremation_fee').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_rent_house').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('rent_house').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('is_other').valueChanges.subscribe(val => {
      if (!val) {
        this.updateSalaryForm.get('other').setValue('0.00');
      }
    });

    this.updateSalaryForm.get('idcard_no').valueChanges
      .pipe(debounceTime(400), distinctUntilChanged()).subscribe((val: string) => {
        if (val && val.length === 13) {
          this.userService.getUserByIdCardNumber(val).subscribe(user => {
            this.updateSalaryForm.patchValue({
              empno: user.empNo,
              role_id: user.roleId
            });
          }, error => {
            this.updateSalaryForm.patchValue({
              empno: 0,
              role_id: ''
            });
          });
        } else {
          this.updateSalaryForm.patchValue({
            empno: 0,
            role_id: ''
          });
        }
      });
  }

  updateView() {
    this.applicationStateService.setIsHiddenLeftMenu = true;
    this.applicationStateService.setIsHiddenSearch = true;
  }

  getSitePayrollCycleSalary(rerender = false) {
    this.spinner.showLoadingSpinner();
    const payrollEndDate = new Date(this.payrollCycle.end);
    combineLatest(
      [
        this.payrollService.getPayrollCycleSiteSalary(this.payrollCycleId, this.siteId),
        this.payrollService.getSitePayrollCycleSalary(this.payrollCycleId, this.siteId),
        this.payrollService.getSocialSecurityRate(payrollEndDate.getFullYear(), payrollEndDate.getMonth() + 1)
      ]
    ).subscribe(results => {
      this.sitePayrollCycleSalary = results[0];
      this.salaries = results[1];
      this.socialSecurityRate = results[2];
      if (rerender) {
        this.rerender();
      } else {
        this.dtTrigger.next();
      }
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.salaries = [];
      if (rerender) {
        this.rerender();
      } else {
        this.dtTrigger.next();
      }
      this.spinner.hideLoadingSpinner(0);
    });
  }

  editSalaryModal(salary: Salary) {
    this.spinner.showLoadingSpinner();
    this.hiringRatePerDay = salary.hiringRatePerDay.toFixed(2);
    this.updateSalaryForm.patchValue({
      search: '',
      salary_id: salary.id,
      empno: salary.empNo,
      role_id: salary.roleId,
      is_temporary: salary.isTemporary,
      idcard_no: salary.idCardNumber,
      title: salary.title,
      firstname: salary.firstName,
      lastname: salary.lastName,
      bank_id: salary.bankId,
      bank_account: salary.bankAccount,
      site_search: '',
      position_value: salary.positionValue.toFixed(2),
      point_value: salary.pointValue.toFixed(2),
      is_overtime: salary.overtime > 0,
      overtime: salary.overtime.toFixed(2),
      is_annual_holiday: salary.annualHoliday > 0,
      annual_holiday: salary.annualHoliday.toFixed(2),
      is_telephone_charge: salary.telephoneCharge > 0,
      telephone_charge: salary.telephoneCharge.toFixed(2),
      is_refund: salary.refund > 0,
      refund: salary.refund.toFixed(2),
      is_duty_allowance: salary.dutyAllowance > 0,
      duty_allowance: salary.dutyAllowance.toFixed(2),
      is_bonus: salary.bonus > 0,
      bonus: salary.bonus.toFixed(2),
      is_other_income: salary.otherIncome > 0,
      other_income: salary.otherIncome.toFixed(2),
      income_other: undefined,
      withholding_tax: salary.withholdingTax.toFixed(2),
      transfer_fee: salary.transferFee.toFixed(2),
      inventory: salary.inventory.toFixed(2),
      is_discipline: salary.discipline > 0,
      discipline: salary.discipline.toFixed(2),
      is_license_fee: salary.licenseFee > 0,
      license_fee: salary.licenseFee.toFixed(2),
      is_advance: salary.advance > 0,
      advance: salary.advance.toFixed(2),
      is_absence: salary.absence > 0,
      absence: salary.absence.toFixed(2),
      is_cremation_fee: salary.cremationFee > 0,
      cremation_fee: salary.cremationFee.toFixed(2),
      is_rent_house: salary.rentHouse > 0,
      rent_house: salary.rentHouse.toFixed(2),
      is_other: salary.otherFee > 0,
      other: salary.otherFee.toFixed(2),
      fee_other: undefined,
      is_social_security: salary.isSocialSecurity,
      remark: salary.remark,
      is_complete: salary.isComplete,
      is_suspend: salary.isSuspend,
      is_paid: salary.isPaid
    });
    // if (salary.isPaid) {
    //   this.updateSalaryForm.disable();
    // }
    this.payrollService.getSiteSalary(this.payrollCycleId, salary.id).subscribe(siteSalaries => {
      this.spinner.hideLoadingSpinner(0);
      if (siteSalaries.length > 0) {
        siteSalaries.forEach(siteSalary => {
          this.siteForms.controls.push(this.fb.group({
            id: siteSalary.siteId,
            site_code: siteSalary.siteCode,
            site_name: siteSalary.siteName,
            manday: siteSalary.manday
          }));
        });
        this.ngxSmartModalService.getModal('salaryModal').open();
      } else {
        this.addSite();
      }
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });

  }

  searchFilter() {
    $.fn['dataTable'].ext.search.push((settings, data, dataIndex) => {
      const searchText = this.salaryForm.get('search').value ? this.salaryForm.get('search').value.toLowerCase() : '';
      const salaryName = String(data[2]).toLowerCase();
      if (salaryName.indexOf(searchText) !== -1) {
        return true;
      }
      return false;
    });
  }

  initialTable() {
    this.dtOptions = {
      autoWidth: false,
      dom: 'tr<\'d-flex align-items-center w-100 mt-4\'<l><\'ml-auto pr-2\'i><p>\'>',
      columns: [
        { orderable: false, width: '30px' },
        { width: '30px' },
        { width: '200px' },
        { width: '100px' },
        { width: '100px' },
        { width: '120px' },
        { orderable: false, width: '120px' },
        { width: '120px' },
        { orderable: false, width: '120px' },
        { width: '120px' },
        { orderable: false, width: '20px' }
      ],
      lengthMenu: [20, 50, 100],
      language: {
        emptyTable: '<strong>0</strong> salary(s) returned',
        info: 'Viewing <strong>_START_-_END_</strong> of <strong>_TOTAL_</strong>',
        infoEmpty: 'No salary(s) to show',
        zeroRecords: 'No matching salary(s) found',
        infoFiltered: '',
        infoPostFix: '',
        lengthMenu: '_MENU_',
        paginate: {
          first: '',
          last: '',
          next: '<img class=\'paging-arrow\' src=\'assets/img/ico-arrow-right.png\'>',
          previous: '<img class=\'paging-arrow\' src=\'assets/img/ico-arrow-left.png\'>'
        }
      },
      order: [[1, 'asc']],
      pageLength: 20,
      pagingType: 'simple'
    };
  }

  onSearchChange() {
    this.searching = true;
    this.salaryEmployees = [];
  }

  convertToStartEndDateString(start: string, end: string): string {
    if (start === '' || start === null || start === undefined || end === '' || end === null || end === undefined) {
      return '';
    }
    return this.concatStartEndString(new Date(start), new Date(end));
  }

  concatStartEndString(startDate: Date, endDate: Date): string {
    return `${startDate.getDate()} - ${endDate.getDate()} ${thaiMonth[endDate.getMonth()]} ${endDate.getFullYear()}`;
  }

  // summaryTotalIncome(salary: Salary) {
  //   return (!salary.totalWage ? 0 : salary.totalWage)
  //     + (!salary.extraReplaceValue ? 0 : salary.extraReplaceValue)
  //     + (!salary.overtime ? 0 : salary.overtime)
  //     + (!salary.extraOvertime ? 0 : salary.extraOvertime)
  //     + (!salary.extraPointValue ? 0 : salary.extraPointValue)
  //     + (!salary.totalIncome ? 0 : salary.totalIncome);
  // }

  openSuspendDialog(salary: Salary) {
    this.suspendForm.patchValue({
      salary_id: salary.id,
      full_name: `${salary.firstName} ${salary.lastName}`
    });
    this.ngxSmartModalService.getModal('suspendModal').open();
  }

  openDeleteDialog(salary: Salary) {
    this.deleteForm.patchValue({
      salary_id: salary.id,
      full_name: `${salary.firstName} ${salary.lastName}`
    });
    this.ngxSmartModalService.getModal('deleteModal').open();
  }

  openDeductionDialog() {
    this.ngxSmartModalService.getModal('deductionModal').open();
  }

  onSuspend() {
    this.spinner.showLoadingSpinner();
    this.payrollService.suspendEmployeePayrollSalary(
      this.payrollCycleId, this.siteId, this.suspendForm.get('salary_id').value).subscribe(result => {
        this.ngxSmartModalService.getModal('suspendModal').close();
        this.getSitePayrollCycleSalary(true);
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      });
  }

  onDelete() {
    this.spinner.showLoadingSpinner();
    this.payrollService.deleteEmployeePayrollSalary(
      this.payrollCycleId, this.siteId, this.deleteForm.get('salary_id').value).subscribe(result => {
        this.ngxSmartModalService.getModal('deleteModal').close();
        this.getSitePayrollCycleSalary(true);
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      });
  }

  onDeduction() {
    this.spinner.showLoadingSpinner();
    this.payrollService.updatePayrollDeduction(this.payrollCycleId, this.siteId, this.deductionForm.get('amount').value)
      .subscribe(salaries => {
        this.ngxSmartModalService.getModal('deductionModal').close();
        this.getSitePayrollCycleSalary(true);
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      });
  }

  onSubmit() {
    const that = this;
    function getValue(controlName) {
      return that.updateSalaryForm.get(controlName).value;
    }
    this.spinner.showLoadingSpinner();
    const siteRole = this.site.siteRoles.filter(r => r.roleId === this.updateSalaryForm.get('role_id').value)[0];
    const minimumManday = siteRole ? siteRole.minimumManday : 26;
    const hiringRatePerDay = this.hiringRatePerDay ? Number(this.hiringRatePerDay) : this.site.province.minimumWage;
    const salary: Salary = {
      id: getValue('salary_id') ? getValue('salary_id') : 0,
      payrollCycleId: this.payrollCycleId,
      siteId: this.siteId,
      siteCode: this.site.code,
      siteName: this.site.name,
      site: null,
      roleId: getValue('role_id'),
      roleNameTH: null,
      role: null,
      empNo: getValue('empno'),
      user: null,
      title: getValue('title'),
      firstName: getValue('firstname'),
      lastName: getValue('lastname'),
      idCardNumber: getValue('idcard_no'),
      startDate: null,
      bankAccount: getValue('bank_account'),
      bankId: getValue('bank_id'),
      minimumWage: this.site.province.minimumWage,
      minimumManday: minimumManday,
      hiringRatePerDay: hiringRatePerDay,
      siteManday: 0,
      manday: 0,
      totalWage: 0,
      positionValue: getValue('position_value'),
      pointValue: getValue('point_value'),
      annualHoliday: getValue('annual_holiday'),
      telephoneCharge: getValue('telephone_charge'),
      refund: getValue('refund'),
      dutyAllowance: getValue('duty_allowance'),
      bonus: getValue('bonus'),
      overtime: getValue('overtime'),
      otherIncome: getValue('other_income'),
      extraReplaceValue: 0,
      extraOvertime: 0,
      extraPointValue: 0,
      socialSecurity: 0,
      inventory: getValue('inventory'),
      discipline: getValue('discipline'),
      transferFee: getValue('transfer_fee'),
      absence: getValue('absence'),
      licenseFee: getValue('license_fee'),
      advance: getValue('advance'),
      rentHouse: getValue('rent_house'),
      cremationFee: getValue('cremation_fee'),
      otherFee: getValue('other'),
      remark: getValue('remark'),
      withholdingTax: getValue('withholding_tax'),
      isComplete: getValue('is_complete'),
      isPaid: getValue('is_paid'),
      payDay: null,
      isMonthly: this.site.isMonthly,
      isSuspend: getValue('is_suspend'),
      isTemporary: getValue('is_temporary'),
      isSocialSecurity: getValue('is_social_security'),
      createBy: null,
      createOn: null,
      updateBy: null,
      updateOn: null,
      siteSalaries: this.siteForms.controls.map(c => ({
        payrollCycleId: this.payrollCycleId,
        empNo: getValue('empno'),
        siteId: c.get('id').value,
        site: null,
        salaryId: 0,
        siteCode: c.get('site_code').value,
        siteName: c.get('site_name').value,
        manday: c.get('manday').value,
        isDefault: false,
        createOn: null,
        createBy: null,
        updateOn: null,
        updateBy: null
      })),
      totalIncome: 0,
      totalDeductible: 0,
      totalAmount: 0
    };
    if (salary.id > 0) {
      this.payrollService.updateSalary(this.payrollCycleId, this.siteId, salary).subscribe(_ => {
        this.ngxSmartModalService.getModal('salaryModal').close();
        this.getSitePayrollCycleSalary(true);
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      });
    } else {
      this.payrollService.addSalary(this.payrollCycleId, this.siteId, salary).subscribe(_ => {
        this.ngxSmartModalService.getModal('salaryModal').close();
        this.getSitePayrollCycleSalary(true);
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      });
    }
  }

  onClickSearchUser(user: User) {
    this.updateSalaryForm.patchValue({
      empno: user.empNo,
      role_id: user.roleId,
      idcard_no: user.idCardNumber,
      title: user.title,
      firstname: user.firstName,
      lastname: user.lastName,
      bank_id: user.bankId,
      bank_account: user.bankAccount,
      is_social_security: user.isSocialSecurity
    });
    this.salaryEmployees = [];
    this.updateSalaryForm.get('search').setValue('');
  }

  onClickSearchSite(site: Site) {
    this.addSite([site]);
    this.salarySites = [];
    this.updateSalaryForm.get('site_search').setValue('');
  }

  get siteForms() {
    return this.updateSalaryForm.get('site_array') as FormArray;
  }

  addSite(sites: Site[] = null) {
    if (sites && sites.length > 0) {
      sites.forEach(site => {
        const hiringRatePerDay =
          site.siteRoles.length > 0 ? site.siteRoles.filter(r => r.roleId === 'security')[0].hiringRatePerDay : 0;
        this.siteForms.controls.push(this.fb.group({
          id: [site.id, [Validators.required]],
          site_code: [site.code],
          site_name: [site.name],
          manday: [0, [Validators.required, Validators.min(1)]]
        }));
      });
    } else {
      const hiringRatePerDay =
        this.site.siteRoles.length > 0 ? this.site.siteRoles.filter(r => r.roleId === 'security')[0].hiringRatePerDay : 0;
      this.siteForms.controls.push(this.fb.group({
        id: [this.site.id, [Validators.required]],
        site_code: [this.site.code],
        site_name: [this.site.name],
        manday: [0, [Validators.required, Validators.min(1)]]
      }));
    }
  }

  removeSite(index: number) {
    this.siteForms.removeAt(index);
  }

  onPaid() {
    this.spinner.showLoadingSpinner();
    this.payrollService.updatePaydayPayrollSiteSalary(
      this.payrollCycleId, this.siteId, this.paidForm.get('payday').value).subscribe(salaries => {
        this.ngxSmartModalService.getModal('paidModal').close();
        this.getSitePayrollCycleSalary(true);
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      });
  }

  openCompleteDialog() {
    this.ngxSmartModalService.getModal('completeModal').open();
  }

  onComplete() {
    this.spinner.showLoadingSpinner();
    this.payrollService.updateCompletePayrollSiteSalary(this.payrollCycleId, this.siteId).subscribe(salaries => {
      this.ngxSmartModalService.getModal('completeModal').close();
      this.getSitePayrollCycleSalary(true);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });

  }

  exportPayslipReport(payrollCycleId: number, siteId: number) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-payslip', payrollCycleId, siteId);
    }
  }

  setTwoNumberDecimal($event) {
    $event.target.value = parseFloat($event.target.value).toFixed(2);
  }

  toggleShowControl(controlName: string) {
    this.updateSalaryForm.get(controlName).setValue(!this.updateSalaryForm.get(controlName).value);
  }

  onSelectionOther(value) {
    this.toggleShowControl(value);
    this.updateSalaryForm.get('income_other').setValue(undefined);
  }

  onSelectionFeeOther(value) {
    this.toggleShowControl(value);
    this.updateSalaryForm.get('fee_other').setValue(undefined);
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  rerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  get totalIncome() {
    let totalWage = 0;
    const hiringRatePerDay = this.hiringRatePerDay
      ? Number(this.hiringRatePerDay)
      : 0;
    this.siteForms.controls.forEach(siteForm => {
      totalWage = totalWage
        + ((siteForm.get('manday').value ? Number(siteForm.get('manday').value) : 0)
          * hiringRatePerDay);
    });
    return totalWage
      + (this.updateSalaryForm.get('position_value').value ? Number(this.updateSalaryForm.get('position_value').value) : 0)
      + (this.updateSalaryForm.get('point_value').value ? Number(this.updateSalaryForm.get('point_value').value) : 0)
      + (this.updateSalaryForm.get('overtime').value ? Number(this.updateSalaryForm.get('overtime').value) : 0)
      + (this.updateSalaryForm.get('annual_holiday').value ? Number(this.updateSalaryForm.get('annual_holiday').value) : 0)
      + (this.updateSalaryForm.get('telephone_charge').value ? Number(this.updateSalaryForm.get('telephone_charge').value) : 0)
      + (this.updateSalaryForm.get('refund').value ? Number(this.updateSalaryForm.get('refund').value) : 0)
      + (this.updateSalaryForm.get('duty_allowance').value ? Number(this.updateSalaryForm.get('duty_allowance').value) : 0)
      + (this.updateSalaryForm.get('bonus').value ? Number(this.updateSalaryForm.get('bonus').value) : 0)
      + (this.updateSalaryForm.get('other_income').value ? Number(this.updateSalaryForm.get('other_income').value) : 0);
  }

  get socialSecurity() {
    if (!this.updateSalaryForm.get('is_social_security').value) { return 0; }
    let result = 0;
    let resultWage = 0;
    let resultManday = 0;
    const sumSiteManday = this.siteForms.controls.length > 0
      ? this.siteForms.controls.filter(c => c.get('id').value === this.site.id).map(s => s.get('manday').value)
        .reduce((prevVal, val) => prevVal + val)
      : 0;
    if (!this.site) { return 0; }
    const siteRole = this.site.siteRoles.filter(r => r.roleId === this.updateSalaryForm.get('role_id').value)[0];
    const minimumManday = siteRole ? siteRole.minimumManday : 26;
    const minimumWage = this.site.province.minimumWage;
    const positionValue = this.updateSalaryForm.get('position_value').value
      ? Number(this.updateSalaryForm.get('position_value').value) : 0;
    if (this.site.isMonthly) {
      if (sumSiteManday > minimumManday) {
        resultManday = minimumManday;
      } else {
        resultManday = sumSiteManday;
      }
    } else {
      if (sumSiteManday > (minimumManday / 2)) {
        resultManday = (minimumManday / 2);
      } else {
        resultManday = sumSiteManday;
      }
    }
    resultWage = (minimumWage * resultManday);
    result = (resultWage + positionValue) * (this.socialSecurityRate ? this.socialSecurityRate.rate : 0.05);
    if (result < 42) {
      result = 42;
    } else if (result > 750) {
      result = 750;
    } else {
      result = Math.ceil(result);
    }
    return result;
  }

  get totalFee() {
    return this.socialSecurity
      + (this.updateSalaryForm.get('withholding_tax').value ? Number(this.updateSalaryForm.get('withholding_tax').value) : 0)
      + (this.updateSalaryForm.get('transfer_fee').value ? Number(this.updateSalaryForm.get('transfer_fee').value) : 0)
      + (this.updateSalaryForm.get('inventory').value ? Number(this.updateSalaryForm.get('inventory').value) : 0)
      + (this.updateSalaryForm.get('discipline').value ? Number(this.updateSalaryForm.get('discipline').value) : 0)
      + (this.updateSalaryForm.get('license_fee').value ? Number(this.updateSalaryForm.get('license_fee').value) : 0)
      + (this.updateSalaryForm.get('advance').value ? Number(this.updateSalaryForm.get('advance').value) : 0)
      + (this.updateSalaryForm.get('absence').value ? Number(this.updateSalaryForm.get('absence').value) : 0)
      + (this.updateSalaryForm.get('cremation_fee').value ? Number(this.updateSalaryForm.get('cremation_fee').value) : 0)
      + (this.updateSalaryForm.get('rent_house').value ? Number(this.updateSalaryForm.get('rent_house').value) : 0)
      + (this.updateSalaryForm.get('other').value ? Number(this.updateSalaryForm.get('other').value) : 0);
  }

  get noOtherItem() {
    return this.updateSalaryForm.get('is_overtime').value
      && this.updateSalaryForm.get('is_annual_holiday').value
      && this.updateSalaryForm.get('is_telephone_charge').value
      && this.updateSalaryForm.get('is_refund').value
      && this.updateSalaryForm.get('is_duty_allowance').value
      && this.updateSalaryForm.get('is_bonus').value
      && this.updateSalaryForm.get('is_other_income').value;
  }

  get noFeeOtherItem() {
    return this.updateSalaryForm.get('is_discipline').value
      && this.updateSalaryForm.get('is_license_fee').value
      && this.updateSalaryForm.get('is_advance').value
      && this.updateSalaryForm.get('is_absence').value
      && this.updateSalaryForm.get('is_cremation_fee').value
      && this.updateSalaryForm.get('is_rent_house').value
      && this.updateSalaryForm.get('is_other').value;
  }

  get summaryTotalManday() {
    if (!this.salaries || this.salaries.length <= 0) { return 0; }
    return this.salaries.map(s => s.manday).reduce((a, b) => a + b, 0);
  }

  get summaryTotalAmount() {
    if (!this.salaries || this.salaries.length <= 0) { return 0; }
    return this.salaries.map(s => s.totalAmount).reduce((a, b) => a + b, 0);
  }

}
