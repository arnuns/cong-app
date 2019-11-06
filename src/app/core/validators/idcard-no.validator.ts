import { FormGroup } from '@angular/forms';

export function IDCardNumber(controlName: string) {
    function checkID(value) {
        if (value === undefined || value === '' || value === null || value.length !== 13) { return false; }
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseFloat(value.charAt(i)) * (13 - i);
        }
        if ((11 - sum % 11) % 10 !== parseFloat(value.charAt(12))) {
            return false;
        } return true;
    }

    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        if (control.errors) {
            return;
        }
        if (!checkID(control.value)) {
            control.setErrors({ mustMatch: true });
        }
    };
}
