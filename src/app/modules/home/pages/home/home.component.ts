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
  activeSite = 0;
  totalSite = 0;
  activeUser = 0;
  totalUser = 0;
  constructor(
    private siteService: SiteService,
    private userService: UserService) {
    this.siteLoading = true;
    this.userLoading = true;
  }

  ngOnInit() {
    combineLatest([
      this.siteService.getCountActiveSite(),
      this.siteService.getCountSite(),
    ]).subscribe(results => {
      this.activeSite = results[0];
      this.totalSite = results[1];
      this.siteLoading = false;
    }, error => {
      this.siteLoading = false;
    });

    combineLatest([
      this.userService.getCountActiveUser(),
      this.userService.getCountUser()
    ]).subscribe(results => {
      this.activeUser = results[0];
      this.totalUser = results[1];
      this.userLoading = false;
    }, error => {
      this.userLoading = false;
    });
  }
}
