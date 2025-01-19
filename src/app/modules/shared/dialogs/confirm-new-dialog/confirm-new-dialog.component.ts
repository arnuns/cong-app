import { Component, AfterViewInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';

@Component({
  selector: 'app-confirm-new-dialog',
  templateUrl: './confirm-new-dialog.component.html',
  styleUrls: ['./confirm-new-dialog.component.scss']
})
export class ConfirmNewDialogComponent implements AfterViewInit {
  data: any;
  constructor(private ngxSmartModalService: NgxSmartModalService) { }

  ngAfterViewInit() {
    this.ngxSmartModalService.getModal('confirmNewModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
      this.data = modal.getData();
    });

    this.ngxSmartModalService.getModal('confirmNewModal').onClose.subscribe((_: NgxSmartModalComponent) => {
      this.data = undefined;
    });
  }

  onConfirm() {
    this.data.isSuccess = true;
    this.ngxSmartModalService.getModal('confirmNewModal').setData(this.data, true);
    this.ngxSmartModalService.getModal('confirmNewModal').close();
  }
}
