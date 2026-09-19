# CongApp

## Legacy development

ใช้ `cong-app-legacy` เป็นหลักเพื่อรันโปรเจกต์ด้วย Node 12.22.12 x64:

```sh
cong-app-legacy setup
cong-app-legacy test
cong-app-legacy lint
cong-app-legacy build-web
```

CLI เป็นเครื่องมือภายนอก ไม่ได้ติดตั้งมากับ repo.
อ่าน [คู่มือการติดตั้ง CLI และวิธีพัฒนา](docs/development.md) ก่อนเริ่มบนเครื่องใหม่.
`start` เปิด Electron; `deploy` เผยแพร่ GitHub release จริงและต้องได้รับอนุมัติแยก.

คู่มือผู้ใช้ฟีเจอร์กองทุนสงเคราะห์ลูกจ้างอยู่ที่ [docs/employee-welfare-fund.md](docs/employee-welfare-fund.md).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.14.

## Development server

Run `npm start` inside `cong-app-legacy shell` for a dev server at `http://localhost:4211/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
