import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { of } from 'rxjs';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { User } from 'src/app/core/models/user';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { UserService } from 'src/app/core/services/user.service';
import { EmployeeAplicationFormComponent } from './employee-aplication-form.component';

describe('EmployeeAplicationFormComponent', () => {
  let fixture: ComponentFixture<EmployeeAplicationFormComponent>;
  let component: EmployeeAplicationFormComponent;

  const user = {
    empNo: 1234,
    company: { name: 'GSAFE' },
    userPosition: { nameTH: 'พนักงานรักษาความปลอดภัย' },
    site: { name: 'สำนักงานใหญ่' },
    idCardNumber: '1909800608435',
    title: 'นาย',
    firstName: 'กิตติธร',
    lastName: 'ธรรมพูนพิศัย',
    imageProfile: null,
    birthdate: '1966-07-26',
    phoneNo: '0854621466',
    currentAddress: '59/10 หมู่ที่ 12 ซอย ร่มเย็น ถนน พหลโยธิน ต.กะมัง ' +
      'อ.พระนครศรีอยุธยา จ.พระนครศรีอยุธยา 13000',
    languageAbilities: [],
    jobHistories: []
  } as User;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [EmployeeAplicationFormComponent],
      providers: [
        ApplicationStateService,
        {
          provide: ActivatedRoute,
          useValue: { params: of({ empNo: '1234' }) }
        },
        {
          provide: ElectronService,
          useValue: { isElectronApp: false }
        },
        {
          provide: SpinnerHelper,
          useValue: {
            showLoadingSpinner: () => undefined,
            hideLoadingSpinner: () => Promise.resolve()
          }
        },
        {
          provide: UserService,
          useValue: { getUser: () => of(user) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeAplicationFormComponent);
    component = fixture.componentInstance;
    component.currentDate = new Date(2026, 6, 26);
    fixture.detectChanges();
  });

  it('renders a final power-of-attorney page with employee and representative details', () => {
    const page: HTMLElement = fixture.nativeElement.querySelector('[data-testid="power-of-attorney-page"]');

    expect(page).not.toBeNull();
    if (!page) {
      return;
    }
    expect(page.textContent).toContain('หนังสือมอบอำนาจ');
    expect(page.textContent).toContain('นายกิตติธร ธรรมพูนพิศัย');
    expect(page.textContent).toContain('1909800608435');
    expect(page.textContent).toContain('59/10');
    expect(page.textContent).toContain('12');
    expect(page.textContent).toContain('ร่มเย็น');
    expect(page.textContent).toContain('พหลโยธิน');
    expect(page.textContent).toContain('กะมัง');
    expect(page.textContent).toContain('พระนครศรีอยุธยา');
    expect(page.textContent).toContain('13000');
    expect(page.textContent).toContain('0854621466');
    expect(page.textContent).toContain('26');
    expect(page.textContent).toContain('กรกฎาคม');
    expect(page.textContent).toContain('2569');
    expect(page.textContent).toContain('นายสิรภพ บุญศรี');
    expect(page.textContent).toContain('1103702684066');
    expect(page.textContent).toContain('099-7569360');
    expect(page.textContent).toContain('นายกฤษฎา วาฬกิจจานนท์');
    expect(page.querySelector('img')).toBeNull();
  });
});
