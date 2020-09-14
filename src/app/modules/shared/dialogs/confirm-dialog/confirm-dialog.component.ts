import { Component, AfterViewInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements AfterViewInit {
  data: any;
  constructor(private ngxSmartModalService: NgxSmartModalService) { }

  ngAfterViewInit() {
    this.ngxSmartModalService.getModal('confirmModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
      this.data = modal.getData();
    });

    this.ngxSmartModalService.getModal('confirmModal').onClose.subscribe((modal: NgxSmartModalComponent) => {
      this.data = undefined;
    });
  }

  onConfirm() {
    this.data.isSuccess = true;
    this.ngxSmartModalService.getModal('confirmModal').setData(this.data, true);
    this.ngxSmartModalService.getModal('confirmModal').close();
  }
}
