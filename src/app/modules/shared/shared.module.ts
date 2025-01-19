import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from './pages/layout/layout.component';
import { HttpClientModule } from '@angular/common/http';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import { SafePipe } from 'src/app/core/pipes/safe.pipe';
import { NgxElectronModule } from 'ngx-electron';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { thLocale } from 'ngx-bootstrap/locale';
import { MomentHelper } from 'src/app/core/helpers/moment.helper';
import { MonthHelper } from 'src/app/core/helpers/month.helper';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CookieService } from 'ngx-cookie-service';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { ConfirmNewDialogComponent } from './dialogs/confirm-new-dialog/confirm-new-dialog.component';
import { SuccessDialogComponent } from './dialogs/success-dialog/success-dialog.component';
import { StorageUrlPipe } from 'src/app/core/pipes/storage-url.pipe';

@NgModule({
  declarations: [
    LayoutComponent,
    SafePipe,
    StorageUrlPipe,
    ConfirmDialogComponent,
    ConfirmNewDialogComponent,
    SuccessDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    AlertModule.forRoot(),
    NgSelectModule,
    NgxSpinnerModule,
    NgxElectronModule,
    NgxSmartModalModule.forRoot(),
    DataTablesModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    TabsModule.forRoot(),
    PdfViewerModule,
    NgxQRCodeModule,
    RoundProgressModule
  ],
  providers: [
    MomentHelper,
    MonthHelper,
    SpinnerHelper,
    CookieService
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SafePipe,
    StorageUrlPipe,
    AlertModule,
    NgSelectModule,
    NgxSpinnerModule,
    NgxElectronModule,
    NgxSmartModalModule,
    DataTablesModule,
    BsDatepickerModule,
    TimepickerModule,
    BsDropdownModule,
    ButtonsModule,
    TabsModule,
    PdfViewerModule,
    NgxQRCodeModule,
    RoundProgressModule,
    ConfirmDialogComponent,
    ConfirmNewDialogComponent,
    SuccessDialogComponent
  ]
})
export class SharedModule {
  constructor(localeService: BsLocaleService) {
    defineLocale('th', thLocale);
    localeService.use('th');
  }

  static forRoot() {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
