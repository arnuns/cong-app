import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';


@Component({
  selector: 'app-edit-site',
  templateUrl: './edit-site.component.html',
  styleUrls: ['./edit-site.component.scss']
})
export class EditSiteComponent implements OnDestroy, OnInit, AfterViewInit {
  isFirstLoad = true; 
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
    replacement_wage: [undefined],
    is_monthly: [false],
    is_sso_annual_holiday: [false],
    is_minimum_manday: [true],
    is_replacement_wage: [false],
    self_checkin: [false],
    contract_start_date: [null],
    status: [true],
    site_work_rates: this.fb.array([]),
    site_checkpoints: this.fb.array([]),
    site_user_positions: this.fb.array([]),
  });

  dateFormat = 'YYYY-MM-DDT00:00:00Z';
  deactivateError = false;

  constructor(
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private fb: FormBuilder,
    private moment: MomentHelper,
    private ngxSmartModalService: NgxSmartModalService,
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

    this.ngxSmartModalService.getModal('confirmNewModal').onClose.subscribe((modal: NgxSmartModalComponent) => {
      this.deactivateError = false;
      const data = modal.getData();
      if (data && data.isSuccess) {
        if (data.type === 'success') {
          this.onActivate();
        } else {
          this.onDeactivate();
        }
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
          replacement_wage: this.site.replacementWage || undefined,
          is_monthly: this.site.isMonthly,
          is_sso_annual_holiday: this.site.isSsoAnnualHoliday,
          is_minimum_manday: this.site.isMinimumManday,
          is_replacement_wage: this.site.isReplacementWage || false,
          self_checkin: this.site.selfCheckIn,
          contract_start_date: this.site.contractStartDate ? this.convertToDate(this.site.contractStartDate) : null,
          status: this.site.status
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
      this.isFirstLoad = false;
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
    let siteCheckpoints: SiteCheckpoint[] = [];
    if (this.siteCheckpointForms.controls.length > 0) {
      siteCheckpoints = this.siteCheckpointForms.controls.map(c => {
        let id;
        if (c.get('id') && c.get('id').value) {
          id = c.get('id').value;
        } else {
          id = undefined;
        }
  
        return {
          id: id,  // ใช้ค่าที่ตรวจสอบแล้ว
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
        };
      });
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

    const that = this;
    function getValue(controlName) {
      return that.siteForm.get(controlName).value;
    }

    this.siteService.updateSite(this.siteId, {
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
      status: getValue('status'),
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

  formatTime(time: any): string {
    if (!time) {
        return '';
    }
    
    // ถ้า time เป็น string ในรูปแบบ HH:mm:ss ให้แปลงเป็น Date ที่ถูกต้องก่อน
    if (typeof time === 'string' && time.match(/^\d{2}:\d{2}:\d{2}$/)) {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const tempDate = new Date();
        tempDate.setHours(hours, minutes, seconds, 0); // ตั้งเวลาของวันที่นี้ให้เป็นเวลาที่ต้องการ
        return this.datePipe.transform(tempDate, 'HH:mm') || '';
    }

    // กรณีอื่น ๆ ให้ใช้ DatePipe ปกติ
    return this.datePipe.transform(time, 'HH:mm') || '';
}


addSiteCheckpoint(siteCheckpoints: SiteCheckpoint[] = null) {
  const timeRangeOptions = this.siteWorkRateForms.controls.map(workRate => 
      this.formatTime(workRate.get('start_time').value) + ' - ' + this.formatTime(workRate.get('end_time').value)
  );

  // ตรวจสอบและสร้างฟอร์มใหม่สำหรับ SiteCheckpoint แต่ละรายการ
  const i = this.siteCheckpointForms.controls.length;

  // ตรวจสอบเงื่อนไขว่าควรแสดงฟอร์มใหม่สำหรับ siteCheckpoints หรือไม่
  if (siteCheckpoints && siteCheckpoints.length > 0 && this.isFirstLoad) {
      siteCheckpoints.forEach((siteCheckpoint, index) => {
          const defaultTimeRange = `${this.formatTime(siteCheckpoint.startTime)} - ${this.formatTime(siteCheckpoint.endTime)}`;

          // Push ฟอร์มพร้อมค่า defaultTimeRange
          this.siteCheckpointForms.push(this.fb.group({
              id: [siteCheckpoint.id],
              start_time: [this.moment.toDate(siteCheckpoint.startTime, 'HH:mm'), [Validators.required]],
              end_time: [this.moment.toDate(siteCheckpoint.endTime, 'HH:mm'), [Validators.required]],
              time_range: [defaultTimeRange, [Validators.required]],
              checkpoint_name: [siteCheckpoint.checkpointName, [Validators.required]],
              point_value: [siteCheckpoint.pointValue, [Validators.min(0), Validators.required]],
              worker_count: [siteCheckpoint.workerCount, [Validators.min(0), Validators.required]],
              latitude: [siteCheckpoint.latitude, [Validators.pattern(/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/)]],
              longitude: [siteCheckpoint.longitude, [Validators.pattern(/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/)]],
              sequence: [index + 1]
          }));
      });
      this.isFirstLoad = false; // ป้องกันไม่ให้โหลดค่าเดิมซ้ำ
  } else {
      const siteCheckpointForm = this.fb.group({
          start_time: [null, [Validators.required]],
          end_time: [null, [Validators.required]],
          time_range: ['', [Validators.required]],
          checkpoint_name: ['', [Validators.required]],
          point_value: [0, [Validators.min(0), Validators.required]],
          worker_count: [1, [Validators.min(0), Validators.required]],
          latitude: ['', [Validators.pattern(/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/)]],
          longitude: ['', [Validators.pattern(/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/)]],
          sequence: [i + 1]
      });

      // กำหนดค่า time range เริ่มต้นหากยังไม่มีข้อมูล siteWorkRate
      if (this.siteWorkRateForms.controls.length === 0) {
          let d = new Date();
          siteCheckpointForm.patchValue({
              start_time: this.moment.format(d, 'HH:mm:ss'),
              end_time: this.moment.format(d, 'HH:mm:ss'),
              time_range: ''
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


  removeSiteCheckpoint(index: number) {
    this.siteCheckpointForms.removeAt(index);
  }

  onKeyWorkerCountAtSiteCheckpoint(event: any, index: number) {
    const workerCountValue = event.target.value;
    const siteCheckpointForms = this.siteCheckpointForms.at(index);

    if (workerCountValue && workerCountValue <= 0) {
      siteCheckpointForms.patchValue({ worker_count: 1 })
    }
  }

  get siteUserPositionForms() {
    return this.siteForm.get('site_user_positions') as FormArray;
  }

  addSiteUserPosition(siteUserPositions: SiteUserPosition[] = null) {
    if (siteUserPositions && siteUserPositions.length > 0) {
      siteUserPositions.forEach(siteUserPosition => {
        this.siteUserPositionForms.push(this.fb.group({
          user_position_id: [siteUserPosition.userPositionId, [Validators.required]],
          minimum_manday: [siteUserPosition.minimumManday, [Validators.required]],
          hiring_rate_per_day: [siteUserPosition.hiringRatePerDay, [Validators.required]]
        }));
      });
    } else {
      this.siteUserPositionForms.push(this.fb.group({
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

  convertToDate(dateString: string) {
    const date: Date = this.moment.toDate(dateString, this.dateFormat);
    date.setHours(7);
    return date;
  }

  onActivateClick() {
    this.ngxSmartModalService.getModal('confirmNewModal').setData({
      type: 'success',
      title: 'ยืนยันการทำรายการ',
      message1: 'กรุณากดปุ่ม "ยืนยัน" เพื่อเปิดใช้งานหน่วยงาน',
      message2: '',
      isSuccess: false,
    }, true);
    this.ngxSmartModalService.getModal('confirmNewModal').open();
  }  

  onDeactivateClick() {
    this.deactivateError = false;
    this.ngxSmartModalService.getModal('confirmNewModal').setData({
      type: 'terminate',
      title: 'ยืนยันการยกเลิกหน่วยงาน',
      message1: 'คุณแน่ใจที่จะยกเลิกรายการนี้หรือไม่ ?',
      message2: 'เมื่อยกเลิกแล้ว สามารถกู้คืนรายการนี้ได้โดยการเปิดใช้งาน',
      isSuccess: false,
    }, true);
    this.ngxSmartModalService.getModal('confirmNewModal').open();
  }

  onActivate(): void {
    this.spinner.showLoadingSpinner();
    this.siteService.activateSite(this.siteId).subscribe(() => {
      this.ngxSmartModalService.getModal('confirmNewModal').setData(null, true);
      this.router.navigate(['/site']);
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.ngxSmartModalService.getModal('confirmNewModal').setData(null, true);
      this.spinner.hideLoadingSpinner(0);
    });
  }

  onDeactivate(): void {
    this.spinner.showLoadingSpinner();
    this.siteService.deactivateSite(this.siteId).subscribe(() => {
      this.ngxSmartModalService.getModal('confirmNewModal').setData(null, true);
      this.router.navigate(['/site']);
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.ngxSmartModalService.getModal('confirmNewModal').setData(null, true);
      if (error.error === "Site has active user!") {
        this.deactivateError = true;
      }
      this.spinner.hideLoadingSpinner(0);
    });
  }
}
