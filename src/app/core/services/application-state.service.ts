import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationStateService {
  private isHiddenSearch$ = new BehaviorSubject<boolean>(false);
  private isHiddenLeftMenu$ = new BehaviorSubject<boolean>(false);
  private isHiddenTopMenu$ = new BehaviorSubject<boolean>(false);

  set setIsHiddenSearch(isHiddenSearch: boolean) {
    this.isHiddenSearch$.next(isHiddenSearch);
  }

  get IsHiddenSearch() {
    return this.isHiddenSearch$;
  }

  set setIsHiddenTopMenu(isHiddenTopMenu: boolean) {
    this.isHiddenTopMenu$.next(isHiddenTopMenu);
  }

  get IsHiddenTopMenu() {
    return this.isHiddenTopMenu$;
  }

  set setIsHiddenLeftMenu(isHiddenLeftMenu: boolean) {
    this.isHiddenLeftMenu$.next(isHiddenLeftMenu);
  }

  get IsHiddenLeftMenu() {
    return this.isHiddenLeftMenu$;
  }
}
