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
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ElectronService } from 'ngx-electron';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RoutingStateService } from 'src/app/core/services/routing-state.service';
import { UserService } from 'src/app/core/services/user.service';
import { LayoutComponent } from './layout.component';

@Pipe({ name: 'storageUrl' })
class StorageUrlPipeStub implements PipeTransform {
  transform(value: any) {
    return value;
  }
}

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
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
      declarations: [LayoutComponent, StorageUrlPipeStub],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterTestingModule, NoopAnimationsModule, BsDatepickerModule.forRoot(), BsDropdownModule.forRoot(), ButtonsModule.forRoot(), TimepickerModule.forRoot(), NgSelectModule],
      providers: [
        {
          provide: ApplicationStateService,
          useValue: {
            IsHiddenLeftMenu: of(false),
            IsHiddenSearch: of(false),
            IsHiddenTopMenu: of(false)
          }
        },
        {
          provide: AuthService,
          useValue: {
            currentUser: of({ firstName: 'Test', lastName: 'User' }),
            currentUserValue: { firstName: 'Test', lastName: 'User' },
            getLoginUrl: '/login',
            logoutUser: () => NEVER
          }
        },
        { provide: ElectronService, useValue: { isElectronApp: false } },
        {
          provide: NgxSmartModalService,
          useValue: { get: () => modal, getModal: () => modal }
        },
        { provide: UserService, useValue: { getUserByNfcRefId: () => NEVER, getUserFilter: () => NEVER } },
        { provide: RoutingStateService, useValue: { getPreviousUrl: () => '/home' } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutComponent);
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
