import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  user: {
    username: string,
    email: string;
  };

  constructor(private $auth: AuthService) { }

  ngOnInit() {
    this.$auth.$authData.subscribe(({ username, email }) => {
      this.user = { username, email };
    });
  }

}
