import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
    name: 'storageUrl'
})
export class StorageUrlPipe implements PipeTransform {
    storageBucketUrl: string;
    constructor() {
        this.storageBucketUrl = environment.storageBucketUrl;
    }

    transform(value: string) {
        return `${this.storageBucketUrl}/${value}`;
    }

}
