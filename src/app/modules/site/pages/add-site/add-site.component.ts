import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormArray, Validators, FormBuilder } from '@angular/forms';
import { SiteWorkRate, SiteUserPosition, SiteCheckpoint } from 'src/app/core/models/site';
import { District, Province, Amphur, Postcode } from 'src/app/core/models/address';
import { combineLatest } from 'rxjs';
import { UserPosition } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { Router } from '@angular/router';
import { SiteService } from 'src/app/core/services/site.service';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { UserService } from 'src/app/core/services/user.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.component.html',
  styleUrls: ['./add-site.component.scss']
})
export class AddSiteComponent implements OnDestroy, OnInit, AfterViewInit {
  public defaultImagePath = environment.basePath;
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
    replacement_wage: [undefined],
    is_monthly: [false],
    is_sso_annual_holiday: [false],
    is_minimum_manday: [true],
    is_replacement_wage: [false],
    self_checkin: [false],
    contract_start_date: [null],
    site_work_rates: this.fb.array([]),
    site_checkpoints: this.fb.array([]),
    site_user_positions: this.fb.array([]),
  });



  constructor(
    private datePipe: DatePipe,
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

  ngAfterViewInit() {
    this.siteForm.get('is_replacement_wage').valueChanges.subscribe(val => {
      if (val) {
        this.siteForm.get('replacement_wage').setValidators([Validators.required]);
        this.siteForm.get('replacement_wage').updateValueAndValidity();
      } else {
        this.siteForm.get('replacement_wage').setValue(undefined);
        this.siteForm.get('replacement_wage').clearValidators();
        this.siteForm.get('replacement_wage').updateValueAndValidity();
      }
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
        this.siteService.getProvinces(),
        this.siteService.getAmphurs(),
        this.siteService.getDistricts(),
        this.siteService.getPostcodes(),
        this.userService.getUserPositions(),
      ]
    ).subscribe(results => {
      this.provinces = results[0];
      this.amphurs = results[1];
      this.districts = results[2];
      this.postcodes = results[3];
      this.userPositions = results[4];
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      this.addSiteWorkRate([{
        siteId: undefined,
        startTime: this.moment.format(d, 'HH:mm:ss'),
        endTime: this.moment.format(d, 'HH:mm:ss'),
        workerCount: 1,
        createOn: new Date(),
        createBy: undefined
      }]);
      this.addSiteUserPosition([{
        siteId: undefined,
        userPositionId: 20,
        site: null,
        userPosition: null,
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
    let siteCheckpoints: SiteCheckpoint[];
    if (this.siteCheckpointForms.controls.length > 0) {
      siteCheckpoints = this.siteCheckpointForms.controls.map(c => ({
        id: undefined,
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
        siteId: undefined,
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

    const that = this;
    function getValue(controlName) {
      return that.siteForm.get(controlName).value;
    }

    this.siteService.addSite({
      id: null,
      code: getValue('code'),
      name: getValue('name'),
      fullName: getValue('full_name'),
      address: getValue('address'),
      districtId: getValue('district_id'),
      amphurId: getValue('amphur_id'),
      provinceId: getValue('province_id'),
      province: null,
      latitude: getValue('latitude'),
      longitude: getValue('longitude'),
      minimumWage: getValue('minimum_wage'),
      replacementWage: getValue('replacement_wage') || 0,
      isPayroll: true,
      isMonthly: getValue('is_monthly'),
      isSsoAnnualHoliday: getValue('is_sso_annual_holiday'),
      isMinimumManday: getValue('is_minimum_manday'),
      isReplacementWage: getValue('is_replacement_wage'),
      selfCheckIn: getValue('self_checkin'),
      contractStartDate:  getValue('contract_start_date') ? this.moment.format(getValue('contract_start_date'), 'YYYY-MM-DD') : undefined,
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
        this.siteWorkRateForms.push(this.fb.group({
          start_time: [this.moment.toDate(siteWorkRate.startTime, 'HH:mm:ss'), [Validators.required]],
          end_time: [this.moment.toDate(siteWorkRate.endTime, 'HH:mm:ss'), [Validators.required]],
          worker_count: [siteWorkRate.workerCount, [Validators.required, Validators.min(0)]]
        }));
      });
    } else {
      this.siteWorkRateForms.push(this.fb.group({
        start_time: [undefined, [Validators.required]],
        end_time: [undefined, [Validators.required]],
        worker_count: [1, [Validators.required, Validators.min(0)]]
      }));
    }
  }

  removeSiteWorkRate(index: number) {
    this.siteWorkRateForms.removeAt(index);
  }

  get siteCheckpointForms() {
    return this.siteForm.get('site_checkpoints') as FormArray;
  }

  onKeyWorkerCountAtSiteWorkRate(event: any, index: number) {
    const workerCountValue = event.target.value;
    const siteWorkRateForms = this.siteWorkRateForms.at(index);

    if (workerCountValue && workerCountValue <= 0) {
      siteWorkRateForms.patchValue({ worker_count: 1 })
    }
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
        this.siteCheckpointForms.push(this.fb.group({
          start_time: [siteCheckpoint.startTime, [Validators.required]],
          end_time: [siteCheckpoint.endTime, [Validators.required]],
          time_range: [defaultTimeRange, [Validators.required]],
          checkpoint_name: [siteCheckpoint.checkpointName, [Validators.required]],
          point_value: [siteCheckpoint.pointValue, [Validators.min(0), Validators.required]],
          worker_count: [siteCheckpoint.workerCount, [Validators.min(0), Validators.required]],
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
        point_value: [0, [Validators.min(0), Validators.required]],
        worker_count: [1, [Validators.min(0), Validators.required]],
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

      this.siteCheckpointForms.push(siteCheckpointForm);
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

  onKeyWorkerCountAtSiteCheckpoint(event: any, index: number) {
    const workerCountValue = event.target.value;
    const siteCheckpointForms = this.siteCheckpointForms.at(index);

    if (workerCountValue && workerCountValue <= 0) {
      siteCheckpointForms.patchValue({ worker_count: 1 })
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
        this.siteUserPositionForms.push(this.fb.group({
          user_position_id: [siteUserPosition.userPositionId, [Validators.required]],
          minimum_manday: [siteUserPosition.minimumManday, [Validators.required, Validators.min(0)]],
          hiring_rate_per_day: [siteUserPosition.hiringRatePerDay, [Validators.required, Validators.min(0)]]
        }));
      });
    } else {
      this.siteUserPositionForms.push(this.fb.group({
        user_position_id: [undefined, [Validators.required]],
        minimum_manday: [26, [Validators.required, Validators.min(0)]],
        hiring_rate_per_day: [undefined, [Validators.required, Validators.min(0)]]
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

  get alertOverWorkerCountAtSiteCheckpoint(): boolean {
    let isAlert = false;

    let siteWorkRateMapAndSumWorkerCount = {};
    if (this.siteWorkRateForms.controls.length > 0) {
      this.siteWorkRateForms.controls.forEach(element => {
        const key = `${this.moment.format(element.get('start_time').value, 'HH:mm:ss')}-${this.moment.format(element.get('end_time').value, 'HH:mm:ss')}`;

        if (!siteWorkRateMapAndSumWorkerCount[key]) {
          siteWorkRateMapAndSumWorkerCount[key] = {
            startTime: this.moment.format(element.get('start_time').value, 'HH:mm:ss'),
            endTime: this.moment.format(element.get('end_time').value, 'HH:mm:ss'),
            workerCount: 0
          };
        }
        siteWorkRateMapAndSumWorkerCount[key].workerCount += element.get('worker_count').value;
      });
    }

    if (this.siteCheckpointForms.controls.length > 0) {
      let siteCheckpointMapAndSumWorkerCount = {};
      this.siteCheckpointForms.controls.forEach(element => {
        const key = `${this.moment.format(element.get('start_time').value, 'HH:mm:ss')}-${this.moment.format(element.get('end_time').value, 'HH:mm:ss')}`;

        if (!siteCheckpointMapAndSumWorkerCount[key]) {
          siteCheckpointMapAndSumWorkerCount[key] = {
            startTime: this.moment.format(element.get('start_time').value, 'HH:mm:ss'),
            endTime: this.moment.format(element.get('end_time').value, 'HH:mm:ss'),
            workerCount: 0
          };
        }
        siteCheckpointMapAndSumWorkerCount[key].workerCount += element.get('worker_count').value;
      });

      // Validate worker counts
      for (const key in siteCheckpointMapAndSumWorkerCount) {
        if (siteCheckpointMapAndSumWorkerCount.hasOwnProperty(key)) {
          if (this.isNullOrUndefined(key) || key === "Invalid date-Invalid date") {
            continue;
          }

          const checkpointData = siteCheckpointMapAndSumWorkerCount[key];
          const workRateData = siteWorkRateMapAndSumWorkerCount[key];

          // If there's a matching work rate record, compare the worker counts
          if (workRateData && checkpointData.workerCount > workRateData.workerCount) {
            isAlert = true;
            break;
          }
        }
      }
    }
    return isAlert;
  }

  isNullOrUndefined(value: any): boolean {
    return value === '' || value === null || value === undefined;
  }
}
