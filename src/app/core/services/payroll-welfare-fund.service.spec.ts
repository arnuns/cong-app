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
});
