import { Component, OnInit, AfterViewInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  public defaultImagePath = environment.basePath;
  public loginBackgroundStyle: SafeStyle;
  public loading = false;

  nowYear = new Date().getFullYear();
  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(7), Validators.pattern('[0-9]{7}')]],
    password: ['', [Validators.required]]
  });

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private sanitizer: DomSanitizer) {
    localStorage.clear();
    this.loginBackgroundStyle = this.sanitizer.bypassSecurityTrustStyle(`url(${this.defaultImagePath}/img/tower.svg)`);
  }

  onSubmit() {
    this.loading = true;
    this.authService.login(this.loginForm.get('username').value, this.loginForm.get('password').value).subscribe(result => {
      this.loading = false;
      this.router.navigate([this.authService.getRedirectUrl()]);
    }, error => {
      this.loading = false;
      console.log(error);
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  get appVersion() {
    return environment.appVersion;
  }

  get releaseDate() {
    return environment.releaseDate;
  }

}
