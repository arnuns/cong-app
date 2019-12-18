import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingSiteComponent } from './working-site.component';

describe('WorkingSiteComponent', () => {
  let component: WorkingSiteComponent;
  let fixture: ComponentFixture<WorkingSiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingSiteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
