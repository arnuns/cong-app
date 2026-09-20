import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ElectronService } from 'ngx-electron';

import { RoutingStateService } from './core/services/routing-state.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routingStateService: jasmine.SpyObj<RoutingStateService>;

  beforeEach(async(() => {
    routingStateService = jasmine.createSpyObj('RoutingStateService', ['loadRouting']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        {
          provide: ElectronService,
          useValue: { isElectronApp: false }
        },
        {
          provide: RoutingStateService,
          useValue: routingStateService
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app and load routing state', () => {
    expect(component).toBeTruthy();
    expect(routingStateService.loadRouting).toHaveBeenCalledTimes(1);
  });

  it('should expose the current application title', () => {
    expect(component.title).toBe('Cong App');
  });

  it('should render the router outlet', () => {
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });
});
