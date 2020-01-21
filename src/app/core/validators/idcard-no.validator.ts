import { FormGroup, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Observable, of, } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user';

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

export function existingIDCardNumberValidator(userService: UserService, currentUser: User = null): AsyncValidatorFn {
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

    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
        if (!checkID(control.value)) {
            return of({ mustMatch: true });
        } else {
            return userService.getUserByIdCardNumber(control.value).pipe(map(
                user => {
                    if (currentUser) {
                        return user && currentUser && currentUser.idCardNumber !== user.idCardNumber
                            ? { idCardNumberExists: true } : null;
                    } else {
                        return user ? { idCardNumberExists: true } : null;
                    }
                }
            ), catchError(err => of(null)));
        }
    };
}
