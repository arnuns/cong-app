import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SiteComponent } from './pages/site/site.component';
import { EditSiteComponent } from './pages/edit-site/edit-site.component';
import { AddSiteComponent } from './pages/add-site/add-site.component';


const routes: Routes = [
  {
    path: '',
    component: SiteComponent
  },
  {
    path: 'edit/:siteId',
    component: EditSiteComponent,
  },
  {
    path: 'add',
    component: AddSiteComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteRoutingModule { }
