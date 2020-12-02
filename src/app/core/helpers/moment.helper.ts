import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
moment.tz.setDefault('Asia/Bangkok');
@Injectable()

export class MomentHelper {
    defaultFormatWithoutTs = 'YYYY-MM-DDT00:00:00Z';
    defaultFormatWithTs = 'YYYY-MM-DDTHH:mm:ssZ';

    formatISO8601(input, withTs = false) {
        return moment(input).format(withTs ? this.defaultFormatWithTs : this.defaultFormatWithoutTs);
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
