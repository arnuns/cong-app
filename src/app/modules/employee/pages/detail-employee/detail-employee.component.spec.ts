import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ElectronService } from 'ngx-electron';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NEVER, Subject, of } from 'rxjs';

import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { TimeAttendance } from 'src/app/core/models/timeattendance';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { TimeAttendanceService } from 'src/app/core/services/time-attendance.service';
import { UserService } from 'src/app/core/services/user.service';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { DetailEmployeeComponent } from './detail-employee.component';

describe('DetailEmployeeComponent', () => {
  let component: DetailEmployeeComponent;
  let fixture: ComponentFixture<DetailEmployeeComponent>;

  const modal = {
    close: () => undefined,
    onClose: new Subject<Event>(),
    onOpen: new Subject<Event>()
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailEmployeeComponent],
      imports: [NoopAnimationsModule, RouterTestingModule, SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({ empNo: '10000048' }) }
        },
        {
          provide: ApplicationStateService,
          useValue: {}
        },
        {
          provide: ElectronService,
          useValue: { isElectronApp: false }
        },
        {
          provide: NgxSmartModalService,
          useValue: { getModal: () => modal }
        },
        {
          provide: SpinnerHelper,
          useValue: {
            hideLoadingSpinner: () => undefined,
            showLoadingSpinner: () => undefined
          }
        },
        {
          provide: TimeAttendanceService,
          useValue: {}
        },
        {
          provide: UserService,
          useValue: { getUser: () => NEVER }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders each attendance site in a dedicated column', () => {
    component.timeAttendances = [{
      workDate: '2026-07-13T00:00:00',
      checkInTime: '2026-07-13T17:31:00',
      leaveTime: '2026-07-14T06:05:00',
      checkInByName: 'จรศักดิ์ กลิ่นขจร',
      site: { name: 'บริษัท มิตรผล ไบโอฟูเอล จำกัด' }
    } as TimeAttendance];

    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('.timeattendance-table');
    const headers = Array.from(table.querySelectorAll('thead th'))
      .map((cell: HTMLElement) => cell.textContent.trim().replace(/\s+/g, ' '));
    const cells = table.querySelectorAll('tbody tr td');

    expect(headers).toEqual(['วัน เดือน ปี', 'หน่วยงาน', 'เวลาเข้า - ออก', 'บันทึกโดย']);
    expect(cells.length).toBe(4);
    expect(cells[1].textContent.trim()).toBe('บริษัท มิตรผล ไบโอฟูเอล จำกัด');
  });

  it('constrains long attendance site names to two lines at 360px', () => {
    component.timeAttendances = [{
      workDate: '2026-07-13T00:00:00',
      checkInTime: '2026-07-13T17:31:00',
      leaveTime: '2026-07-14T06:05:00',
      checkInByName: 'จรศักดิ์ กลิ่นขจร',
      site: { name: 'บริษัท มิตรผล ไบโอฟูเอล จำกัด (โรงงานเอทานอล ด่านช้าง)' }
    } as TimeAttendance];

    fixture.detectChanges();

    const columns = component.dtOptions.columns as DataTables.ColumnSettings[];
    const siteCell = fixture.nativeElement.querySelector('.timeattendance-table tbody tr td:nth-child(2)');
    const siteName = siteCell.querySelector('.timeattendance-site-name');
    const siteCellStyle = getComputedStyle(siteCell);

    expect(columns.length).toBe(4);
    expect(columns[1].width).toBe('360px');
    expect(siteCellStyle.width).toBe('360px');
    expect(siteName).not.toBeNull();
    if (siteName) {
      const siteNameStyle = getComputedStyle(siteName);
      expect(siteNameStyle.overflow).toBe('hidden');
      expect(siteNameStyle.textOverflow).toBe('ellipsis');
      expect(siteNameStyle.getPropertyValue('-webkit-line-clamp')).toBe('2');
    }
  });

  it('keeps date as the only sortable attendance column', () => {
    const columns = component.dtOptions.columns as DataTables.ColumnSettings[];

    expect(component.dtOptions.order).toEqual([[0, 'desc']]);
    expect(columns.map(column => column.orderable)).toEqual([undefined, false, false, false]);
  });

  it('renders a dash when an attendance record has no site', () => {
    component.timeAttendances = [{
      workDate: '2026-07-13T00:00:00',
      checkInTime: '2026-07-13T17:31:00',
      leaveTime: '2026-07-14T06:05:00',
      checkInByName: 'จรศักดิ์ กลิ่นขจร',
      site: null
    } as TimeAttendance];

    fixture.detectChanges();

    const siteCell = fixture.nativeElement.querySelector('.timeattendance-table tbody tr td:nth-child(2)');
    expect(siteCell.textContent.trim()).toBe('-');
  });
});
