import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeProfileMiniComponent } from './employee-profile-mini.component';

describe('EmployeeProfileMiniComponent', () => {
  let component: EmployeeProfileMiniComponent;
  let fixture: ComponentFixture<EmployeeProfileMiniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeProfileMiniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeProfileMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
