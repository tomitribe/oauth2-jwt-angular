import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @HostBinding('class.ux-login') true;

  submitted = false;
  grant_type = 'password';
  deployUrl = environment.test ? '' : 'app/'

  constructor(
    private $auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onSubmit({ form }) {
    this.$auth.login({
      ...form.value
      // , client_id: 'testtest', client_secret: 'testtest'
    })
      .pipe(
        tap(loggedIn => {
          this.router.navigate(['/main', 1]);
        }),
        catchError(() => (error: HttpErrorResponse) => of(error)),
        tap(() => this.submitted = true)
      ).subscribe((data) => {
      });
  }
}
