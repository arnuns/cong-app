# CongApp

## Legacy development

Use `cong-app-legacy` as the primary entry point for running this project with Node 12.22.12 x64:

```sh
cong-app-legacy setup
cong-app-legacy doctor
cong-app-legacy test
cong-app-legacy lint
cong-app-legacy build-web
```

The CLI core is versioned in `scripts/`; a small external launcher supplies the local checkout and NVM paths.
Read the [CLI installation and development guide](docs/development.md) before using a new machine.
`start` validates and repairs Electron before building; `deploy` publishes a real GitHub release and requires separate authorization.

The Employee Welfare Fund user guide is at [docs/employee-welfare-fund.md](docs/employee-welfare-fund.md).

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
