import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';

@Component({
  selector: 'app-success-dialog',
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.scss']
})
export class SuccessDialogComponent implements AfterViewInit {
  message = '';
  constructor(private ngxSmartModalService: NgxSmartModalService) { }

  ngAfterViewInit() {
    this.ngxSmartModalService.getModal('successModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
      this.message = modal.getData();
    });

    this.ngxSmartModalService.getModal('successModal').onClose.subscribe((modal: NgxSmartModalComponent) => {
      modal.setData(null, true);
      this.message = '';
    });

  }
}
