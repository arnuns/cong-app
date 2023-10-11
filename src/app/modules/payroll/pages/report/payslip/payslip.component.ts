import { Component, OnInit, OnDestroy } from "@angular/core";
import { environment } from "src/environments/environment";
import { PayrollCycle, Salary } from "src/app/core/models/payroll";
import { ActivatedRoute } from "@angular/router";
import { ElectronService } from "ngx-electron";
import { PayrollService } from "src/app/core/services/payroll.service";
import { CacheService } from "src/app/core/services/cache/cache.service";
import { ApplicationStateService } from "src/app/core/services/application-state.service";
import { SpinnerHelper } from "src/app/core/helpers/spinner.helper";
import { UserIncomeTax } from "src/app/core/models/user-income-tax.model";
import { catchError, map, switchMap } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-payslip",
  templateUrl: "./payslip.component.html",
  styleUrls: ["./payslip.component.scss"],
})
export class PayslipComponent implements OnDestroy, OnInit {
  public baseImagePath = environment.basePath;
  payrollCycle: PayrollCycle;
  userSalarys: Salary[] = [];
  salary: number;
  userIncomeTaxes: UserIncomeTax[] = [];
  thaiMonth = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  companyReportHeader = {
    FullName: environment.companyFullName,
    FullNameEn: environment.companyFullNameEn,
    Address1: environment.companyAddress1,
    Address2: environment.companyAddress2,
    Tel: environment.companyTel,
    Fax: environment.companyFax,
    Mobile: environment.companyMobile,
    Email: environment.companyEmail,
    Website: environment.companyWebsite,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private applicationStateService: ApplicationStateService,
    private electronService: ElectronService,
    private payrollService: PayrollService,
    private cacheService: CacheService,
    private spinner: SpinnerHelper
  ) {
    document.body.style.backgroundColor = "#ffffff";
    this.updateView();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      const payrollCycleId = Number(params["id"]);
      const siteId = Number(params["siteid"]);
      this.spinner.showLoadingSpinner();
      const payrollCycle = this.cacheService.get(
        `payrollCycle_${payrollCycleId}`,
        this.payrollService.getPayrollCycle(payrollCycleId),
        50000
      );
      payrollCycle
        .pipe(
          switchMap((payrollCycle) => {
            this.payrollCycle = payrollCycle;
            return this.payrollService.getSitePayrollCycleSalaryPayslip(
              payrollCycleId,
              siteId
            );
          }),
          catchError((_) => of([]))
        )
        .subscribe((salaries) => {
          this.userSalarys = salaries.filter((s) => s.siteId === siteId);
          if (this.userSalarys.length > 0) {
            const payDay = new Date(
              this.userSalarys.filter((us) => us.payDay)[0].payDay
            );
            this.payrollService
              .getUserIncomeTaxSumByMonth(
                payDay.getFullYear(),
                payDay.getMonth() + 1,
                siteId
              )
              .subscribe(
                (userIncomeTaxes) => {
                  this.userIncomeTaxes = userIncomeTaxes.filter(uit => new Date(uit.payrollDate).getTime() <= payDay.getTime());
                  this.spinner.hideLoadingSpinner();
                  if (this.electronService.isElectronApp) {
                    setTimeout(
                      () =>
                        this.electronService.ipcRenderer.send("print-to-pdf"),
                      5000
                    );
                  }
                },
                (error) => {
                  this.spinner.hideLoadingSpinner(0);
                }
              );
          } else {
            this.spinner.hideLoadingSpinner();
          }
        });
    });
  }

  ngOnDestroy() {
    this.applicationStateService.setIsHiddenLeftMenu = false;
    this.applicationStateService.setIsHiddenSearch = false;
    this.applicationStateService.setIsHiddenTopMenu = false;
  }

  updateView() {
    this.applicationStateService.setIsHiddenLeftMenu = true;
    this.applicationStateService.setIsHiddenSearch = true;
    this.applicationStateService.setIsHiddenTopMenu = true;
  }

  getAccumulatedIncome(empNo) {
    if (this.userIncomeTaxes.length <= 0) {
      return 0;
    }
    return this.userIncomeTaxes
      .filter((t) => t.empNo === Number(empNo))
      .map((t) => t.income)
      .reduce((a, b) => a + b, 0);
  }

  getAccumulatedTaxes(empNo) {
    if (this.userIncomeTaxes.length <= 0) {
      return 0;
    }
    return this.userIncomeTaxes
      .filter((t) => t.empNo === Number(empNo))
      .map((t) => t.tax)
      .reduce((a, b) => a + b, 0);
  }

  setTwoNumberDecimal($event) {
    $event.target.value = parseFloat($event.target.value).toFixed(2);
  }

  convertToDateString(dateString: string): string {
    if (dateString === "" || dateString === null || dateString === undefined) {
      return "";
    }
    const date = new Date(dateString);
    return `${date.getDate()} ${this.thaiMonth[date.getMonth()]} ${
      date.getFullYear() + 543
    }`;
  }

  convertToStartEndDateString(start: string, end: string): string {
    if (
      start === "" ||
      start === null ||
      start === undefined ||
      end === "" ||
      end === null ||
      end === undefined
    ) {
      return "";
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.getDate()} - ${endDate.getDate()} ${
      this.thaiMonth[endDate.getMonth()]
    } ${endDate.getFullYear() + 543}`;
  }
}
