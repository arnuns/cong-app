import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from 'src/environments/environment';
import {ApplicationStateService} from 'src/app/core/services/application-state.service';
import {Role, User, UserPosition} from 'src/app/core/models/user';
import {Company} from 'src/app/core/models/company';
import {Site} from 'src/app/core/models/site';
import {AvailableBank} from 'src/app/core/models/available-bank.model';
import {Hospital} from 'src/app/core/models/hospital';
import {Validators, FormBuilder} from '@angular/forms';
import {existingIDCardNumberValidator} from 'src/app/core/validators/idcard-no.validator';
import {MomentHelper} from 'src/app/core/helpers/moment.helper';
import {SiteService} from 'src/app/core/services/site.service';
import {UserService} from 'src/app/core/services/user.service';
import {combineLatest, Subscription} from 'rxjs';
import {SpinnerHelper} from 'src/app/core/helpers/spinner.helper';
import {NgxSmartModalService,NgxSmartModalComponent } from 'ngx-smart-modal';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('copyOfBookBank', {static: false}) copyOfBookBank: ElementRef;
  @ViewChild('copyOfIdCardNumber', {static: false}) copyOfIdCardNumber: ElementRef;
  @ViewChild('copyOfHouseRegistration', {static: false}) copyOfHouseRegistration: ElementRef;
  @ViewChild('copyOfTranscript', {static: false}) copyOfTranscript: ElementRef;
  @ViewChild('copyOfTp7', {static: false}) copyOfTp7: ElementRef;
  @ViewChild('copyOfTp12', {static: false}) copyOfTp12: ElementRef;
  @ViewChild('copyOfCriminal', {static: false}) copyOfCriminal: ElementRef;
  @ViewChild('imageProfileUpload', {static: false}) imageProfileUpload: ElementRef;
  @ViewChild('previewImageProfileUrl', {static: false}) previewImageProfileUrl: ElementRef;
  public defaultImagePath = environment.basePath;
  empNo: number;
  user: User;
  sub: any;
  reading = false;
  updating = false;
  userPositions: UserPosition[] = [];
  companies: Company[] = [];
  sites: Site[] = [];
  banks: AvailableBank[] = [];
  hospitals: Hospital[] = [];

  titleArrays = ['นาย', 'นาง', 'นางสาว'];
  titleEnArrays = ['mr', 'ms', 'mrs'];

  beginResignForm = this.fb.group({
    begin_start_date: [null, Validators.required]
  });

  employeeForm = this.fb.group({
    is_temporary: [false],
    image_profile: [null],
    company_id: ['gmg', Validators.required],
    site_id: [undefined, Validators.required],
    user_position_id: [undefined],
    idcard_no: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
    dateissued: [null, Validators.required],
    expirydate: [null, Validators.required],
    title: ['นาย', Validators.required],
    title_other: [''],
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    title_en: ['mr'],
    title_other_en: [''],
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
    copy_of_tp7: null,
    copy_of_tp12: null,
    copy_of_criminal: null,
    license_no: [''],
    license_start_date: [null],
    license_end_date: [null],
    certificate_no: [''],
    certificate_start_date: [null],
    certificate_end_date: [null],
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
  dateFormat = 'YYYY-MM-DDT00:00:00Z';
  titleSubscription: Subscription;
  titleEnSubscription: Subscription;


  constructor(
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private fb: FormBuilder,
    private moment: MomentHelper,
    private ngxSmartModalService: NgxSmartModalService,
    private router: Router,
    private siteService: SiteService,
    private spinner: SpinnerHelper,
    private userService: UserService,
  ) {
    this.updateView();
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.empNo = Number(params['empNo']);
    });
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
    this.titleSubscription = this.titleValueChanges();
    this.titleEnSubscription = this.titleEnValueChanges();
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
    this.ngxSmartModalService.getModal('confirmNewModal').onClose.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData();
      if (data && data.isSuccess) {
        if (data.type === 'terminate') {
          if (this.checkExistingDocument(data.docType)) {
            this.spinner.showLoadingSpinner();
            const documentId = Number(this.user.documents.filter(doc => doc.type.toLowerCase() === data.docType.toLowerCase())[0].id);
            this.userService.deleteDocument(this.empNo, documentId).subscribe(_ => {
              this.spinner.hideLoadingSpinner(0);
              this.user.documents = this.user.documents.filter(doc => doc.id !== documentId);
            }, error => {
              this.spinner.hideLoadingSpinner(0);
            });
          }
          switch (data.docType) {
            case 'copyOfBookBank':
              this.employeeForm.get('copy_of_book_bank').setValue(null);
              break;
            case 'copyOfIdCardNumber':
              this.employeeForm.get('copy_of_idcard_no').setValue(null);
              break;
            case 'copyOfHouseRegistration':
              this.employeeForm.get('copy_of_house_registration').setValue(null);
              break;
            case 'copyOfTranscript':
              this.employeeForm.get('copy_of_transcript').setValue(null);
              break;
            case 'copyOfTp7':
              this.employeeForm.get('copy_of_tp7').setValue(null);
              break;
            case 'copyOfTp12':
              this.employeeForm.get('copy_of_tp12').setValue(null);
              break;
            case 'copyOfCriminal':
              this.employeeForm.get('copy_of_criminal').setValue(null);
              break;
            default:
              break;
          }
        }
      }
    });
  }

  initialData() {
    this.spinner.showLoadingSpinner();
    combineLatest(
      [
        this.userService.getUser(this.empNo),
        this.siteService.getSites(),
        this.userService.getUserPositions(),
        this.userService.getUserCompanies(),
        this.userService.getAvailableBanks(),
        this.userService.getHospitals()
      ]
    ).subscribe(results => {
      this.user = results[0];
      this.employeeForm.get('idcard_no').setAsyncValidators(existingIDCardNumberValidator(this.userService, this.user));
      this.sites = results[1];
      this.userPositions = results[2];
      this.companies = results[3].filter(c => c.status);
      this.banks = results[4];
      this.hospitals = results[5];
      if (this.user) {
        const jobHistory1 = this.user.jobHistories.filter(j => j.seq === 1)[0];
        const jobHistory2 = this.user.jobHistories.filter(j => j.seq === 2)[0];
        const jobHistory3 = this.user.jobHistories.filter(j => j.seq === 3)[0];
        const languageAbilityTh = this.user.languageAbilities.filter(l => l.language === 'Thai')[0];
        const languageAbilityEn = this.user.languageAbilities.filter(l => l.language === 'English')[0];
        if (this.user.imageProfile) {
          this.previewImageProfileUrl.nativeElement.src = this.user.imageProfile;
        }
        if (this.titleSubscription) {
          this.titleSubscription.unsubscribe();
        }
        if (this.titleEnSubscription) {
          this.titleEnSubscription.unsubscribe();
        }
        if (this.user.title) {
          if (!this.titleArrays.some(t => t === this.user.title.toLowerCase())) {
            this.employeeForm.patchValue({
              title: 'อื่นๆ',
              title_other: this.user.title
            });
            this.employeeForm.get('title_other').setValidators([Validators.required]);
          } else {
            this.employeeForm.patchValue({
              title: this.user.title,
              title_other: ''
            });
            this.employeeForm.get('title_other').setValidators(null);
          }
          this.employeeForm.get('title').updateValueAndValidity();
          this.employeeForm.get('title_other').updateValueAndValidity();
        }
        if (this.user.titleEn) {
          if (!this.titleEnArrays.some(t => t === this.user.titleEn.toLowerCase())) {
            this.employeeForm.patchValue({
              title_en: 'others',
              title_other_en: this.user.titleEn
            });
            this.employeeForm.get('title_other_en').setValidators([Validators.required]);
          } else {
            this.employeeForm.patchValue({
              title_en: this.user.titleEn,
              title_other_en: ''
            });
            this.employeeForm.get('title_other_en').setValidators(null);
          }
          this.employeeForm.get('title_en').updateValueAndValidity();
          this.employeeForm.get('title_other_en').updateValueAndValidity();
        }
        this.titleSubscription = this.titleValueChanges();
        this.titleEnSubscription = this.titleEnValueChanges();
        this.employeeForm.patchValue({
          is_temporary: this.user.isTemporary,
          image_profile: this.user.imageProfile,
          company_id: this.user.companyId ? this.user.companyId : 'gmg',
          site_id: this.user.siteId,
          user_position_id: this.user.userPositionId,
          idcard_no: this.user.idCardNumber ? this.user.idCardNumber : '',
          dateissued: this.user.dateIssued ? this.convertToDate(this.user.dateIssued) : null,
          expirydate: this.user.expiryDate ? this.convertToDate(this.user.expiryDate) : null,
          firstname: this.user.firstName ? this.user.firstName : '',
          lastname: this.user.lastName ? this.user.lastName : '',
          firstname_en: this.user.firstnameEn ? this.user.firstnameEn : '',
          lastname_en: this.user.lastnameEn ? this.user.lastnameEn : '',
          gender: this.user.gender ? this.user.gender : '',
          birthdate: this.user.birthdate ? this.convertToDate(this.user.birthdate) : null,
          weight: this.user.weight ? this.user.weight : '',
          height: this.user.height ? this.user.height : '',
          ethnicity: this.user.ethnicity ? this.user.ethnicity : '',
          nationality: this.user.nationality ? this.user.nationality : '',
          religion: this.user.religion ? this.user.religion : '',
          defect: this.user.defect ? this.user.defect : '',
          permanent_address: this.user.permanentAddress ? this.user.permanentAddress : '',
          current_address: this.user.currentAddress ? this.user.currentAddress : '',
          phone_no: this.user.phoneNo ? this.user.phoneNo : '',
          residence_status: this.user.residenceStatus ? this.user.residenceStatus : '',
          parent_name_1: this.user.parentName_1 ? this.user.parentName_1 : '',
          parent_age_1: this.user.parentAge_1 ? this.user.parentAge_1 : '',
          parent_job_1: this.user.parentJob_1 ? this.user.parentJob_1 : '',
          parent_name_2: this.user.parentName_2 ? this.user.parentName_2 : '',
          parent_age_2: this.user.parentAge_2 ? this.user.parentAge_2 : '',
          parent_job_2: this.user.parentJob_2 ? this.user.parentJob_2 : '',
          military_status: this.user.militaryStatus ? this.user.militaryStatus : '',
          education: this.user.education ? this.user.education : '',
          graduate_school: this.user.graduateSchool ? this.user.graduateSchool : '',
          faculty: this.user.faculty ? this.user.faculty : '',
          company_1: jobHistory1 ? jobHistory1.companyName : '',
          position_1: jobHistory1 ? jobHistory1.position : '',
          duration_1: jobHistory1 ? jobHistory1.duration : '',
          resignation_cause_1: jobHistory1 ? jobHistory1.resignationCause : '',
          company_2: jobHistory2 ? jobHistory2.companyName : '',
          position_2: jobHistory2 ? jobHistory2.position : '',
          duration_2: jobHistory2 ? jobHistory2.duration : '',
          resignation_cause_2: jobHistory2 ? jobHistory2.resignationCause : '',
          company_3: jobHistory3 ? jobHistory3.companyName : '',
          position_3: jobHistory3 ? jobHistory3.position : '',
          duration_3: jobHistory3 ? jobHistory3.duration : '',
          resignation_cause_3: jobHistory3 ? jobHistory3.resignationCause : '',
          training_1: this.user.training_1 ? this.user.training_1 : '',
          training_2: this.user.training_2 ? this.user.training_2 : '',
          training_3: this.user.training_3 ? this.user.training_3 : '',
          read_th: languageAbilityTh ? languageAbilityTh.read : 1,
          write_th: languageAbilityTh ? languageAbilityTh.write : 1,
          conversation_th: languageAbilityTh ? languageAbilityTh.conversation : 1,
          read_en: languageAbilityEn ? languageAbilityEn.read : 1,
          write_en: languageAbilityEn ? languageAbilityEn.write : 1,
          conversation_en: languageAbilityEn ? languageAbilityEn.conversation : 1,
          ref_name_1: this.user.refName_1 ? this.user.refName_1 : '',
          ref_relation_1: this.user.refRelation_1 ? this.user.refRelation_1 : '',
          ref_phoneno_1: this.user.refPhoneNo_1 ? this.user.refPhoneNo_1 : '',
          ref_address_1: this.user.refAddress_1 ? this.user.refAddress_1 : '',
          ref_name_2: this.user.refName_2 ? this.user.refName_2 : '',
          ref_relation_2: this.user.refRelation_2 ? this.user.refRelation_2 : '',
          ref_phoneno_2: this.user.refPhoneNo_2 ? this.user.refPhoneNo_2 : '',
          ref_name_3: this.user.refName_3 ? this.user.refName_3 : '',
          ref_relation_3: this.user.refRelation_3 ? this.user.refRelation_3 : '',
          ref_phoneno_3: this.user.refPhoneNo_3 ? this.user.refPhoneNo_3 : '',
          is_disability: this.user.disability ? true : false,
          disability: this.user.disability ? this.user.disability : '',
          is_congenital_disease: this.user.congenitalDisease ? true : false,
          congenital_disease: this.user.congenitalDisease ? this.user.congenitalDisease : '',
          is_previous_conviction: this.user.isPreviousConviction,
          num_of_conviction: this.user.numOfConviction ? this.user.numOfConviction : '',
          conviction_cause: this.user.convictionCause ? this.user.convictionCause : '',
          bank_id: this.user.bankId,
          bank_account: this.user.bankAccount ? this.user.bankAccount : '',
          license_no: this.user.licenseNo ? this.user.licenseNo : '',
          license_start_date: this.user.licenseStartDate ? this.convertToDate(this.user.licenseStartDate) : null,
          license_end_date: this.user.licenseEndDate ? this.convertToDate(this.user.licenseEndDate) : null,
          certificate_no: this.user.certificateNo ? this.user.certificateNo : '',
          certificate_start_date: this.user.certificateStartDate ? this.convertToDate(this.user.certificateStartDate): null,
          certificate_end_date: this.user.certificateEndDate ? this.convertToDate(this.user.certificateEndDate): null,
          register_date: this.user.registerOn ? this.convertToDate(this.user.registerOn) : new Date(),
          start_date: this.user.startDate ? this.convertToDate(this.user.startDate) : null,
          end_date: this.user.endDate ? this.convertToDate(this.user.endDate) : null,
          resignation_cause: this.user.resignationCause ? this.user.resignationCause : '',
          is_social_security: this.user.isSocialSecurity,
          sso_start_date: this.user.socialSecurityStartDate ? this.convertToDate(this.user.socialSecurityStartDate) : null,
          sso_end_date: this.user.socialSecurityEndDate ? this.convertToDate(this.user.socialSecurityEndDate) : null,
          hospital_id: this.user.socialHospitalId
        });

        if (this.user.documents.length > 0) {
          this.user.documents.forEach(doc => {
            const fileName = `${doc.name}${doc.fileType}`;
            switch (doc.type) {
              case 'CopyOfBookBank':
                this.employeeForm.get('copy_of_book_bank').setValue(fileName);
                break;
              case 'CopyOfIdCardNumber':
                this.employeeForm.get('copy_of_idcard_no').setValue(fileName);
                break;
              case 'CopyOfHouseRegistration':
                this.employeeForm.get('copy_of_house_registration').setValue(fileName);
                break;
              case 'CopyOfTranscript':
                this.employeeForm.get('copy_of_transcript').setValue(fileName);
                break;
              case 'CopyOfTp7':
                this.employeeForm.get('copy_of_tp7').setValue(fileName);
                break;
              case 'CopyOfTp12':
                this.employeeForm.get('copy_of_tp12').setValue(fileName);
                break;
              case 'CopyOfCriminal':
                this.employeeForm.get('copy_of_criminal').setValue(fileName);
                break;
              default:
                break;
            }
          });
        }
      }
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  imageProfileChange(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      this.spinner.showLoadingSpinner();
      const formData = new FormData();
      formData.append('file', input.files[0]);
      this.userService.uploadImageProfile(formData).subscribe(result => {
        this.employeeForm.get('image_profile').setValue(result.linkUrl);
        this.previewImageProfileUrl.nativeElement.src = result.linkUrl;
        this.spinner.hideLoadingSpinner(0);
      }, error => {
        this.spinner.hideLoadingSpinner(0);
      });
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
      case 'copyOfTp7':
        this.employeeForm.get('copy_of_tp7').setValue(file);
        fileInputLabel = this.copyOfTp7.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      case 'copyOfTp12':
        this.employeeForm.get('copy_of_tp12').setValue(file);
        fileInputLabel = this.copyOfTp12.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      case 'copyOfCriminal':
        this.employeeForm.get('copy_of_criminal').setValue(file);
        fileInputLabel = this.copyOfCriminal.nativeElement.nextElementSibling as HTMLInputElement;
        fileInputLabel.innerHTML = fileName;
        break;
      default:
        break;
    }
  }

  titleValueChanges() {
    return this.employeeForm.get('title').valueChanges.subscribe(val => {
      if (val === 'อื่นๆ') {
        this.employeeForm.get('title_other').setValidators([Validators.required]);
      } else {
        this.employeeForm.get('title_other').setValue('');
        this.employeeForm.get('title_other').setValidators(null);
      }
      this.employeeForm.get('title_other').updateValueAndValidity();
    });
  }

  titleEnValueChanges() {
    return this.employeeForm.get('title_en').valueChanges.subscribe(val => {
      if (val === 'others') {
        this.employeeForm.get('title_other_en').setValidators([Validators.required]);
      } else {
        this.employeeForm.get('title_other_en').setValue('');
        this.employeeForm.get('title_other_en').setValidators(null);
      }
      this.employeeForm.get('title_other_en').updateValueAndValidity();
    });
  }

  displayBeginModal() {
    this.ngxSmartModalService.getModal('beginModal').open();
  }

  beginDatePickerValueChange(startDate: Date) {
    this.beginResignForm.get('begin_start_date').setValue(startDate);
  }

  onSubmitBeginResign() {
    this.spinner.showLoadingSpinner();
    this.updating = true;
    this.userService.updateUserBeginResign(this.empNo, {
      companyId: this.employeeForm.get('company_id').value,
      siteId: this.employeeForm.get('site_id').value,
      oldStartDate: this.moment.formatISO8601(this.employeeForm.get('start_date').value),
      oldEndDate: this.moment.formatISO8601(this.employeeForm.get('end_date').value),
      startDate: this.moment.formatISO8601(this.beginResignForm.get('begin_start_date').value),
      description: this.employeeForm.get('resignation_cause').value
    }).subscribe(user => {
      this.spinner.hideLoadingSpinner(0);
      this.updating = false;
      this.ngxSmartModalService.getModal('beginModal').close();
      this.router.navigate(['/employee']);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
      this.updating = false;
    });
  }

  convertToDate(dateString: string) {
    const date: Date = this.moment.toDate(dateString, this.dateFormat);
    date.setHours(7);
    return date;
  }

  onSubmit() {
    this.serverError = undefined;
    this.spinner.showLoadingSpinner();
    const formData = new FormData();
    const that = this;
    function getValue(controlName) {
      return that.employeeForm.get(controlName).value;
    }
    formData.append('isTemporary', getValue('is_temporary'));
    formData.append('imageProfile', getValue('image_profile'));
    formData.append('companyId', getValue('company_id'));
    formData.append('siteId', getValue('site_id'));
    formData.append('userPositionId', getValue('user_position_id'));
    if (getValue('idcard_no')) {
      formData.append('idCardNumber', getValue('idcard_no'));
    }
    formData.append('dateIssued', getValue('dateissued') ? this.moment.format(getValue('dateissued'), 'YYYY-MM-DD') : '');
    formData.append('expiryDate', getValue('expirydate') ? this.moment.format(getValue('expirydate'), 'YYYY-MM-DD') : '');
    const title = getValue('title');
    if (title) {
      if (title === 'อื่นๆ') {
        formData.append('title', getValue('title_other'));
      } else {
        formData.append('title', getValue('title'));
      }
    }
    if (getValue('firstname')) {
      formData.append('firstName', getValue('firstname'));
    }
    if (getValue('lastname')) {
      formData.append('lastName', getValue('lastname'));
    }
    const titleEn = getValue('title_en');
    if (titleEn) {
      if (titleEn === 'others') {
        formData.append('titleEn', getValue('title_other_en'));
      } else {
        formData.append('titleEn', getValue('title_en'));
      }
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
    formData.append('birthdate', getValue('birthdate') ? this.moment.format(getValue('birthdate'), 'YYYY-MM-DD') : '');
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
      formData.append('company_1', getValue('company_1'));
    }
    if (getValue('position_1')) {
      formData.append('position_1', getValue('position_1'));
    }
    if (getValue('duration_1')) {
      formData.append('duration_1', getValue('duration_1'));
    }
    if (getValue('resignation_cause_1')) {
      formData.append('resignationCause_1', getValue('resignation_cause_1'));
    }
    if (getValue('company_2')) {
      formData.append('company_2', getValue('company_2'));
    }
    if (getValue('position_2')) {
      formData.append('position_2', getValue('position_2'));
    }
    if (getValue('duration_2')) {
      formData.append('duration_2', getValue('duration_2'));
    }
    if (getValue('resignation_cause_2')) {
      formData.append('resignationCause_2', getValue('resignation_cause_2'));
    }
    if (getValue('company_3')) {
      formData.append('company_3', getValue('company_3'));
    }
    if (getValue('position_3')) {
      formData.append('position_3', getValue('position_3'));
    }
    if (getValue('duration_3')) {
      formData.append('duration_3', getValue('duration_3'));
    }
    if (getValue('resignation_cause_3')) {
      formData.append('resignationCause_3', getValue('resignation_cause_3'));
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
    formData.append('copyOfTp7File', getValue('copy_of_tp7'));
    formData.append('copyOfTp12File', getValue('copy_of_tp12'));
    formData.append('copyOfCriminalFile', getValue('copy_of_criminal'));

    if (getValue('license_no')) {
      formData.append('licenseNo', getValue('license_no'));
    }
    formData.append('licenseStartDate', getValue('license_start_date') ? this.moment.format(getValue('license_start_date'), 'YYYY-MM-DD') : '');
    formData.append('licenseEndDate', getValue('license_end_date') ? this.moment.format(getValue('license_end_date'), 'YYYY-MM-DD') : '');
    if (getValue('certificate_no')) {
      formData.append('certificateNo', getValue('certificate_no'));
    }
    formData.append('certificateStartDate', getValue('certificate_start_date') ? this.moment.format(getValue('certificate_start_date'), 'YYYY-MM-DD') : '');
    formData.append('certificateEndDate', getValue('certificate_end_date') ? this.moment.format(getValue('certificate_end_date'), 'YYYY-MM-DD') : '');
    formData.append('registerDate', getValue('register_date') ? this.moment.format(getValue('register_date'), 'YYYY-MM-DD') : '');
    formData.append('startDate', getValue('start_date') ? this.moment.format(getValue('start_date'), 'YYYY-MM-DD') : '');
    formData.append('endDate', getValue('end_date') ? this.moment.format(getValue('end_date'), 'YYYY-MM-DD') : '');
    if (getValue('resignation_cause')) {
      formData.append('resignationCause', getValue('resignation_cause'));
    }
    formData.append('isSocialSecurity', getValue('is_social_security'));
    formData.append('ssoStartDate', getValue('sso_start_date') ? this.moment.format(getValue('sso_start_date'), 'YYYY-MM-DD') : '');
    formData.append('ssoEndDate', getValue('sso_end_date') ? this.moment.format(getValue('sso_end_date'), 'YYYY-MM-DD') : '');
    if (getValue('hospital_id') !== null && getValue('hospital_id') !== undefined) {
      formData.append('hospitalId', getValue('hospital_id'));
    }
    this.userService.updateUser(this.empNo, formData).subscribe(user => {
      this.spinner.hideLoadingSpinner(0);
      this.router.navigate(['/employee']);
    }, err => {
      this.serverError = err.error;
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

  checkExistingDocument(docType: string) {
    let isExist = false;
    if (this.user.documents.length > 0) {
      return this.user.documents.some(doc => doc.type.toLowerCase() === docType.toLowerCase());
    }
    return isExist;
  }

  onDeleteDocumentClick(docType: string) {
    this.ngxSmartModalService.getModal('confirmNewModal').setData({
      type: 'terminate',
      title: 'ยืนยันการลบไฟล์',
      message1: 'คุณแน่ใจที่จะลบไฟล์รายการนี้หรือไม่ ?',
      message2: undefined,
      isSuccess: false,
      docType: docType
    }, true);
    this.ngxSmartModalService.getModal('confirmNewModal').open();
  } 
}
