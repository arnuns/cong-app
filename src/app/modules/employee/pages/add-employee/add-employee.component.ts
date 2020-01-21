import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { UserService } from 'src/app/core/services/user.service';
import { Role } from 'src/app/core/models/user';
import { combineLatest } from 'rxjs';
import { Company } from 'src/app/core/models/company';
import { FormBuilder, Validators } from '@angular/forms';
import { Site } from 'src/app/core/models/site';
import { SiteService } from 'src/app/core/services/site.service';
import { IDCardNumber, existingIDCardNumberValidator } from 'src/app/core/validators/idcard-no.validator';
import { AvailableBank } from 'src/app/core/models/available-bank.model';
import { Hospital } from 'src/app/core/models/hospital';
import { environment } from 'src/environments/environment';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { Router } from '@angular/router';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('copyOfBookBank', { static: false }) copyOfBookBank: ElementRef;
  @ViewChild('copyOfIdCardNumber', { static: false }) copyOfIdCardNumber: ElementRef;
  @ViewChild('copyOfHouseRegistration', { static: false }) copyOfHouseRegistration: ElementRef;
  @ViewChild('copyOfTranscript', { static: false }) copyOfTranscript: ElementRef;
  @ViewChild('imageProfileUpload', { static: false }) imageProfileUpload: ElementRef;
  @ViewChild('previewImageProfileUrl', { static: false }) previewImageProfileUrl: ElementRef;
  public defaultImagePath = environment.basePath;
  reading = false;
  roles: Role[] = [];
  companies: Company[] = [];
  sites: Site[] = [];
  banks: AvailableBank[] = [];
  hospitals: Hospital[] = [];

  employeeForm = this.fb.group({
    is_temporary: [false],
    image_profile: [null],
    company_id: ['gmg', Validators.required],
    site_id: [undefined, Validators.required],
    role_id: ['security', Validators.required],
    idcard_no: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)],
      existingIDCardNumberValidator(this.userService)],
    dateissued: [null, Validators.required],
    expirydate: [null, Validators.required],
    title: ['นาย', Validators.required],
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    title_en: ['mr'],
    firstname_en: [''],
    lastname_en: [''],
    gender: ['male', Validators.required],
    birthdate: [null, Validators.required],
    weight: ['', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    height: ['', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    ethnicity: ['', Validators.required],
    nationality: ['', Validators.required],
    religion: ['', Validators.required],
    defect: [''],
    permanent_address: ['', Validators.required],
    current_address: ['', Validators.required],
    phone_no: ['', Validators.required],
    residence_status: [''],
    parent_name_1: [''],
    parent_age_1: ['', Validators.pattern(/^-?(0|[1-9]\d*)?$/)],
    parent_job_1: [''],
    parent_name_2: [''],
    parent_age_2: ['', Validators.pattern(/^-?(0|[1-9]\d*)?$/)],
    parent_job_2: [''],
    military_status: [''],
    education: ['', Validators.required],
    graduate_school: ['', Validators.required],
    faculty: [''],
    company_1: [''],
    position_1: [''],
    duration_1: [''],
    resignation_cause_1: [''],
    company_2: [''],
    position_2: [''],
    duration_2: [''],
    resignation_cause_2: [''],
    company_3: [''],
    position_3: [''],
    duration_3: [''],
    resignation_cause_3: [''],
    training_1: [''],
    training_2: [''],
    training_3: [''],
    read_th: [1],
    write_th: [1],
    conversation_th: [1],
    read_en: [1],
    write_en: [1],
    conversation_en: [1],
    ref_name_1: [''],
    ref_relation_1: [''],
    ref_phoneno_1: [''],
    ref_address_1: [''],
    ref_name_2: [''],
    ref_relation_2: [''],
    ref_phoneno_2: [''],
    ref_name_3: [''],
    ref_relation_3: [''],
    ref_phoneno_3: [''],
    is_disability: [false],
    disability: [''],
    is_congenital_disease: [false],
    congenital_disease: [''],
    is_previous_conviction: [false],
    num_of_conviction: [''],
    conviction_cause: [''],
    bank_id: [undefined, [Validators.required]],
    bank_account: ['', [Validators.required]],
    copy_of_book_bank: null,
    copy_of_idcard_no: null,
    copy_of_house_registration: null,
    copy_of_transcript: null,
    license_no: [''],
    license_start_date: [null],
    license_end_date: [null],
    register_date: [new Date()],
    start_date: [null, [Validators.required]],
    end_date: [null],
    resignation_cause: [''],
    is_social_security: [true],
    sso_start_date: [null],
    sso_end_date: [null],
    hospital_id: [undefined]
  });

  serverError: string;

  constructor(
    private applicationStateService: ApplicationStateService,
    private fb: FormBuilder,
    private moment: MomentHelper,
    private router: Router,
    private siteService: SiteService,
    private spinner: SpinnerHelper,
    private userService: UserService,
  ) {
    this.updateView();
  }

  ngOnDestroy() {
    this.applicationStateService.setIsHiddenLeftMenu = false;
    this.applicationStateService.setIsHiddenSearch = false;
  }

  ngOnInit() {
    this.initialData();
  }

  ngAfterViewInit() {
    this.employeeForm.get('is_temporary').valueChanges.subscribe(val => {
      if (val) {
        this.employeeForm.get('dateissued').clearValidators();
        this.employeeForm.get('expirydate').clearValidators();
        this.employeeForm.get('gender').clearValidators();
        this.employeeForm.get('birthdate').clearValidators();
        this.employeeForm.get('weight').clearValidators();
        this.employeeForm.get('height').clearValidators();
        this.employeeForm.get('ethnicity').clearValidators();
        this.employeeForm.get('nationality').clearValidators();
        this.employeeForm.get('religion').clearValidators();
        this.employeeForm.get('permanent_address').clearValidators();
        this.employeeForm.get('current_address').clearValidators();
        this.employeeForm.get('phone_no').clearValidators();
        this.employeeForm.get('education').clearValidators();
        this.employeeForm.get('graduate_school').clearValidators();
      } else {
        this.employeeForm.get('dateissued').setValidators([Validators.required]);
        this.employeeForm.get('expirydate').setValidators([Validators.required]);
        this.employeeForm.get('gender').setValidators([Validators.required]);
        this.employeeForm.get('birthdate').setValidators([Validators.required]);
        this.employeeForm.get('weight').setValidators([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]);
        this.employeeForm.get('height').setValidators([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]);
        this.employeeForm.get('ethnicity').setValidators([Validators.required]);
        this.employeeForm.get('nationality').setValidators([Validators.required]);
        this.employeeForm.get('religion').setValidators([Validators.required]);
        this.employeeForm.get('permanent_address').setValidators([Validators.required]);
        this.employeeForm.get('current_address').setValidators([Validators.required]);
        this.employeeForm.get('phone_no').setValidators([Validators.required]);
        this.employeeForm.get('education').setValidators([Validators.required]);
        this.employeeForm.get('graduate_school').setValidators([Validators.required]);
      }
      this.employeeForm.get('dateissued').updateValueAndValidity();
      this.employeeForm.get('expirydate').updateValueAndValidity();
      this.employeeForm.get('gender').updateValueAndValidity();
      this.employeeForm.get('birthdate').updateValueAndValidity();
      this.employeeForm.get('weight').updateValueAndValidity();
      this.employeeForm.get('height').updateValueAndValidity();
      this.employeeForm.get('ethnicity').updateValueAndValidity();
      this.employeeForm.get('nationality').updateValueAndValidity();
      this.employeeForm.get('religion').updateValueAndValidity();
      this.employeeForm.get('permanent_address').updateValueAndValidity();
      this.employeeForm.get('current_address').updateValueAndValidity();
      this.employeeForm.get('phone_no').updateValueAndValidity();
      this.employeeForm.get('education').updateValueAndValidity();
      this.employeeForm.get('graduate_school').updateValueAndValidity();
    });
    this.employeeForm.get('is_disability').valueChanges.subscribe(val => {
      if (val) {
        this.employeeForm.get('disability').setValidators([Validators.required]);
        this.employeeForm.get('disability').updateValueAndValidity();
      } else {
        this.employeeForm.get('disability').clearValidators();
        this.employeeForm.get('disability').updateValueAndValidity();
      }
    });
    this.employeeForm.get('is_congenital_disease').valueChanges.subscribe(val => {
      if (val) {
        this.employeeForm.get('congenital_disease').setValidators([Validators.required]);
        this.employeeForm.get('congenital_disease').updateValueAndValidity();
      } else {
        this.employeeForm.get('congenital_disease').clearValidators();
        this.employeeForm.get('congenital_disease').updateValueAndValidity();
      }
    });
    this.employeeForm.get('is_previous_conviction').valueChanges.subscribe(val => {
      if (val) {
        this.employeeForm.get('num_of_conviction').setValidators([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]);
        this.employeeForm.get('num_of_conviction').updateValueAndValidity();
        this.employeeForm.get('conviction_cause').setValidators([Validators.required]);
        this.employeeForm.get('conviction_cause').updateValueAndValidity();
      } else {
        this.employeeForm.get('num_of_conviction').clearValidators();
        this.employeeForm.get('num_of_conviction').updateValueAndValidity();
        this.employeeForm.get('conviction_cause').clearValidators();
        this.employeeForm.get('conviction_cause').updateValueAndValidity();
      }
    });
  }

  initialData() {
    this.spinner.showLoadingSpinner();
    combineLatest(
      [
        this.siteService.getSites(),
        this.userService.getUserRoles(),
        this.userService.getUserCompanies(),
        this.userService.getAvailableBanks(),
        this.userService.getHospitals()
      ]
    ).subscribe(results => {
      this.sites = results[0];
      this.roles = results[1];
      this.companies = results[2].filter(c => c.status);
      this.banks = results[3];
      this.hospitals = results[4];
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  imageProfileChange(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      this.employeeForm.get('image_profile').setValue(input.files[0]);
      const reader = new FileReader();
      reader.onload = (e: Event) => {
        this.previewImageProfileUrl.nativeElement.src = e.target['result'];
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  fileChangeEvent(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const fileName = file.name;
    const inputName = fileInput.name;
    let fileInputLabel: HTMLInputElement;
    switch (inputName) {
      case 'copyOfBookBank':
        this.employeeForm.get('copy_of_book_bank').setValue(file);
        fileInputLabel = this.copyOfBookBank.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      case 'copyOfIdCardNumber':
        this.employeeForm.get('copy_of_idcard_no').setValue(file);
        fileInputLabel = this.copyOfIdCardNumber.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      case 'copyOfHouseRegistration':
        this.employeeForm.get('copy_of_house_registration').setValue(file);
        fileInputLabel = this.copyOfHouseRegistration.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      case 'copyOfTranscript':
        this.employeeForm.get('copy_of_transcript').setValue(file);
        fileInputLabel = this.copyOfTranscript.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      default:
        break;
    }
  }

  onReaderIdCard() { }

  onSubmit() {
    this.spinner.showLoadingSpinner();
    const formData = new FormData();
    const that = this;
    function getValue(controlName) {
      return that.employeeForm.get(controlName).value;
    }
    formData.append('isTemporary', getValue('is_temporary'));
    formData.append('imageProfileFile', getValue('image_profile'));
    formData.append('companyId', getValue('company_id'));
    formData.append('siteId', getValue('site_id'));
    formData.append('roleId', getValue('role_id'));
    if (getValue('idcard_no')) {
      formData.append('idCardNumber', getValue('idcard_no'));
    }
    formData.append('dateIssued', getValue('dateissued') ? this.moment.formatISO8601(getValue('dateissued')) : '');
    formData.append('expiryDate', getValue('expirydate') ? this.moment.formatISO8601(getValue('expirydate')) : '');
    if (getValue('title')) {
      formData.append('title', getValue('title'));
    }
    if (getValue('firstname')) {
      formData.append('firstName', getValue('firstname'));
    }
    if (getValue('lastname')) {
      formData.append('lastName', getValue('lastname'));
    }
    if (getValue('title_en')) {
      formData.append('titleEn', getValue('title_en'));
    }
    if (getValue('firstname_en')) {
      formData.append('firstnameEn', getValue('firstname_en'));
    }
    if (getValue('lastname_en')) {
      formData.append('lastnameEn', getValue('lastname_en'));
    }
    if (getValue('gender')) {
      formData.append('gender', getValue('gender'));
    }
    formData.append('birthdate', getValue('birthdate') ? this.moment.formatISO8601(getValue('birthdate')) : '');
    if (getValue('weight')) {
      formData.append('weight', getValue('weight'));
    }
    if (getValue('height')) {
      formData.append('height', getValue('height'));
    }
    if (getValue('ethnicity')) {
      formData.append('ethnicity', getValue('ethnicity'));
    }
    if (getValue('nationality')) {
      formData.append('nationality', getValue('nationality'));
    }
    if (getValue('religion')) {
      formData.append('religion', getValue('religion'));
    }
    if (getValue('defect')) {
      formData.append('defect', getValue('defect'));
    }
    if (getValue('permanent_address')) {
      formData.append('permanentAddress', getValue('permanent_address'));
    }
    if (getValue('current_address')) {
      formData.append('currentAddress', getValue('current_address'));
    }
    if (getValue('phone_no')) {
      formData.append('phoneNo', getValue('phone_no'));
    }
    if (getValue('residence_status')) {
      formData.append('residenceStatus', getValue('residence_status'));
    }
    if (getValue('parent_name_1')) {
      formData.append('parentName_1', getValue('parent_name_1'));
    }
    if (getValue('parent_age_1')) {
      formData.append('parentAge_1', getValue('parent_age_1'));
    }
    if (getValue('parent_job_1')) {
      formData.append('parentJob_1', getValue('parent_job_1'));
    }
    if (getValue('parent_name_2')) {
      formData.append('parentName_2', getValue('parent_name_2'));
    }
    if (getValue('parent_age_2')) {
      formData.append('parentAge_2', getValue('parent_age_2'));
    }
    if (getValue('parent_job_2')) {
      formData.append('parentJob_2', getValue('parent_job_2'));
    }
    if (getValue('military_status')) {
      formData.append('militaryStatus', getValue('military_status'));
    }
    if (getValue('education')) {
      formData.append('education', getValue('education'));
    }
    if (getValue('graduate_school')) {
      formData.append('graduateSchool', getValue('graduate_school'));
    }
    if (getValue('faculty')) {
      formData.append('faculty', getValue('faculty'));
    }
    if (getValue('company_1')) {
      formData.append('company1', getValue('company_1'));
    }
    if (getValue('position_1')) {
      formData.append('position1', getValue('position_1'));
    }
    if (getValue('duration_1')) {
      formData.append('duration1', getValue('duration_1'));
    }
    if (getValue('resignation_cause_1')) {
      formData.append('resignationCause1', getValue('resignation_cause_1'));
    }
    if (getValue('company_2')) {
      formData.append('company2', getValue('company_2'));
    }
    if (getValue('position_2')) {
      formData.append('position2', getValue('position_2'));
    }
    if (getValue('duration_2')) {
      formData.append('duration2', getValue('duration_2'));
    }
    if (getValue('resignation_cause_2')) {
      formData.append('resignationCause2', getValue('resignation_cause_2'));
    }
    if (getValue('company_3')) {
      formData.append('company3', getValue('company_3'));
    }
    if (getValue('position_3')) {
      formData.append('position3', getValue('position_3'));
    }
    if (getValue('duration_3')) {
      formData.append('duration3', getValue('duration_3'));
    }
    if (getValue('resignation_cause_3')) {
      formData.append('resignationCause3', getValue('resignation_cause_3'));
    }
    if (getValue('training_1')) {
      formData.append('training_1', getValue('training_1'));
    }
    if (getValue('training_2')) {
      formData.append('training_2', getValue('training_2'));
    }
    if (getValue('training_3')) {
      formData.append('training_3', getValue('training_3'));
    }
    formData.append('readTh', getValue('read_th'));
    formData.append('writeTh', getValue('write_th'));
    formData.append('conversationTh', getValue('conversation_th'));
    formData.append('readEn', getValue('read_en'));
    formData.append('writeEn', getValue('write_en'));
    formData.append('conversationEn', getValue('conversation_en'));
    if (getValue('ref_name_1')) {
      formData.append('refName_1', getValue('ref_name_1'));
    }
    if (getValue('ref_relation_1')) {
      formData.append('refRelation_1', getValue('ref_relation_1'));
    }
    if (getValue('ref_phoneno_1')) {
      formData.append('refPhoneNo_1', getValue('ref_phoneno_1'));
    }
    if (getValue('ref_address_1')) {
      formData.append('refAddress_1', getValue('ref_address_1'));
    }
    if (getValue('ref_name_2')) {
      formData.append('refName_2', getValue('ref_name_2'));
    }
    if (getValue('ref_relation_2')) {
      formData.append('refRelation_2', getValue('ref_relation_2'));
    }
    if (getValue('ref_phoneno_2')) {
      formData.append('refPhoneNo_2', getValue('ref_phoneno_2'));
    }
    if (getValue('ref_name_3')) {
      formData.append('refName_3', getValue('ref_name_3'));
    }
    if (getValue('ref_relation_3')) {
      formData.append('refRelation_3', getValue('ref_relation_3'));
    }
    if (getValue('ref_phoneno_3')) {
      formData.append('refPhoneNo_3', getValue('ref_phoneno_3'));
    }
    if (getValue('disability')) {
      formData.append('disability', getValue('disability'));
    }
    if (getValue('congenital_disease')) {
      formData.append('congenitalDisease', getValue('congenital_disease'));
    }
    formData.append('isPreviousConviction', getValue('is_previous_conviction'));
    if (getValue('num_of_conviction')) {
      formData.append('numOfConviction', getValue('num_of_conviction'));
    }
    if (getValue('conviction_cause')) {
      formData.append('convictionCause', getValue('conviction_cause'));
    }
    if (getValue('bank_id')) {
      formData.append('bankId', getValue('bank_id'));
    }
    if (getValue('bank_account')) {
      formData.append('bankAccount', getValue('bank_account'));
    }

    formData.append('copyOfBookBankFile', getValue('copy_of_book_bank'));
    formData.append('copyOfIdCardNumberFile', getValue('copy_of_idcard_no'));
    formData.append('copyOfHouseRegistrationFile', getValue('copy_of_house_registration'));
    formData.append('copyOfTranscriptFile', getValue('copy_of_transcript'));

    if (getValue('license_no')) {
      formData.append('licenseNo', getValue('license_no'));
    }
    formData.append('licenseStartDate', getValue('license_start_date') ? this.moment.formatISO8601(getValue('license_start_date')) : '');
    formData.append('licenseEndDate', getValue('license_end_date') ? this.moment.formatISO8601(getValue('license_end_date')) : '');
    formData.append('registerDate', getValue('register_date') ? this.moment.formatISO8601(getValue('register_date')) : '');
    formData.append('startDate', getValue('start_date') ? this.moment.formatISO8601(getValue('start_date')) : '');
    formData.append('endDate', getValue('end_date') ? this.moment.formatISO8601(getValue('end_date')) : '');
    if (getValue('resignation_cause')) {
      formData.append('resignationCause', getValue('resignation_cause'));
    }
    formData.append('isSocialSecurity', getValue('is_social_security'));
    formData.append('ssoStartDate', getValue('sso_start_date') ? this.moment.formatISO8601(getValue('sso_start_date')) : '');
    formData.append('ssoEndDate', getValue('sso_end_date') ? this.moment.formatISO8601(getValue('sso_end_date')) : '');
    if (getValue('hospital_id')) {
      formData.append('hospitalId', getValue('hospital_id'));
    }
    this.userService.createUser(formData).subscribe(user => {
      this.spinner.hideLoadingSpinner(0);
      this.router.navigate(['/employee']);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  updateView() {
    this.applicationStateService.setIsHiddenLeftMenu = true;
    this.applicationStateService.setIsHiddenSearch = true;
  }

  get IsPermanentEmployee() {
    return !this.employeeForm.get('is_temporary').value;
  }

}
