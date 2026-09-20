import { EmployeeWelfareFundComponent } from './pages/employee-welfare-fund/employee-welfare-fund.component';
import { employeeWelfareFundRoutes } from './employee-welfare-fund-routing.module';

describe('EmployeeWelfareFundRoutingModule', () => {
  it('renders the Employee Welfare Fund page at the module root', () => {
    expect(employeeWelfareFundRoutes).toContain({
      path: '',
      component: EmployeeWelfareFundComponent
    });
  });
});
