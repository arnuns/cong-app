import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { SiteService } from 'src/app/core/services/site.service';
import { SpinnerHelper } from 'src/app/core/helpers/spinner.helper';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { Site } from 'src/app/core/models/site';
import { FormBuilder } from '@angular/forms';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnInit, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false }) private datatableElement: DataTableDirective;
  public defaultImagePath = environment.basePath;

  sites: Site[] = [];
  dtTrigger = new Subject();
  dtOptions: DataTables.Settings = {};
  totalSites = 0;

  siteForm = this.fb.group({
    search: ['']
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private spinner: SpinnerHelper,
    private siteService: SiteService
  ) { }

  ngOnInit() {
    this.initialData();
  }

  ngAfterViewInit() {
    this.siteForm.get('search').valueChanges
      .pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.page(0);
          dtInstance.ajax.reload(null, false);
        });
      });
  }

  initialData() {
    const that = this;
    that.dtOptions = {
      autoWidth: false,
      dom: 'tr<\'d-flex align-items-center w-100 mt-4\'<l><\'ml-auto pr-2\'i><p>\'>',
      lengthMenu: [10, 20, 50],
      language: {
        emptyTable: '<strong>0</strong> site(s) returned',
        info: 'Viewing <strong>_START_-_END_</strong> of <strong>_TOTAL_</strong>',
        infoEmpty: 'No site(s) to show',
        infoFiltered: '',
        infoPostFix: '',
        lengthMenu: '_MENU_',
        paginate: {
          first: '',
          last: '',
          next: '<img class=\'paging-arrow\' src=\'assets/img/ico-arrow-right.png\'>',
          previous: '<img class=\'paging-arrow\' src=\'assets/img/ico-arrow-left.png\'>'
        }
      },
      order: [[0, 'desc']],
      pageLength: 10,
      pagingType: 'simple',
      serverSide: true,
      processing: true,
      ajax: ({ }: any, callback) => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          const orders = Object.values(dtInstance.order()[0]);
          const sortBy = String(orders[1]);
          let sortColumn = '';
          if (orders[0] === 1) {
            sortColumn = 'name';
          } else if (orders[0] === 2) {
            sortColumn = 'createOn';
          } else if (orders[0] === 3) {
            sortColumn = 'provinceId';
          } else {
            sortColumn = 'code';
          }
          that.siteService.getSiteFilter(
            that.siteForm.get('search').value,
            sortColumn,
            sortBy,
            dtInstance.page.info().page + 1,
            dtInstance.page.info().length).subscribe(result => {
              that.sites = result.data;
              that.totalSites = result.total;
              callback({
                recordsTotal: result.total,
                recordsFiltered: result.total,
                data: []
              });
            });
        });
      },
      columns: [
        { width: '100px' },
        { width: '250px' },
        { width: '100px' },
        { width: '120px' },
        { orderable: false, width: '20px' }
      ]
    };
  }

  editSiteInfo(siteId: number) {
    this.router.navigate(['/site/edit', siteId]);
  }
}
