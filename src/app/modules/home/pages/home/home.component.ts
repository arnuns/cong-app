import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { SiteService } from 'src/app/core/services/site.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  siteLoading = false;
  userLoading = false;
  totalSite = 0;
  totalUser = 0;
  constructor(
    private siteService: SiteService,
    private userService: UserService) {
    this.siteLoading = true;
    this.userLoading = true;
  }

  ngOnInit() {
    this.siteService.getCountSite().subscribe(countSite => {
      this.totalSite = countSite;
      this.siteLoading = false;
    }, error => {
      this.siteLoading = false;
    });
    this.userService.getCountUser().subscribe(countUser => {
      this.totalUser = countUser;
      this.userLoading = false;
    }, error => {
      this.userLoading = false;
    });
  }
}
