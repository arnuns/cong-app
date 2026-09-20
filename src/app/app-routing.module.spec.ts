import { AuthGuardService } from './core/services/auth/auth-guard.service';
import { routes } from './app-routing.module';
import { LayoutComponent } from './modules/shared/pages/layout/layout.component';

describe('AppRoutingModule', () => {
  it('exposes Employee Welfare Fund through the authenticated application shell', () => {
    const applicationShell = routes.find(route => route.component === LayoutComponent);
    const employeeWelfareFundRoute = applicationShell.children.find(
      route => route.path === 'employee-welfare-fund');

    expect(employeeWelfareFundRoute).toBeDefined();
    expect(employeeWelfareFundRoute && employeeWelfareFundRoute.canLoad).toEqual([AuthGuardService]);
  });
});
