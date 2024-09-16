import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { FormBuilder, Validators, FormArray, FormGroup, FormControl } from '@angular/forms';
import { SiteService } from 'src/app/core/services/site.service';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { environment } from 'src/environments/environment';
import { UserPosition } from 'src/app/core/models/user';
import { Site, SiteWorkRate, SiteUserPosition, SiteCheckpoint } from 'src/app/core/models/site';
import { combineLatest } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';
import { Province, Amphur, District, Postcode } from 'src/app/core/models/address';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-edit-site',
  templateUrl: './edit-site.component.html',
  styleUrls: ['./edit-site.component.scss']
})
export class EditSiteComponent implements OnDestroy, OnInit {
  public defaultImagePath = environment.basePath;
  siteId: number;
  site: Site;
  sub: any;
  processing = false;
  provinces: Province[] = [];
  amphurs: Amphur[] = [];
  districts: District[] = [];
  postcodes: Postcode[] = [];
  user_amphurs: Amphur[] = [];
  user_districts: District[] = [];
  userPositions: UserPosition[] = [];

  siteForm = this.fb.group({
    code: [''],
    full_name: ['', [Validators.required]],
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    province_id: [undefined, [Validators.required]],
    amphur_id: [undefined, [Validators.required]],
    district_id: [undefined, [Validators.required]],
    latitude: ['', [Validators.pattern(/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/)]],
    longitude: ['', [Validators.pattern(/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/)]],
    postcode: [{ value: '', disabled: true }],
    minimum_wage: [undefined, [Validators.required]],
    is_monthly: [false],
    is_sso_annual_holiday: [false],
    is_minimum_manday: [true],
    self_checkin: [false],
    site_work_rates: this.fb.array([]),
    site_checkpoints: this.fb.array([]),
    site_user_positions: this.fb.array([]),
  });



  constructor(
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private fb: FormBuilder,
    private moment: MomentHelper,
    private router: Router,
    private siteService: SiteService,
    private spinner: SpinnerHelper,
    private userService: UserService
  ) {
    this.updateView();
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.siteId = Number(params['siteId']);
    });
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
        this.siteService.getSite(this.siteId),
        this.siteService.getProvinces(),
        this.siteService.getAmphurs(),
        this.siteService.getDistricts(),
        this.siteService.getPostcodes(),
        this.userService.getUserPositions(),
      ]
    ).subscribe(results => {
      this.site = results[0];
      this.provinces = results[1];
      this.amphurs = results[2];
      this.districts = results[3];
      this.postcodes = results[4];
      this.userPositions = results[5];
      if (this.site) {
        this.siteForm.patchValue({
          code: this.site.code,
          full_name: this.site.fullName,
          name: this.site.name,
          address: this.site.address,
          province_id: this.site.provinceId,
          amphur_id: this.site.amphurId > 0 ? this.site.amphurId : undefined,
          district_id: this.site.districtId > 0 ? this.site.districtId : undefined,
          latitude: this.site.latitude,
          longitude: this.site.longitude,
          minimum_wage: this.site.minimumWage,
          is_monthly: this.site.isMonthly,
          is_sso_annual_holiday: this.site.isSsoAnnualHoliday,
          is_minimum_manday: this.site.isMinimumManday,
          self_checkin: this.site.selfCheckIn
        });
        this.user_amphurs = this.amphurs.filter(a => a.provinceId === this.site.provinceId);
        this.user_districts = this.districts.filter(a => a.amphurId === this.site.amphurId);
        const district = this.districts.filter(d => d.id === this.siteForm.get('district_id').value)[0];
        if (district) {
          const postcode = this.postcodes.filter(p => p.districtCode === district.code)[0];
          if (postcode) {
            this.siteForm.get('postcode').setValue(postcode.code);
          }
        }
        if (this.site.siteWorkRates.length > 0) {
          this.addSiteWorkRate(this.site.siteWorkRates);
        } else {
          this.addSiteWorkRate();
        }
        if (this.site.siteCheckpoints.length > 0) {
          this.addSiteCheckpoint(this.site.siteCheckpoints);
        }
        if (this.site.siteUserPositions.length > 0) {
          this.addSiteUserPosition(this.site.siteUserPositions);
        } else {
          this.addSiteUserPosition();
        }
      }
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
        siteId: this.siteId,
        startTime: this.moment.format(c.get('start_time').value, 'HH:mm:ss'),
        endTime: this.moment.format(c.get('end_time').value, 'HH:mm:ss'),
        workerCount: c.get('worker_count').value,
        createOn: new Date(),
        createBy: undefined
      }));
    }
    let siteCheckpoints: SiteCheckpoint[];
    if (this.siteCheckpointForms.controls.length > 0) {
      siteCheckpoints = this.siteCheckpointForms.controls.map(c => ({
        id: c.get('id').value,
        siteId: undefined,
        startTime: this.moment.format(c.get('start_time').value, 'HH:mm:ss'),
        endTime: this.moment.format(c.get('end_time').value, 'HH:mm:ss'),
        timeRange: '08:00 - 17:00',
        checkpointName: c.get('checkpoint_name').value,
        pointValue: c.get('point_value').value,
        workerCount: c.get('worker_count').value,
        latitude: c.get('latitude').value,
        longitude: c.get('longitude').value,
        sequence: c.get('sequence').value,
        createOn: new Date(),
        createBy: undefined,
        updateOn: new Date(),
        updateBy: undefined,
      }));
    }
    let siteUserPositions: SiteUserPosition[];
    if (this.siteUserPositionForms.controls.length > 0) {
      siteUserPositions = this.siteUserPositionForms.controls.map(c => ({
        siteId: this.siteId,
        userPositionId: c.get('user_position_id').value,
        site: null,
        userPosition: null,
        hiringRatePerDay: c.get('hiring_rate_per_day').value,
        minimumManday: c.get('minimum_manday').value,
        createOn: new Date(),
        createBy: undefined,
        updateOn: new Date(),
        updateBy: undefined,
      }));
    }
    this.siteService.updateSite(this.siteId, {
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
      minimumWage: this.siteForm.get('minimum_wage').value,
      isPayroll: true,
      isMonthly: this.siteForm.get('is_monthly').value,
      isSsoAnnualHoliday: this.siteForm.get('is_sso_annual_holiday').value,
      isMinimumManday: this.siteForm.get('is_minimum_manday').value,
      selfCheckIn: this.siteForm.get('self_checkin').value,
      status: true,
      createOn: undefined,
      createBy: undefined,
      siteWorkRates: siteWorkRates,
      siteCheckpoints: siteCheckpoints,
      siteUserPositions: siteUserPositions
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

    // อัพเดตฟอร์มค่าจุดตามฟอร์มเวลาใหม่
  this.siteCheckpointForms.controls.forEach((checkpointForm, i) => {
    const timeRangeOptions = this.siteWorkRateForms.controls.map(workRate => 
      this.formatTime(workRate.get('start_time').value) + ' - ' + this.formatTime(workRate.get('end_time').value)
    );

    const defaultTimeRange = timeRangeOptions.length > i ? timeRangeOptions[i] : timeRangeOptions[0];

    checkpointForm.patchValue({
      time_range: defaultTimeRange
    });

    // อัพเดต start_time และ end_time ตามค่าใหม่ใน dropdown
    this.onTimeRangeChange({ target: { value: defaultTimeRange } }, i);
   });
  }

  get siteCheckpointForms() {
    return this.siteForm.get('site_checkpoints') as FormArray;
  }

  formatTime(date: Date): string {
    return this.datePipe.transform(date, 'HH:mm') || '';
  }


  addSiteCheckpoint(siteCheckpoints: SiteCheckpoint[] = null) {
    const timeRangeOptions = this.siteWorkRateForms.controls.map(workRate => 
      this.formatTime(workRate.get('start_time').value) + ' - ' + this.formatTime(workRate.get('end_time').value)
    );

    // คำนวณลำดับของ SiteCheckpointForm ที่จะถูกเพิ่มใหม่
    const i = this.siteCheckpointForms.controls.length;

    // ตั้งค่า defaultTimeRange เป็นค่าว่างเพื่อแสดง "เลือกรายการ"
    const defaultTimeRange = '';

    if (siteCheckpoints && siteCheckpoints.length > 0) {
      siteCheckpoints.forEach((siteCheckpoint, index) => {
        this.siteCheckpointForms.controls.push(this.fb.group({
          start_time: [siteCheckpoint.startTime, [Validators.required]],
          end_time: [siteCheckpoint.endTime, [Validators.required]],
          time_range: [defaultTimeRange, [Validators.required]], 
          checkpoint_name: [siteCheckpoint.checkpointName, [Validators.required]],
          point_value: [siteCheckpoint.pointValue, [Validators.min(0)]],
          worker_count: [siteCheckpoint.workerCount, [Validators.min(0)]],
          latitude: [siteCheckpoint.latitude, [Validators.pattern(/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/)]],
          longitude: [siteCheckpoint.longitude, [Validators.pattern(/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/)]],
          sequence: [index + 1]
        }));
      });
    } else {
      const siteCheckpointForm = this.fb.group({
        start_time: [null, [Validators.required]],
        end_time: [null, [Validators.required]],
        time_range: [defaultTimeRange, [Validators.required]],
        checkpoint_name: ['', [Validators.required]],
        point_value: [0, [Validators.min(0)]],
        worker_count: [1, [Validators.min(0)]],
        latitude: ['', [Validators.pattern(/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/)]],
        longitude: ['', [Validators.pattern(/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/)]],
        sequence: [i + 1]
      });

      // หากไม่มีข้อมูลในฟอร์ม SiteWorkRate เลยให้กำหนดค่าเริ่มต้นเป็นปัจจุบัน
      if (this.siteWorkRateForms.controls.length === 0) {
        let d = new Date();
        siteCheckpointForm.patchValue({
          start_time: this.moment.format(d, 'HH:mm:ss'),
          end_time: this.moment.format(d, 'HH:mm:ss'),
          time_range: defaultTimeRange
        });
      }

      this.siteCheckpointForms.controls.push(siteCheckpointForm);
    }
  }

  onTimeRangeChange(event: any, index: number) {
    const selectedTimeRange = event.target.value;
    const siteCheckpointForm = this.siteCheckpointForms.at(index);

    if (selectedTimeRange === '') {  // ตรวจสอบว่าเลือก "เลือกรายการ"
        siteCheckpointForm.patchValue({
            start_time: null,
            end_time: null
        });
    } else {
        const [startTime, endTime] = selectedTimeRange.split(' - ');
        siteCheckpointForm.patchValue({
            start_time: this.moment.toDate(startTime, 'HH:mm'),
            end_time: this.moment.toDate(endTime, 'HH:mm')
        });
    }
}


  removeSiteCheckpoint(index: number) {
    this.siteCheckpointForms.removeAt(index);
  }

  get siteUserPositionForms() {
    return this.siteForm.get('site_user_positions') as FormArray;
  }

  addSiteUserPosition(siteUserPositions: SiteUserPosition[] = null) {
    if (siteUserPositions && siteUserPositions.length > 0) {
      siteUserPositions.forEach(siteUserPosition => {
        this.siteUserPositionForms.controls.push(this.fb.group({
          user_position_id: [siteUserPosition.userPositionId, [Validators.required]],
          minimum_manday: [siteUserPosition.minimumManday, [Validators.required]],
          hiring_rate_per_day: [siteUserPosition.hiringRatePerDay, [Validators.required]]
        }));
      });
    } else {
      this.siteUserPositionForms.controls.push(this.fb.group({
        user_position_id: [undefined, Validators.required],
        minimum_manday: [26, Validators.required],
        hiring_rate_per_day: [undefined, Validators.required]
      }));
    }
  }

  removeSiteUserPosition(index: number) {
    this.siteUserPositionForms.removeAt(index);
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

  // public findInvalidControls() {
  //   const invalid = [];
  //   const controls = this.siteForm.controls;
  //   for (const name in controls) {
  //     console.log(`${name} ${controls[name].invalid}`);
  //     if (controls[name].invalid) {
  //       invalid.push(name);
  //     }
  //   }
  //   return invalid;
  // }

  get alertSiteCheckpoint(): boolean {
    let isAlert = false;
    if (this.siteCheckpointForms.controls.length > 0) {
      const siteWorkRateTimes = this.siteWorkRateForms.controls.map(c => (this.moment.format(c.get('start_time').value, 'HH:mm:ss') + this.moment.format(c.get('end_time').value, 'HH:mm:ss')));
      const siteCheckpointTimes = this.siteCheckpointForms.controls.map(c => (this.moment.format(c.get('start_time').value, 'HH:mm:ss') + this.moment.format(c.get('end_time').value, 'HH:mm:ss')));
      if (siteCheckpointTimes.filter(c => !siteWorkRateTimes.includes(c)).length > 0) {
        isAlert = true;
      }
    }
    return isAlert;
  }

}
