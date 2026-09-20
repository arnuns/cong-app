import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NEVER, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { ElectronService } from 'ngx-electron';
import { SiteService } from 'src/app/core/services/site.service';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { TimeAttendanceService } from 'src/app/core/services/time-attendance.service';
import { WorkingSiteComponent } from './working-site.component';

@Pipe({ name: 'storageUrl' })
class StorageUrlPipeStub implements PipeTransform {
  transform(value: any) {
    return value;
  }
}

describe('WorkingSiteComponent', () => {
  let component: WorkingSiteComponent;
  let fixture: ComponentFixture<WorkingSiteComponent>;
  let originalJQuery: any;
  let originalBackgroundColor: string;

  const modal = {
    close: () => undefined,
    getData: () => undefined,
    onClose: NEVER,
    onOpen: NEVER,
    open: () => undefined,
    setData: () => undefined
  };

  beforeEach(async(() => {
    originalBackgroundColor = document.body.style.backgroundColor;
    originalJQuery = (window as any).$;
    (window as any).$ = { fn: { dataTable: { ext: { search: [] } } } };
    localStorage.clear();
    sessionStorage.clear();

    TestBed.configureTestingModule({
      declarations: [WorkingSiteComponent, StorageUrlPipeStub],
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        ButtonsModule.forRoot(),
        TimepickerModule.forRoot(),
        NgSelectModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: NEVER, queryParams: NEVER, snapshot: { params: {}, queryParams: {} } }
        },
        {
          provide: ApplicationStateService,
          useValue: {
            IsHiddenLeftMenu: of(false),
            IsHiddenSearch: of(false),
            IsHiddenTopMenu: of(false)
          }
        },
        { provide: ElectronService, useValue: { isElectronApp: false } },
        {
          provide: SpinnerHelper,
          useValue: { hideLoadingSpinner: () => undefined, showLoadingSpinner: () => undefined }
        },
        {
          provide: SiteService,
          useValue: {
            getSite: () => NEVER
          }
        },
        {
          provide: TimeAttendanceService,
          useValue: {
            getWorkingDaySummary: () => NEVER,
            getWorkingSiteMonthlyTimeAttendances: () => NEVER
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.style.backgroundColor = originalBackgroundColor;
    (window as any).$ = originalJQuery;
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
