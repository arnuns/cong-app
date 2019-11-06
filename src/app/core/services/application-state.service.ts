import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationStateService {
  private isHiddenSearch$ = new BehaviorSubject<boolean>(false);
  private isHiddenLeftMenu$ = new BehaviorSubject<boolean>(false);

  set setIsHiddenSearch(isHiddenSearch: boolean) {
    this.isHiddenSearch$.next(isHiddenSearch);
  }

  get IsHiddenSearch() {
    return this.isHiddenSearch$;
  }

  set setIsHiddenLeftMenu(isHiddenLeftMenu: boolean) {
    this.isHiddenLeftMenu$.next(isHiddenLeftMenu);
  }

  get IsHiddenLeftMenu() {
    return this.isHiddenLeftMenu$;
  }
}
