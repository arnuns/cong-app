import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { User } from 'src/app/core/models/user';
import { ApplicationStateService } from 'src/app/core/services/application-state.service';
import { RoutingStateService } from 'src/app/core/services/routing-state.service';
import { FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { ElectronService } from 'ngx-electron';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit {
  @ViewChild('nfcSearchInput', { static: false }) nfcSearchInput: ElementRef;
  searching = false;
  user: User;
  isHiddenLeftMenu = false;
  isHiddenSearch = false;
  isHiddenTopMenu = false;
  searchForm = this.fb.group({
    search: ['']
  });
  nfcSearchForm = this.fb.group({
    nfcRefId: ['']
  });
  searchResults: User[] = [];
  constructor(
    private applicationStateService: ApplicationStateService,
    private authService: AuthService,
    private electronService: ElectronService,
    private fb: FormBuilder,
    private ngxSmartModalService: NgxSmartModalService,
    private userService: UserService,
    private routingStateService: RoutingStateService) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
    this.updateView();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.searchForm.get('search').valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()).subscribe(val => {
          if (val.length < 2) {
            this.searchResults = [];
            this.searching = false;
          } else {
            this.userService.getUserFilter(val, null, null, 'name', 'asc', 1, 12).subscribe(results => {
              this.searchResults = results.data;
              this.searching = false;
            }, error => {
              this.searchResults = [];
              this.searching = false;
            });
          }
        });

    this.ngxSmartModalService.getModal('searchNfcCardModal').onOpen.subscribe((event: Event) => {
      setTimeout(() => {
        this.nfcSearchInput.nativeElement.focus();
      }, 300);
    });

    this.ngxSmartModalService.getModal('searchNfcCardModal').onClose.subscribe((event: Event) => {
      this.nfcSearchForm.reset({
        nfcRefId: ''
      });
    });

    this.nfcSearchForm.get('nfcRefId').valueChanges.pipe(
      debounceTime(400), distinctUntilChanged()).subscribe(val => {
        if (val) {
          this.userService.getUserByNfcRefId(val).subscribe(user => {
            if (user) {
              this.ngxSmartModalService.getModal('searchNfcCardModal').close();
              this.viewUserInfo(String(user.empNo));
            }
          });
        }
      });
  }

  viewUserInfo(empNo: string) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('view-user', empNo);
    }
  }

  onSearchChange() {
    this.searching = true;
    this.searchResults = [];
  }

  onLogout() {
    this.authService.logoutUser();
  }

  updateView() {
    this.applicationStateService.IsHiddenLeftMenu.subscribe(isHiddenLeftMenu => {
      this.isHiddenLeftMenu = isHiddenLeftMenu;
    });
    this.applicationStateService.IsHiddenSearch.subscribe(isHiddenSearch => {
      this.isHiddenSearch = isHiddenSearch;
    });
    this.applicationStateService.IsHiddenTopMenu.subscribe(isHiddenTopMenu => {
      this.isHiddenTopMenu = isHiddenTopMenu;
    });
  }

  get previousRoute() {
    return this.routingStateService.getPreviousUrl();
  }
}
