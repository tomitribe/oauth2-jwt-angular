import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

class RetryHttpRequest extends HttpRequest<any> {
  $$noAuth: boolean;
  $$retry: boolean;
}

@Injectable()
export class NoAuthHeaderInterceptor implements HttpInterceptor {
  constructor(private $auth: AuthService) { }
  intercept(req: RetryHttpRequest, next: HttpHandler): Observable<any> {
    if (!this.$auth.authToken
      || req.url.includes('/oauth2/token')) {
      req.$$noAuth = true;
      return next.handle(req);
    }

    return next.handle(req);
  }
}

@Injectable()
export class OauthHeaderInterceptor implements HttpInterceptor {
  constructor(private $auth: AuthService) { }
  signRequest(req) {
    return req.clone({
      headers:
        req.headers.set(this.$auth.authHeader,
          `${this.$auth.authPrefix} ${this.$auth.authToken}`)
    });
  }
  intercept(req: RetryHttpRequest, next: HttpHandler): Observable<any> {
    if (req.$$noAuth) {
      return next.handle(req);
    }

    return next.handle(this.signRequest(req));
  }
}

@Injectable()
export class RetryHeaderInterceptor implements HttpInterceptor {
  constructor(private $auth: AuthService) { }
  intercept(req: RetryHttpRequest, next: HttpHandler): Observable<any> {
    if (req.$$retry) {
      req.$$retry = false;
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let data = {};
        data = {
          title: error && error.error && error.error.error ? error.error.error : error.statusText,
          reason: error && error.error && error.error.error_description ? error.error.error_description : (error.message || ''),
          status: error.status
        };
        if (error.status === 401) {
          return this.$auth.refresh()
            .pipe(
              filter(auth => !!auth),
              switchMap((auth) => {
                const headers = req.headers
                  .set(this.$auth.authHeader,
                    `${this.$auth.authPrefix} ${this.$auth.authToken}`);
                const clone = req.clone({ headers }) as RetryHttpRequest;
                clone.$$retry = true;
                clone.$$noAuth = true;
                return next.handle(clone);
              })
            );
        } else {
          if (error.status === 400 && req.$$noAuth) {
            this.$auth.logoutAndWarn(data);
          }
          return throwError(data);
        }
      })
    );
  }
}

export const HeaderInterceptors = [
  { provide: HTTP_INTERCEPTORS, useClass: NoAuthHeaderInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: OauthHeaderInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: RetryHeaderInterceptor, multi: true },
];
