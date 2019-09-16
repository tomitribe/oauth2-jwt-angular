import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: `
    <p>Logging out</p>
  `,
  styles: []
})
export class LogoutComponent implements OnInit {

  constructor(private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    const loggedOut = this.authService.logout();
    if (loggedOut) {
      this.router.navigate(['/login']);
    }
  }

}
