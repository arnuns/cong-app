export class DatePicker {
    day: number;
    month: number;
    year: number;
    constructor(
        day: number,
        month: number,
        year: number
    ) {
        this.day = day;
        this.month = month;
        this.year = year;
    }
}

export class TimePicker {
    hour: number;
    minute: number;
    second: number;
    constructor(hour: number, minute: number, second: number) {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    }
}
