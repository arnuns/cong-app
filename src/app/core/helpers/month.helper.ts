import { Injectable } from '@angular/core';

@Injectable()

export class MonthHelper {

    months = [
        { value: 1, name: 'January', abbr: 'Jan', abbrThai: 'ม.ค.' },
        { value: 2, name: 'February', abbr: 'Feb', abbrThai: 'ก.พ.' },
        { value: 3, name: 'March', abbr: 'Mar', abbrThai: 'มี.ค.' },
        { value: 4, name: 'April', abbr: 'Apr', abbrThai: 'เม.ย.' },
        { value: 5, name: 'May', abbr: 'May', abbrThai: 'พ.ค.' },
        { value: 6, name: 'June', abbr: 'Jun', abbrThai: 'มิ.ย.' },
        { value: 7, name: 'July', abbr: 'Jul', abbrThai: 'ก.ค.' },
        { value: 8, name: 'August', abbr: 'Aug', abbrThai: 'ส.ค.' },
        { value: 9, name: 'September', abbr: 'Sep', abbrThai: 'ก.ย.' },
        { value: 10, name: 'October', abbr: 'Oct', abbrThai: 'ต.ค.' },
        { value: 11, name: 'November', abbr: 'Nov', abbrThai: 'พ.ย.' },
        { value: 12, name: 'December', abbr: 'Dec', abbrThai: 'ธ.ค.' }
    ];

    get MonthSelectList() {
        return this.months;
    }

    GetMonthAbbrName(month: number, isThai: boolean = false) {
        return isThai ? this.months.filter(m => m.value === month)[0].abbrThai : this.months.filter(m => m.value === month)[0].abbr;
    }

    GetMonthName(month: number) {
        return this.months.filter(m => m.value === month)[0].name;
    }

}
