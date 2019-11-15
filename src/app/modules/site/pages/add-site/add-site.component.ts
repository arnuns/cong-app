import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, Validators, FormBuilder } from '@angular/forms';
import { SiteRole, SiteWorkRate } from 'src/app/core/models/site';
import { District, Province, Amphur, Postcode } from 'src/app/core/models/address';
import { combineLatest } from 'rxjs';
import { Role } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { Router } from '@angular/router';
import { SiteService } from 'src/app/core/services/site.service';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.component.html',
  styleUrls: ['./add-site.component.scss']
})
export class AddSiteComponent implements OnDestroy, OnInit {
  public defaultImagePath = environment.basePath;
  processing = false;
  provinces: Province[] = [];
  amphurs: Amphur[] = [];
  districts: District[] = [];
  postcodes: Postcode[] = [];
  user_amphurs: Amphur[] = [];
  user_districts: District[] = [];
  roles: Role[] = [];

  siteForm = this.fb.group({
    code: [''],
    full_name: ['', [Validators.required]],
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    province_id: [undefined, [Validators.required]],
    amphur_id: [undefined, [Validators.required]],
    district_id: [undefined, [Validators.required]],
    latitude: ['', [Validators.pattern(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,15}/g)]],
    longitude: ['', [Validators.pattern(/^-?(([-+]?)([\d]{1,3})((\.)(\d+))?)/g)]],
    postcode: [{ value: '', disabled: true }],
    is_monthly: [false],
    site_work_rates: this.fb.array([]),
    site_roles: this.fb.array([]),
  });

  constructor(
    private applicationStateService: ApplicationStateService,
    private fb: FormBuilder,
    private moment: MomentHelper,
    private router: Router,
    private siteService: SiteService,
    private spinner: SpinnerHelper,
    private userService: UserService
  ) {
    this.updateView();
  }

  ngOnInit() {
    this.initialData();
  }

  ngOnDestroy() {
    this.applicationStateService.setIsHiddenLeftMenu = false;
    this.applicationStateService.setIsHiddenSearch = false;
  }

  initialData() {
    this.spinner.showLoadingSpinner();
    combineLatest(
      [
        this.siteService.getProvinces(),
        this.siteService.getAmphurs(),
        this.siteService.getDistricts(),
        this.siteService.getPostcodes(),
        this.userService.getUserRoles(),
      ]
    ).subscribe(results => {
      this.provinces = results[0];
      this.amphurs = results[1];
      this.districts = results[2];
      this.postcodes = results[3];
      this.roles = results[4];
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      this.addSiteWorkRate([{
        siteId: undefined,
        startTime: this.moment.format(d, 'HH:mm:ss'),
        endTime: this.moment.format(d, 'HH:mm:ss'),
        workerCount: 0,
        createOn: new Date(),
        createBy: undefined
      }]);
      this.addSiteRole([{
        siteId: undefined,
        roleId: 'security',
        hiringRatePerDay: undefined,
        minimumManday: 26,
        createOn: undefined,
        createBy: undefined,
        updateOn: undefined,
        updateBy: undefined
      }]);
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  onSubmit() {
    this.spinner.showLoadingSpinner();
    let siteWorkRates: SiteWorkRate[];
    if (this.siteWorkRateForms.controls.length > 0) {
      siteWorkRates = this.siteWorkRateForms.controls.map(c => ({
        siteId: undefined,
        startTime: this.moment.format(c.get('start_time').value, 'HH:mm:ss'),
        endTime: this.moment.format(c.get('end_time').value, 'HH:mm:ss'),
        workerCount: c.get('worker_count').value,
        createOn: new Date(),
        createBy: undefined
      }));
    }
    let siteRoles: SiteRole[];
    if (this.siteRoleForms.controls.length > 0) {
      siteRoles = this.siteRoleForms.controls.map(c => ({
        siteId: undefined,
        roleId: c.get('role_id').value,
        hiringRatePerDay: c.get('hiring_rate_per_day').value,
        minimumManday: c.get('minimum_manday').value,
        createOn: new Date(),
        createBy: undefined,
        updateOn: new Date(),
        updateBy: undefined,
      }));
    }
    this.siteService.addSite({
      id: null,
      code: this.siteForm.get('code').value,
      name: this.siteForm.get('name').value,
      fullName: this.siteForm.get('full_name').value,
      address: this.siteForm.get('address').value,
      districtId: this.siteForm.get('district_id').value,
      amphurId: this.siteForm.get('amphur_id').value,
      provinceId: this.siteForm.get('province_id').value,
      province: null,
      latitude: this.siteForm.get('latitude').value,
      longitude: this.siteForm.get('longitude').value,
      isPayroll: true,
      isMonthly: this.siteForm.get('is_monthly').value,
      status: true,
      createOn: undefined,
      createBy: undefined,
      siteWorkRates: siteWorkRates,
      siteRoles: siteRoles
    }).subscribe(site => {
      this.spinner.hideLoadingSpinner(0);
      this.router.navigate(['/site']);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  onSelectionProvince(province: Province) {
    this.user_amphurs = this.amphurs.filter(a => a.provinceId === province.id);
    this.user_districts = [];
    this.siteForm.patchValue({
      amphur_id: undefined,
      district_id: undefined,
      postcode: ''
    });
  }

  onSelectionAmphur(amphur: Amphur) {
    this.user_districts = this.districts.filter(a => a.amphurId === amphur.id);
    this.siteForm.patchValue({
      district_id: undefined,
      postcode: ''
    });
  }

  onSelectionDistrict(district: District) {
    const postcode = this.postcodes.filter(p => p.districtCode === district.code)[0];
    if (postcode) {
      this.siteForm.get('postcode').setValue(postcode.code);
    }
  }

  get siteWorkRateForms() {
    return this.siteForm.get('site_work_rates') as FormArray;
  }

  addSiteWorkRate(siteWorkRates: SiteWorkRate[] = null) {
    if (siteWorkRates && siteWorkRates.length > 0) {
      siteWorkRates.forEach(siteWorkRate => {
        this.siteWorkRateForms.controls.push(this.fb.group({
          start_time: [this.moment.toDate(siteWorkRate.startTime, 'HH:mm:ss'), [Validators.required]],
          end_time: [this.moment.toDate(siteWorkRate.endTime, 'HH:mm:ss'), [Validators.required]],
          worker_count: [siteWorkRate.workerCount, [Validators.min(0)]]
        }));
      });
    } else {
      this.siteWorkRateForms.controls.push(this.fb.group({
        start_time: [undefined, [Validators.required]],
        end_time: [undefined, [Validators.required]],
        worker_count: [0, [Validators.min(0)]]
      }));
    }
  }

  removeSiteWorkRate(index: number) {
    this.siteWorkRateForms.removeAt(index);
  }

  get siteRoleForms() {
    return this.siteForm.get('site_roles') as FormArray;
  }

  addSiteRole(siteRoles: SiteRole[] = null) {
    if (siteRoles && siteRoles.length > 0) {
      siteRoles.forEach(siteRole => {
        this.siteRoleForms.controls.push(this.fb.group({
          role_id: [siteRole.roleId, [Validators.required]],
          minimum_manday: [siteRole.minimumManday, [Validators.required]],
          hiring_rate_per_day: [siteRole.hiringRatePerDay, [Validators.required]]
        }));
      });
    } else {
      this.siteRoleForms.controls.push(this.fb.group({
        role_id: [undefined, Validators.required],
        minimum_manday: [26, Validators.required],
        hiring_rate_per_day: [undefined, Validators.required]
      }));
    }
  }

  removeSiteRole(index: number) {
    this.siteRoleForms.removeAt(index);
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  updateView() {
    this.applicationStateService.setIsHiddenLeftMenu = true;
    this.applicationStateService.setIsHiddenSearch = true;
  }
}
