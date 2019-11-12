import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLicenseComponent } from './employee-license.component';

describe('EmployeeLicenseComponent', () => {
  let component: EmployeeLicenseComponent;
  let fixture: ComponentFixture<EmployeeLicenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeLicenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
