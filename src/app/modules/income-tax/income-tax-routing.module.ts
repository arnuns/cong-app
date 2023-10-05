import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IncomeTaxComponent } from './pages/income-tax/income-tax.component';

const routes: Routes = [
  {
    path: '',
    component: IncomeTaxComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncomeTaxRoutingModule { }
