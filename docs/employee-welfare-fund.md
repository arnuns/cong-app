# Employee Welfare Fund Guide (#1383)

This feature calculates Employee Welfare Fund amounts for wages earned from 2026-10-01 and uses `cong-api-old` as the authoritative data source.

## Prepare data before opening a payroll cycle

1. Open **Site > Edit** and enable the Employee Welfare Fund for the primary site.
2. Enable the adjacent public-holiday option if the eligible wage should include eight hours of public-holiday pay when the employee actually worked on that holiday. The holiday calendar is shared by every site, while the policy and minimum wage are snapshotted from the employee's primary site for the cycle.
3. Open **Employee > Edit** and verify participation. New employees participate by default, and HR can exempt individual employees.

The payroll cycle snapshots the primary-site policy. Work at another site during the cycle does not change the EWF policy or minimum wage.

## Review and pay payroll

- The payroll-cycle EWF column shows the employee deduction.
- When income compensation is positive, enter the portion eligible for EWF. Enter `0` when none of the compensation is eligible.
- The final cycle of a month recomputes the full-month target and subtracts amounts already posted in earlier paid cycles.
- A warning icon indicates a negative adjustment. The system does not refund it automatically; HR must review the case.
- The payslip shows only employee savings. Employer contribution appears in the internal report.

## Internal report and official workbook

Open **Reports > Employee Welfare Fund**, then select the pay month, company, and submission date.

- **View summary** combines employees from every site of the selected company and shows both employee and employer amounts.
- **Download official .xlsx** downloads one company per workbook using the official template.
- The report includes paid cycles only, and downloading a workbook does not modify payroll data or mark a remittance as submitted.

Before deployment, the database administrator must apply `docs/database/1383-employee-welfare-fund.sql` from `cong-api-old` and verify that `wwwroot/templates/WfcsFormTemplate.xlsx` is present.
