import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'safe'
})
export class SafePipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(value: string, context: number = 0) {
        let result: string;
        switch (context) {
            case SecurityContext.RESOURCE_URL:
                result = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, value);
                break;
            case SecurityContext.URL:
                result = this.sanitizer.sanitize(SecurityContext.URL, value);
                break;
            case SecurityContext.SCRIPT:
                result = this.sanitizer.sanitize(SecurityContext.SCRIPT, value);
                break;
            case SecurityContext.STYLE:
                result = this.sanitizer.sanitize(SecurityContext.STYLE, value);
                break;
            case SecurityContext.HTML:
                result = this.sanitizer.sanitize(SecurityContext.HTML, value);
                break;
            default:
                result = this.sanitizer.sanitize(SecurityContext.NONE, value);
                break;
        }
        return result;
    }

}
