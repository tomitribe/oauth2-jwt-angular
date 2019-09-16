import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-js-decode/dist/jwt-js-decode.min.js';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { LoginService } from './login.service';
import { ToasterService } from './toaster.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authData: {
    auth: boolean,
    username: string,
    email: string
    groups: string,
    jug: string,

    access_token: string,
    access_exp: number,

    token_type: string,
    expires_in: string,

    refresh_token: string,
    refresh_exp: number
  };

  defaults = {
    auth: false,
    username: '',
    email: '',
    groups: '',
    jug: '',

    access_token: '',
    access_exp: '',

    token_type: '',
    expires_in: '',

    refresh_token: '',
    refresh_exp: ''
  };

  checkRefStatus = false;
  loggingOut = false;

  authHeader = 'authorization';
  authPrefix = 'bearer';
  authToken = '';

  $authStatus = new BehaviorSubject(false);
  $authData = new BehaviorSubject(this.defaults);

  constructor(
    private $login: LoginService,
    private $toaster: ToasterService,
    private router: Router
  ) {
    const data = this.get();
    this.set(data ? JSON.parse(data) : { ... this.defaults });
  }

  isAuthenticated(): boolean {
    return this.authData != null && !this.isTokenExpired();
  }

  get(): string {
    return localStorage.getItem('authorization');
  }

  set(data: any): void {
    this.authData = data;
    this.authToken = data && data.access_token;
    this.$authStatus.next(data && data.auth);
    this.$authData.next(data);
  }

  save(): void {
    localStorage.setItem('authorization', JSON.stringify(this.authData));
  }

  clear(): void {
    this.set({ ... this.defaults });
  }


  isTokenExpired(): boolean {
    return this.isAccessTokenExpired() && this.isRefreshTokenExpired();
  }

  isAccessTokenExpired(): boolean {
    return Date.now() > this.authData.access_exp;
  }

  isRefreshTokenExpired(): boolean {
    return Date.now() > this.authData.refresh_exp;
  }

  logoutAndWarn(e?) {
    if (this.loggingOut) {
      return;
    }
    this.loggingOut = true;

    setTimeout(() => {
      this.loggingOut = false;
      this.$toaster.warn(e.reason || 'Your access has expired', e.title);
    }, 300);

    this.router.navigate(['/logout']);
  }

  checkRefresh() {
    if (this.checkRefStatus) {
      return;
    }

    this.checkRefStatus = true;
    if (this.isAuthenticated()) {
      if (this.isAccessTokenExpired()) {
        if (this.isRefreshTokenExpired()) {
          this.logoutAndWarn();
        } else {
          return this.refresh();
        }
      }
    }
    this.checkRefStatus = false;
  }

  login(creds) {
    const paramsCreds = new HttpParams({
      fromObject: creds
    });

    return this.$login.getAccess(paramsCreds)
      .pipe(switchMap((resp) => {
        this.parseResp(resp);
        this.save();
        return this.$authStatus;
      }));
  }

  logout(): boolean {
    this.parseResp();
    this.save();
    return !this.isAuthenticated();
  }

  refresh(): any {
    return this.$authData.pipe(
      take(1),
      switchMap((authData) => {
        const { refresh_token } = authData;

        if (!refresh_token) {
          return of('no token to refresh');
        }
        const creds = new HttpParams({
          fromObject: {
            refresh_token,
            grant_type: 'refresh_token'
          }
        });
        return this.$login.getRefresh(creds)
          .pipe(
            switchMap((resp) => {
              this.parseResp(resp);
              this.save();
              return this.$authStatus;
            })
          );
      })
    );
  }

  parseResp(resp?) {
    if (typeof resp === 'string') {
      try {
        const json = JSON.parse(resp);
        resp = json;
      } catch (e) {

      }
    }

    if (!resp || !resp.hasOwnProperty('access_token')) {
      return this.set({ ... this.defaults });
    }
    const accessToken = jwtDecode(resp.access_token).payload;
    const refreshToken = resp.hasOwnProperty('refresh_token') ? jwtDecode(resp.refresh_token).payload : false;

    const possessorKey = resp.key;
    const possessorKeyId = possessorKey && JSON.parse(atob(possessorKey)).kid;

    if (accessToken) {
      const accessExp = accessToken.exp * 1000;
      const refreshExp = refreshToken ? refreshToken.exp * 1000 : null;
      this.set({
        auth: true,
        username: accessToken.username,
        email: accessToken.email,
        groups: accessToken.groups,
        jug: accessToken.jug,

        access_token: resp.access_token,
        possessor_key: possessorKey,
        possessor_key_id: possessorKeyId,
        access_exp: accessExp,

        token_type: resp.token_type,
        expires_in: resp.expires_in,

        refresh_token: resp.refresh_token,
        refresh_exp: refreshExp
      });
    } else {
      this.set({ ... this.defaults });
    }
  }

}
