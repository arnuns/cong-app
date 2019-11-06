import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { UserService } from 'src/app/core/services/user.service';
import { Role } from 'src/app/core/models/user';
import { combineLatest } from 'rxjs';
import { Company } from 'src/app/core/models/company';
import { FormBuilder, Validators } from '@angular/forms';
import { Site } from 'src/app/core/models/site';
import { SiteService } from 'src/app/core/services/site.service';
import { IDCardNumber } from 'src/app/core/validators/idcard-no.validator';
import { AvailableBank } from 'src/app/core/models/available-bank.model';
import { Hospital } from 'src/app/core/models/hospital';
import { environment } from 'src/environments/environment';
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

  public defaultImagePath = environment.basePath;
  roles: Role[] = [];
  companies: Company[] = [];
  sites: Site[] = [];
  banks: AvailableBank[] = [];
  hospitals: Hospital[] = [];

  employeeForm = this.fb.group({
    is_temporary: [false],
    company_id: ['gmg', Validators.required],
    site_id: [undefined, Validators.required],
    role_id: ['security', Validators.required],
    idcard_no: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
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
    age: ['', Validators.pattern(/^-?(0|[1-9]\d*)?$/)],
    weight: ['', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    height: ['', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    ethicity: ['', Validators.required],
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
  }, {
    validator: IDCardNumber('idcard_no')
  });

  serverError: string;

  constructor(
    private applicationStateService: ApplicationStateService,
    private fb: FormBuilder,
    private siteService: SiteService,
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
        this.employeeForm.get('age').clearValidators();
        this.employeeForm.get('weight').clearValidators();
        this.employeeForm.get('height').clearValidators();
        this.employeeForm.get('ethicity').clearValidators();
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
        this.employeeForm.get('age').setValidators([Validators.pattern(/^-?(0|[1-9]\d*)?$/)]);
        this.employeeForm.get('weight').setValidators([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]);
        this.employeeForm.get('height').setValidators([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]);
        this.employeeForm.get('ethicity').setValidators([Validators.required]);
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
      this.employeeForm.get('age').updateValueAndValidity();
      this.employeeForm.get('weight').updateValueAndValidity();
      this.employeeForm.get('height').updateValueAndValidity();
      this.employeeForm.get('ethicity').updateValueAndValidity();
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
    });
  }

  imageProfileChange(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: Event) => {
        $('#previewImageProfileUrl').attr('src', e.target['result']);
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
        fileInputLabel = this.copyOfBookBank.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      case 'copyOfIdCardNumber':
        fileInputLabel = this.copyOfIdCardNumber.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      case 'copyOfHouseRegistration':
        fileInputLabel = this.copyOfHouseRegistration.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      case 'copyOfTranscript':
        fileInputLabel = this.copyOfTranscript.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      default:
        break;
    }
  }

  onSubmit() {
    // const invalid = [];
    // const controls = this.employeeForm.controls;
    // for (const name in controls) {
    //   if (controls[name].invalid) {
    //     invalid.push(name);
    //   }
    // }
    // console.log(invalid);
  }

  updateView() {
    this.applicationStateService.setIsHiddenLeftMenu = true;
    this.applicationStateService.setIsHiddenSearch = true;
  }

  get IsPermanentEmployee() {
    return !this.employeeForm.get('is_temporary').value;
  }

}
