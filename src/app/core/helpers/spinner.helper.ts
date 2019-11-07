import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
    providedIn: 'root'
})

export class SpinnerHelper {
    constructor(
        private ngxSpinnerService: NgxSpinnerService) {
    }

    async wait(ms: number) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    showLoadingSpinner() {
        this.ngxSpinnerService.show();
    }

    async hideLoadingSpinner(waitingTime: number = 2000) {
        await this.wait(waitingTime);
        this.ngxSpinnerService.hide();
    }
}
