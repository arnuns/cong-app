import { Component, PLATFORM_ID, Inject, ViewChild, ElementRef, Renderer2, OnInit, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RoutingStateService } from './core/services/routing-state.service';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('notification', { static: false }) notification: ElementRef;
  @ViewChild('message', { static: false }) message: ElementRef;
  @ViewChild('updaterLoading', { static: false }) updaterLoading: ElementRef;
  @ViewChild('restartButton', { static: false }) restartButton: ElementRef;
  title = 'Cong App';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private electronService: ElectronService,
    private renderer: Renderer2,
    private routingStateService: RoutingStateService) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('app_version');
      this.electronService.ipcRenderer.on('app_version', (event, arg) => {
        this.electronService.ipcRenderer.removeAllListeners('app_version');
      });
    }
    this.routingStateService.loadRouting();
  }

  ngAfterViewInit() {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.on('update_available', () => {
        this.electronService.ipcRenderer.removeAllListeners('update_available');
        this.message.nativeElement.innerText = 'ตรวจพบการอัปเดตเวอร์ชันใหม่';
        this.renderer.removeClass(this.notification.nativeElement, 'hidden');
      });
      this.electronService.ipcRenderer.on('update_downloaded', () => {
        this.electronService.ipcRenderer.removeAllListeners('update_downloaded');
        this.message.nativeElement.innerText = 'อัปเดตสำเร็จ! เริ่มต้นใหม่เดี๋ยวนี้?';
        this.renderer.removeClass(this.restartButton.nativeElement, 'hidden');
        this.renderer.removeClass(this.notification.nativeElement, 'hidden');
        this.renderer.addClass(this.updaterLoading.nativeElement, 'hidden');
      });
    }
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

  closeNotification() {
    this.renderer.addClass(this.notification.nativeElement, 'hidden');
  }

  restartApp() {
    this.electronService.ipcRenderer.send('restart_app');
  }
}
