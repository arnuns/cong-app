import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { UserService } from 'src/app/core/services/user.service';
import { Document } from 'src/app/core/models/user';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnDestroy, OnInit {
  empNo: number;
  documentId: number;
  document: Document;
  sub: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private spinner: SpinnerHelper,
    private userService: UserService) {
    this.updateView();
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.empNo = Number(params['empNo']);
      this.documentId = Number(params['documentId']);
    });
  }

  ngOnInit() {
    this.spinner.showLoadingSpinner();
    this.userService.getDocument(this.empNo, this.documentId).subscribe(document => {
      this.document = document;
      this.spinner.hideLoadingSpinner(0);
    }, error => {
      this.spinner.hideLoadingSpinner(0);
    });
  }

  ngOnDestroy() {
    this.applicationStateService.setIsHiddenLeftMenu = false;
    this.applicationStateService.setIsHiddenSearch = false;
    this.applicationStateService.setIsHiddenTopMenu = false;
  }

  updateView() {
    this.applicationStateService.setIsHiddenLeftMenu = true;
    this.applicationStateService.setIsHiddenSearch = true;
    this.applicationStateService.setIsHiddenTopMenu = true;
  }

}
