import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnDestroy, OnInit, AfterViewInit {
  defaultImagePath = environment.basePath;
  empNo: number;
  sub: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService
  ) {
    this.updateView();
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.empNo = Number(params['empNo']);
    });
  }

  ngOnDestroy() {
    this.applicationStateService.setIsHiddenLeftMenu = false;
    this.applicationStateService.setIsHiddenSearch = false;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  updateView() {
    this.applicationStateService.setIsHiddenLeftMenu = true;
    this.applicationStateService.setIsHiddenSearch = true;
  }

}
