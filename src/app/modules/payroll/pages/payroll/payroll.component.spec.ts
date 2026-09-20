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
import { ElectronService } from 'ngx-electron';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Papa } from 'ngx-papaparse';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { SiteService } from 'src/app/core/services/site.service';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { UserService } from 'src/app/core/services/user.service';
import { PayrollComponent } from './payroll.component';

@Pipe({ name: 'storageUrl' })
class StorageUrlPipeStub implements PipeTransform {
  transform(value: any) {
    return value;
  }
}

describe('PayrollComponent', () => {
  let component: PayrollComponent;
  let fixture: ComponentFixture<PayrollComponent>;
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
      declarations: [PayrollComponent, StorageUrlPipeStub],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterTestingModule, NoopAnimationsModule, BsDatepickerModule.forRoot(), BsDropdownModule.forRoot(), ButtonsModule.forRoot(), TimepickerModule.forRoot(), NgSelectModule],
      providers: [
        { provide: ElectronService, useValue: { isElectronApp: false } },
        { provide: MomentHelper, useClass: MomentHelper },
        {
          provide: NgxSmartModalService,
          useValue: { get: () => modal, getModal: () => modal }
        },
        { provide: Papa, useValue: { unparse: () => NEVER } },
        { provide: PayrollService, useValue: { getPayrollCycles: () => NEVER } },
        {
          provide: SpinnerHelper,
          useValue: { hideLoadingSpinner: () => undefined, showLoadingSpinner: () => undefined }
        },
        { provide: SiteService, useValue: { getSites: () => NEVER } },
        { provide: UserService, useValue: { getAvailableBanks: () => NEVER } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollComponent);
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
