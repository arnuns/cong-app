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
    site: { name: 'นิติบุคคลหมู่บ้านจัดสรร บ้านกลางเมือง ศรีนครินทร์-อ่อนนุช' },
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
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '1068px';
    fixture.detectChanges();
  });

  it('keeps the purchase request name, site, and date on one line', () => {
    const pages: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.container-fluid'));
    const page = pages.find(candidate => candidate.textContent.includes('ใบขอซื้ออุปกรณ์'));

    expect(page).toBeDefined();
    if (!page) {
      return;
    }

    const metadata: HTMLElement = page.querySelector('.application-form-row');
    const values: HTMLElement[] = Array.from(metadata.querySelectorAll('.employee-data'));

    expect(values.length).toBe(3);
    expect(metadata.getBoundingClientRect().height).toBeLessThanOrEqual(32);
    expect(Math.abs(values[0].getBoundingClientRect().top - values[1].getBoundingClientRect().top)).toBeLessThan(1);
    expect(Math.abs(values[1].getBoundingClientRect().top - values[2].getBoundingClientRect().top)).toBeLessThan(1);
    expect(getComputedStyle(values[1]).whiteSpace).toBe('nowrap');
  });

  it('renders the 50 equipment items and prices from the reference form', () => {
    const pages: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.container-fluid'));
    const page = pages.find(candidate => candidate.textContent.includes('ใบขอซื้ออุปกรณ์'));

    expect(page).toBeDefined();
    if (!page) {
      return;
    }

    const itemRows: HTMLTableRowElement[] =
      Array.from(page.querySelectorAll<HTMLTableRowElement>('.equipment-table tbody > tr')).slice(0, 25);
    const actualRows = itemRows.map(row =>
      Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
    );
    const expectedRows = [
      ['1', 'เสื้อยืดคอกลม สีดำ  ไซส์ ................................', '', '130.00',
        '26', 'หมวกแก็ปครูฝึก', '', '200.00'],
      ['2', 'เสื้อยืดคอกลม สีขาว  ไซส์ ..............................', '', '130.00',
        '27', 'หมวกหม้อตาล ขาว ไซส์........................', '', '420.00'],
      ['3', 'เสื้อเชิ้ตแขนสั้น ไซส์ .......................................', '', '520.00',
        '28', 'หมวกหม้อตาล กรม ไซส์........................', '', '420.00'],
      ['4', 'เสื้อสูท HP / BOT ไซส์ ...................................', '', '800.00',
        '29', 'หมวกหม้อตาลมีช่อ ขาว ไซส์................', '', '500.00'],
      ['5', 'เสื้อโปโล สีเทาไซส์ .........................................', '', '400.00',
        '30', 'หมวกหม้อตาลมีช่อ กรม ไซส์................', '', '500.00'],
      ['6', 'เสื้อโปโล สีกรม ไซส์ ......................................', '', '400.00',
        '31', 'เสื้อเชิ้ตแขนยาว แสนสิริ ไซส์ ...............', '', '600.00'],
      ['7', 'เสื้อซาฟารี ไซส์ ................................................', '', '550.00',
        '32', 'กางเกงสีกรม แสนสิริ ไซส์ ....................', '', '1,000.00'],
      ['8', 'เสื้อราชปะแตน สีขาว ไซส์ .............................', '', '680.00',
        '33', 'เสื้อจราจร สีดำ', '', '300.00'],
      ['9', 'เสื้อราชปะแตนมีอินธนู สีขาว ไซส์ ......................................', '', '680.00',
        '34', 'เสื้อจราจร สีส้ม', '', '480.00'],
      ['10', 'กางเกงราชปะแตน สีขาว ไซส์ .......................', '', '380.00',
        '35', 'เสื้อกันฝนแบบแยกส่วน', '', '500.00'],
      ['11', 'เสื้อราชปะแตน สีกรม ไซส์ .............................', '', '680.00',
        '36', 'กระบองไฟ แบบชาร์จ', '', '300.00'],
      ['12', 'กางเกงราชปะแตน สีกรม ไซส์ .......................', '', '380.00',
        '37', 'ไฟฉายสปอร์ตไลท์', '', '350.00'],
      ['13', 'กางเกงขายาว สีดำ ไซส์ ..................................', '', '380.00',
        '38', 'วิทยุ Zignal', '', '1,700.00'],
      ['14', 'กางเกงกระเป๋าข้าง สีดำ ไซส์ .........................', '', '500.00',
        '39', 'วิทยุ Italk', '', '2,000.00'],
      ['15', 'เสื้อการ์ด', '', '550.00', '40', 'แบตเตอรี่', '', '850.00'],
      ['16', 'เข็มขัดหนัง', '', '180.00', '41', 'แท่นชาร์จ', '', '550.00'],
      ['17', 'เนคไท', '', '200.00', '42', 'ป้ายชื่อ', '', '200.00'],
      ['18', 'อินธนู', '', '165.00', '43', 'ป้าย Security', '', '200.00'],
      ['19', 'นกหวีดพร้อมสาย', '', '65.00', '44', 'ป้าย Supervisor', '', '200.00'],
      ['20', 'อาร์มคู่ล่ะ(โลโก้)', '', '70.00', '45', 'บัตรพนักงาน', '', '200.00'],
      ['21', 'รองเท้าจังเกิ้ล ไซส์...........................................', '', '700.00',
        '46', 'เข็มกลัดใบอนุญาต', '', '200.00'],
      ['22', 'รองเท้าบูท', '', '200.00', '47', 'ชุดตรวจสารเสพติด', '', ''],
      ['23', 'รองเท้าเซฟตี้ ไซส์...........................................', '', '700.00', '48', '', '', ''],
      ['24', 'รองเท้าหนัง ไซส์..............................................', '', '700.00', '49', '', '', ''],
      ['25', 'หมวกแก็ป Security', '', '200.00', '50', '', '', '']
    ];

    expect(page.querySelectorAll('.equipment-table tbody > tr').length).toBe(26);
    expect(actualRows).toEqual(expectedRows);
  });

  it('keeps all equipment descriptions on one line', () => {
    const page: HTMLElement = fixture.nativeElement.querySelector('[data-testid="equipment-request-page"]');
    const descriptions: HTMLElement[] =
      Array.from(page.querySelectorAll<HTMLElement>('.equipment-description'));

    expect(descriptions.length).toBe(50);
    descriptions.forEach(description => {
      const range = document.createRange();
      range.selectNodeContents(description);
      const lineBoxes = Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0);

      expect(lineBoxes.length).toBeLessThanOrEqual(1);
    });
  });

  it('renders the numeric employee number beside the centered equipment request title', () => {
    const pages: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.container-fluid'));
    const page = pages.find(candidate => candidate.textContent.includes('ใบขอซื้ออุปกรณ์'));

    expect(page).toBeDefined();
    if (!page) {
      return;
    }

    const heading: HTMLElement = page.querySelector('.equipment-request-heading');
    const employeeNo: HTMLElement = page.querySelector('[data-testid="equipment-request-emp-no"]');

    expect(heading).not.toBeNull();
    expect(employeeNo).not.toBeNull();
    if (!heading || !employeeNo) {
      return;
    }

    const title: HTMLElement = heading.querySelector('.attachment-subtitle');
    const pageBounds = page.getBoundingClientRect();
    const titleBounds = title.getBoundingClientRect();
    const employeeNoBounds = employeeNo.getBoundingClientRect();
    const titleCenter = titleBounds.left + titleBounds.width / 2;
    const pageCenter = pageBounds.left + pageBounds.width / 2;
    const employeeNoValue: HTMLElement = employeeNo.querySelector('.employee-data');

    expect(employeeNo.firstElementChild.textContent.trim()).toBe('รหัสพนักงาน');
    expect(employeeNoValue.textContent.trim()).toBe('1234');
    expect(employeeNo.textContent).not.toContain('GSAFE');
    expect(Math.abs(titleCenter - pageCenter)).toBeLessThan(1);
    expect(Math.abs(titleBounds.bottom - employeeNoBounds.bottom)).toBeLessThan(1);
    expect(employeeNoBounds.left - titleBounds.right).toBeGreaterThanOrEqual(16);
  });

  it('uses the page 25 padding on pages 23 and 31', () => {
    const page23: HTMLElement = fixture.nativeElement.querySelector('[data-testid="employee-application-page-23"]');
    const page25: HTMLElement = fixture.nativeElement.querySelector('[data-testid="employee-application-page-25"]');
    const page31: HTMLElement = fixture.nativeElement.querySelector('[data-testid="power-of-attorney-page"]');

    const page25Style = getComputedStyle(page25);
    const expectedPadding = [
      page25Style.paddingTop,
      page25Style.paddingRight,
      page25Style.paddingBottom,
      page25Style.paddingLeft
    ];

    [page23, page31].forEach(page => {
      const style = getComputedStyle(page);

      expect([
        style.paddingTop,
        style.paddingRight,
        style.paddingBottom,
        style.paddingLeft
      ]).toEqual(expectedPadding);
    });
  });

  it('anchors the power-of-attorney attachment note at the bottom-left page margin', () => {
    const page: HTMLElement = fixture.nativeElement.querySelector('[data-testid="power-of-attorney-page"]');
    const referencePage: HTMLElement = fixture.nativeElement.querySelector('[data-testid="employee-application-page-25"]');
    const attachments: HTMLElement = page.querySelector('.power-of-attorney-attachments');
    const signatures: HTMLElement = page.querySelector('.power-of-attorney-signatures');
    const pageBounds = page.getBoundingClientRect();
    const attachmentBounds = attachments.getBoundingClientRect();
    const signatureBounds = signatures.getBoundingClientRect();
    const referenceStyle = getComputedStyle(referencePage);
    const leftOffset = attachmentBounds.left - pageBounds.left;
    const bottomOffset = pageBounds.bottom - attachmentBounds.bottom;

    expect(getComputedStyle(attachments).position).toBe('absolute');
    expect(Math.abs(leftOffset - parseFloat(referenceStyle.paddingLeft))).toBeLessThan(1);
    expect(Math.abs(bottomOffset - parseFloat(referenceStyle.paddingBottom))).toBeLessThan(1);
    expect(attachmentBounds.top - signatureBounds.bottom).toBeGreaterThanOrEqual(10);
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
