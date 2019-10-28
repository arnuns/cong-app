import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  user: User;
  constructor(private authService: AuthService) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
  }

  ngOnInit() {
  }

  onLogout() {
    this.authService.logoutUser();
  }

}
