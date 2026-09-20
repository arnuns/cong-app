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
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { DatePipe } from '@angular/common';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { SiteService } from 'src/app/core/services/site.service';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { UserService } from 'src/app/core/services/user.service';
import { AddSiteComponent } from './add-site.component';

@Pipe({ name: 'storageUrl' })
class StorageUrlPipeStub implements PipeTransform {
  transform(value: any) {
    return value;
  }
}

describe('AddSiteComponent', () => {
  let component: AddSiteComponent;
  let fixture: ComponentFixture<AddSiteComponent>;
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
      declarations: [AddSiteComponent, StorageUrlPipeStub],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterTestingModule, NoopAnimationsModule, BsDatepickerModule.forRoot(), BsDropdownModule.forRoot(), ButtonsModule.forRoot(), TimepickerModule.forRoot(), NgSelectModule],
      providers: [
        { provide: DatePipe, useValue: { transform: () => '' } },
        {
          provide: ApplicationStateService,
          useValue: {
            IsHiddenLeftMenu: of(false),
            IsHiddenSearch: of(false),
            IsHiddenTopMenu: of(false)
          }
        },
        { provide: MomentHelper, useClass: MomentHelper },
        { provide: SiteService, useValue: { addSite: () => NEVER, getAmphurs: () => NEVER, getDistricts: () => NEVER, getPostcodes: () => NEVER, getProvinces: () => NEVER } },
        {
          provide: SpinnerHelper,
          useValue: { hideLoadingSpinner: () => undefined, showLoadingSpinner: () => undefined }
        },
        { provide: UserService, useValue: { getUserPositions: () => NEVER } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSiteComponent);
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
