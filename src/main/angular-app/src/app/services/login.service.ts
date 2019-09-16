import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

declare global {
  interface Window {
    tokenHost: string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  urlRoot = window.tokenHost || (location.origin + '/oauth2/token');

  constructor(private $http: HttpClient) { }

  getAccess(creds: any) {
    if (!creds) {
      return of({ responseJSON: { error_description: 'Credentials are required' } });
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.$http.post(this.urlRoot, creds, { headers });
  }

  getRefresh(creds: any) {
    if (!creds) {
      return of({ responseJSON: { error_description: 'Credentials are required' } });
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.$http.post(this.urlRoot, creds, { headers });
  }

  getCookie() {
    const matches = document.cookie.match(new RegExp(
      '(?:^|; )authorization=([^;]*)'));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  clearCookie() {
    document.cookie = 'authorization=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;';
  }

  checkCookie(data) {
    const auth = data ? data : this.getCookie();
    if (!auth) {
      return of({ responseJSON: { error_description: 'No authorization cookie was found' } });
    }

    return of(JSON.parse(atob(auth)));
  }
}
