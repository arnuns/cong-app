import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()

export class MomentHelper {
    defaultFormatWithoutTs = 'YYYY-MM-DDT00:00:00Z';

    formatISO8601(input) {
        return moment(input).format(this.defaultFormatWithoutTs);
    }

    formatDate(input) {
        return moment(input).format('YYYY-MM-DD 23:59:59');
    }

    format(input, format) {
        return moment(input).format(format);
    }

    toDate(input, format) {
        return moment(input, format).toDate();
    }
}
