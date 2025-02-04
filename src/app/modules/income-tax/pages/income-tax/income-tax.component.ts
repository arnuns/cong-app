import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { DataTableDirective } from "angular-datatables";
import { Papa } from "ngx-papaparse";
import { NgxSmartModalService } from "ngx-smart-modal";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { MomentHelper } from "src/app/core/helpers/moment.helper";
import { SpinnerHelper } from "src/app/core/helpers/spinner.helper";
import { Site } from "src/app/core/models/site";
import {
  UserIncomTaxFilter,
  UserIncomeTax,
} from "src/app/core/models/user-income-tax.model";
import { ApplicationStateService } from "src/app/core/services/application-state.service";
import { PayrollService } from "src/app/core/services/payroll.service";
import { SiteService } from "src/app/core/services/site.service";
import { UserService } from "src/app/core/services/user.service";
import * as FileSaver from "file-saver";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-income-tax",
  templateUrl: "./income-tax.component.html",
  styleUrls: ["./income-tax.component.scss"],
})
export class IncomeTaxComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild(DataTableDirective, { static: false })
  private datatableElement: DataTableDirective;
  nameMonths: any[] = [];
  nameYears: any[] = [];
  sites: Site[] = [];
  userIncomeTaxes: UserIncomeTax[] = [];
  userIncomeTaxFilter: UserIncomTaxFilter;
  filterSessionName = "userIncomeTaxFilter";
  incomeTaxForm = this.fb.group({
    income_tax_type: ["ภงด1"],
    month_name: [undefined],
    year_name: [undefined],
    search: [""],
    site_id: [undefined],
  });
  dtTrigger = new Subject();
  dtOptions: DataTables.Settings = {};
  lastNYear = 2;

  constructor(
    private applicationStateService: ApplicationStateService,
    private fb: FormBuilder,
    private moment: MomentHelper,
    private ngxSmartModalService: NgxSmartModalService,
    private papa: Papa,
    private payrollService: PayrollService,
    private spinner: SpinnerHelper,
    private siteService: SiteService,
    private userService: UserService
  ) {
    this.updateView();
  }

  ngAfterViewInit() {
    this.incomeTaxForm
      .get("search")
      .valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((val) => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
      });

    this.incomeTaxForm.get("income_tax_type").valueChanges.subscribe((val) => {
      if (String(val) === "ภงด1ก") {
        this.incomeTaxForm.get("site_id").setValue(undefined);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userIncomeTaxFilter) {
      localStorage.setItem(
        this.filterSessionName,
        JSON.stringify(this.userIncomeTaxFilter)
      );
    }
    this.applicationStateService.setIsHiddenSearch = false;
  }

  ngOnInit() {
    this.spinner.showLoadingSpinner();
    this.initDateControl();
    this.initialData();
    this.siteService.getSites().subscribe((sites) => {
      this.sites = sites;
      this.refreshTable();
      this.spinner.hideLoadingSpinner(0);
    });
  }

  onIncomeTaxTypeChange(data) {
    this.refreshTable();
  }

  onMonthSelectionChange(data) {
    this.refreshTable();
  }

  onSiteSelectionChange(data) {
    this.refreshTable();
  }

  onExport() {
    this.spinner.showLoadingSpinner();
    const monthNameArray = this.userIncomeTaxFilter.monthName
      ? this.userIncomeTaxFilter.monthName.split(",")
      : undefined;
    const isMonthly = this.userIncomeTaxFilter.incomeTaxType == "ภงด1";
    let data = [];
    const payrollDate = isMonthly
      ? this.getLastDateOfMonth(
          Number(monthNameArray[0]),
          Number(monthNameArray[1])
        )
      : this.moment.currentDate.toDate();
    this.payrollService
      .getUserIncomeTaxFilter(
        this.userIncomeTaxFilter.incomeTaxType,
        this.userIncomeTaxFilter.search,
        isMonthly
          ? Number(monthNameArray[0])
          : Number(this.userIncomeTaxFilter.yearName),
        isMonthly ? Number(monthNameArray[1]) : undefined,
        this.userIncomeTaxFilter.siteId,
        this.userIncomeTaxFilter.sort_by,
        this.userIncomeTaxFilter.sort_column,
        1,
        10000
      )
      .subscribe(
        (result) => {
          const csvData = result.data
            .sort((a, b) => {
              if (a.siteId !== b.siteId) {
                return a.siteId - b.siteId;
              }
              const firstNameComparison = a.employeeFirstName.localeCompare(
                b.employeeFirstName
              );
              if (firstNameComparison !== 0) {
                return firstNameComparison;
              }
              return a.employeeLastName.localeCompare(b.employeeLastName);
            })
            .map((d, index) => ({
              fix01: this.padLeft(index + 1, 4),
              companyTax: environment.companyTax,
              blank01: "401N",
              blank02: "00000",
              employeeIdCardNumber: d.employeeIdCardNumber,
              blank03: "",
              title: d.employeeTitle,
              firstName: d.employeeFirstName,
              lastName: d.employeeLastName,
              blank04: "",
              blank05: "",
              blank06: "",
              dateOfMonth: this.moment.format(payrollDate, "MM"),
              year: this.moment.format(payrollDate, "YYYY"),
              fix02: "1",
              payrollDate: this.moment.format(payrollDate, "DDMMYYYY"),
              fix03: "100",
              income: d.income.toFixed(2),
              tax: d.tax.toFixed(2),
              fix04: "1",
            }));
          const csv = this.papa.unparse(csvData, {
            delimiter: "|",
            header: false,
          });
          const BOM = "\uFEFF";
          const blob = new Blob([BOM + csv], {
            type: "text/csv;charset=utf-8",
          });
          FileSaver.saveAs(
            blob,
            `income_tax_${
              this.userIncomeTaxFilter.incomeTaxType
            }_${this.moment.format(new Date(), "YYYYMMDDHHmmss")}.csv`
          );
          this.spinner.hideLoadingSpinner();
          // result.data;
        },
        (error) => {
          this.spinner.hideLoadingSpinner();
        }
      );
  }

  refreshTable() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(0);
      dtInstance.ajax.reload(null, false);
    });
  }

  initialData() {
    const that = this;
    that.dtOptions = {
      autoWidth: false,
      dom: "tr<'d-flex align-items-center w-100 mt-4'<l><'ml-auto pr-2'i><p>'>",
      lengthMenu: [50, 100, 200, 400],
      language: {
        emptyTable: "<strong>0</strong> data(s) returned",
        info: "Viewing <strong>_START_-_END_</strong> of <strong>_TOTAL_</strong>",
        infoEmpty: "No data(s) to show",
        infoFiltered: "",
        infoPostFix: "",
        lengthMenu: "_MENU_",
        paginate: {
          first: "",
          last: "",
          next: "<img class='paging-arrow' src='assets/img/ico-arrow-right.png'>",
          previous:
            "<img class='paging-arrow' src='assets/img/ico-arrow-left.png'>",
        },
      },
      order: [[1, "asc"]],
      pageLength: 50,
      pagingType: "simple",
      serverSide: true,
      processing: true,
      ajax: ({}: any, callback) => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          const orders = Object.values(dtInstance.order()[0]);
          const sortBy = String(orders[1]);
          let sortColumn = "name";
          if (orders[0] === 1) {
            sortColumn = "name";
          }
          //  else if (orders[0] === 2) {
          //   sortColumn = "payrollDate";
          // }
          else if (orders[0] === 2) {
            sortColumn = "income";
          } else if (orders[0] === 3) {
            sortColumn = "tax";
          } else {
            sortColumn = "idCardNo";
          }
          const userIncomeTaxFilterString = localStorage.getItem(
            that.filterSessionName
          );
          if (userIncomeTaxFilterString) {
            const storageUserIncomeTaxFillter = JSON.parse(
              userIncomeTaxFilterString
            ) as UserIncomTaxFilter;
            that.incomeTaxForm.patchValue({
              income_tax_type: storageUserIncomeTaxFillter.incomeTaxType,
              month_name: storageUserIncomeTaxFillter.monthName,
              year_name: storageUserIncomeTaxFillter.yearName,
              search: storageUserIncomeTaxFillter.search,
              site_id: storageUserIncomeTaxFillter.siteId,
            });
            dtInstance.page(storageUserIncomeTaxFillter.page);
            dtInstance.page.len(storageUserIncomeTaxFillter.page_size);
            localStorage.removeItem(that.filterSessionName);
          }
          const monthNameArray = that.incomeTaxForm.get("month_name").value
            ? that.incomeTaxForm.get("month_name").value.split(",")
            : undefined;
          that.userIncomeTaxFilter = {
            incomeTaxType: that.incomeTaxForm.get("income_tax_type").value,
            search: that.incomeTaxForm.get("search").value,
            monthName: that.incomeTaxForm.get("month_name").value,
            yearName: that.incomeTaxForm.get("year_name").value,
            siteId: that.incomeTaxForm.get("site_id").value,
            sort_column: sortColumn,
            sort_by: sortBy,
            page: dtInstance.page.info().page,
            page_size: dtInstance.page.info().length,
          };
          const isMonthly = that.userIncomeTaxFilter.incomeTaxType == "ภงด1";
          that.payrollService
            .getUserIncomeTaxFilter(
              that.userIncomeTaxFilter.incomeTaxType,
              that.userIncomeTaxFilter.search,
              isMonthly
                ? Number(monthNameArray[0])
                : Number(that.incomeTaxForm.get("year_name").value),
              isMonthly ? Number(monthNameArray[1]) : undefined,
              that.userIncomeTaxFilter.siteId,
              that.userIncomeTaxFilter.sort_column,
              that.userIncomeTaxFilter.sort_by,
              that.userIncomeTaxFilter.page + 1,
              that.userIncomeTaxFilter.page_size
            )
            .subscribe(
              (result) => {
                that.spinner.hideLoadingSpinner(0);
                that.userIncomeTaxes = result.data;
                callback({
                  recordsTotal: result.total,
                  recordsFiltered: result.total,
                  data: [],
                });
              },
              (error) => {
                that.spinner.hideLoadingSpinner(0);
                that.userIncomeTaxes = [];
                callback({
                  recordsTotal: 0,
                  recordsFiltered: 0,
                  data: [],
                });
              }
            );
        });
      },
      columns: [
        { width: "170px", orderable: false },
        null,
        { width: "300px", orderable: false },
        { width: "200px", orderable: false },
        { width: "200px", orderable: false },
      ],
    };
  }

  updateView() {
    this.applicationStateService.setIsHiddenSearch = true;
  }

  initDateControl() {
    const today = this.moment.currentDate.toDate();
    const lastNMonths = this.getMonthYearInLastNYears(today, this.lastNYear);
    lastNMonths.forEach((monthYear) => {
      this.nameMonths.push({
        view: new Date(
          monthYear.year,
          monthYear.month - 1,
          1
        ).toLocaleDateString("th-TH", { month: "long", year: "numeric" }),
        viewValue: `${monthYear.year},${monthYear.month}`,
      });
    });
    const lastNYear = [today.getFullYear(), today.getFullYear() - this.lastNYear];
    lastNYear.forEach((year) => {
      this.nameYears.push({
        view: `${year + 543}`,
        viewValue: `${year}`,
      });
    });
    this.incomeTaxForm.patchValue({
      month_name: this.nameMonths[0].viewValue,
      year_name: this.nameYears[0].viewValue,
    });
  }

  getMonthYearInLastNYears(date: Date, lastNYear: number) {
    let months = [];
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1; // getMonth() returns 0-based month
  
    // Add months of the current year up to the last month
    for (let i = currentMonth; i > 0; i--) {
      months.push({ month: i, year: currentYear });
    }
  
    // Add months of the last 2 years
    for (let year = currentYear - 1; year >= currentYear - lastNYear; year--) {
      for (let month = 12; month > 0; month--) {
        months.push({ month, year });
      }
    }
  
    return months;
  }

  getLastDateOfMonth(year, month) {
    const nextMonthFirstDay = new Date(year, month + 1, 0);
    return nextMonthFirstDay;
  }
  getThaiDate(date) {
    return new Date(date).toLocaleDateString("th-TH");
  }

  padLeft(
    value: string | number,
    desiredLength: number,
    padCharacter: string = "0"
  ): string {
    let stringValue = String(value);
    while (stringValue.length < desiredLength) {
      stringValue = padCharacter + stringValue;
    }
    return stringValue;
  }

  get IsMonthly() {
    return this.incomeTaxForm.get("income_tax_type").value === "ภงด1";
  }
}
