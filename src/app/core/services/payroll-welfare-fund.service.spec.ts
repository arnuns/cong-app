import {HttpClient, HttpClientModule} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {PayrollService} from './payroll.service';

describe('PayrollService Employee Welfare Fund', () => {
  let service: PayrollService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientModule, HttpClientTestingModule]});
    const http = TestBed.get(HttpClient);
    service = new PayrollService(null, null, http, {get: () => ''} as any);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the company summary for the selected pay month', () => {
    service.getEmployeeWelfareFundSummary(2026, 10, 'GSF').subscribe();

    const request = httpMock.expectOne(requestUrl =>
      requestUrl.url.endsWith('/payroll/employee-welfare-fund/2026/10/GSF'));
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('downloads the official workbook with an explicit submission date', () => {
    service.downloadEmployeeWelfareFundReport(2026, 10, 'GSF', '2026-11-15').subscribe();

    const request = httpMock.expectOne(requestUrl =>
      requestUrl.url.endsWith('/payroll/employee-welfare-fund/2026/10/GSF/export') &&
      requestUrl.params.get('submissionDate') === '2026-11-15');
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob());
  });

  it('previews a salary using the authoritative welfare fund endpoint', () => {
    const payload = {empNo: 7, siteSalaries: []};

    service.previewEmployeeWelfareFund(12, 3, 45, payload).subscribe();

    const request = httpMock.expectOne(requestUrl =>
      requestUrl.url.endsWith('/payroll/12/site/3/salary/45/employee-welfare-fund/preview'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(payload);
    request.flush({eligibleWage: 0, rate: 0, employeeSavings: 0, employerContribution: 0, requiresReview: false});
  });
});
