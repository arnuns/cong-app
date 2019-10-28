import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retryWhen, take, delay, concatMap } from 'rxjs/operators';

@Injectable()

export class TokenInterceptor implements HttpInterceptor {
    constructor(private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentUser = JSON.parse(sessionStorage.getItem('user'));
        if (currentUser && currentUser.token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentUser.token}`
                }
            });
        }
        return next.handle(request)
            .pipe(
                retryWhen(errors => errors.pipe(concatMap((error, index) => {
                    return throwError(error);
                }))),
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        if (!this.router.url.includes('/login')) {
                            this.router.navigate(['/login']);
                        }
                    } else if (error.status === 403) {
                        if (!this.router.url.includes('/home')) {
                            this.router.navigate(['/home']);
                        }
                    }
                    return throwError(error);
                })
            ) as any;
    }

}
