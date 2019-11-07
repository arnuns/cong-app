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
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';

@NgModule({
  declarations: [
    LayoutComponent,
    SafePipe,
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
    DataTablesModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
  ],
  providers: [
    MomentHelper,
    SpinnerHelper,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SafePipe,
    AlertModule,
    NgSelectModule,
    NgxSpinnerModule,
    NgxElectronModule,
    DataTablesModule,
    BsDatepickerModule,
    BsDropdownModule
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
