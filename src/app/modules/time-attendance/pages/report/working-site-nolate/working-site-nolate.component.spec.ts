import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WorkingSiteNolateComponent } from "./working-site-nolate.component";

describe("WorkingSiteNolateComponent", () => {
  let component: WorkingSiteNolateComponent;
  let fixture: ComponentFixture<WorkingSiteNolateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkingSiteNolateComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingSiteNolateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
