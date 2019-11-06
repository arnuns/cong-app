import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RoutingStateService } from './core/services/routing-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Cong App';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private routingStateService: RoutingStateService) {
    this.routingStateService.loadRouting();
  }

  onActivate(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      const scrollToTop = window.setInterval(() => {
        const pos = window.pageYOffset;
        if (pos > 0) {
          window.scrollTo(0, pos - 50);
        } else {
          window.clearInterval(scrollToTop);
        }
      }, 16);
    }
  }
}
