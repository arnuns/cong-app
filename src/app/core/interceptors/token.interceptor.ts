import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, retryWhen, concatMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth/auth.service';
import { User } from '../models/user';

@Injectable()

export class TokenInterceptor implements HttpInterceptor {
    user: User;
    constructor(
        private authService: AuthService,
        private router: Router) {
        this.authService.currentUser.subscribe(user => {
            this.user = user;
        });
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.user && this.user.token) {
            request = request.clone({
                setHeaders: {
                    'Authorization': `Bearer ${this.user.token}`,
                    'api-version': environment.apiVersion
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
