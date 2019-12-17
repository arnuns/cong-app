import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeAttendanceComponent } from './time-attendance.component';

describe('TimeAttendanceComponent', () => {
  let component: TimeAttendanceComponent;
  let fixture: ComponentFixture<TimeAttendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeAttendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
