import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authService: { currentUserValue: any; getLoginUrl: string };
  let guard: AuthGuard;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = {
      currentUserValue: undefined,
      getLoginUrl: '/login'
    };
    router = jasmine.createSpyObj('Router', ['navigate']);

    guard = new AuthGuard(router, authService as any);
  });

  it('allows an authenticated user without redirecting', () => {
    authService.currentUserValue = { empNo: 1001 };

    const result = guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects an unauthenticated user to the configured login URL', () => {
    const result = guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(true);
  });
});
