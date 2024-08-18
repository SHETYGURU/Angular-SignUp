import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';

export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsDontMatch: true };
    } else {
      return null;
    }
  };
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  currentSection = 1;

  signUpForm = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      phone: ['', Validators.required],
    },
    { validators: passwordsMatchValidator() }
  );

  additionalInfoForm = this.fb.group({
    organizationName: ['', Validators.required],
    orgId: ['', Validators.required],
    designation: ['', Validators.required],
    birthDate: ['', Validators.required],
    // city: ['', Validators.required],
    pincode: ['', Validators.required],
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: HotToastService,
    private usersService: UsersService,
    private fb: NonNullableFormBuilder
  ) {}

  ngOnInit(): void {}

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }

  get name() {
    return this.signUpForm.get('name');
  }

  get phone() {
    return this.signUpForm.get('phone');
  }

  get organizationName() {
    return this.additionalInfoForm.get('organizationName');
  }

  get orgId() {
    return this.additionalInfoForm.get('orgId');
  }

  get designation() {
    return this.additionalInfoForm.get('designation');
  }

  get birthDate() {
    return this.additionalInfoForm.get('birthDate');
  }

  // get city() {
  //   return this.additionalInfoForm.get('city');
  // }

  get pincode() {
    return this.additionalInfoForm.get('pincode');
  }

  nextSection() {
    if (this.signUpForm.valid) {
      this.currentSection = 2;
    }
  }

  submit() {
    const { name, email, password, phone } = this.signUpForm.value;
    const { organizationName, orgId, designation, birthDate, pincode } =
      this.additionalInfoForm.value;
  
    if (
      !this.signUpForm.valid ||
      !this.additionalInfoForm.valid ||
      !name ||
      !email ||
      !password ||
      !organizationName ||
      !orgId ||
      !designation ||
      !birthDate ||
      !pincode
    ) {
      return;
    }
  
    this.authService
      .signUp(email, password)
      .pipe(
        switchMap(({ user: { uid } }) =>
          this.usersService.addUser({
            uid,
            email,
            displayName: name,
            phone,
            organizationName,
            orgId,
            designation,
            birthDate,
            pincode,
          })
        ),
        this.toast.observe({
          success: 'Congrats! You are all signed up',
          loading: 'Signing up...',
          error: ({ message }) => `${message}`,
        })
      )
      .subscribe(() => {
        this.router.navigate(['/home']);
      });
  }
  
  goBack() {
    this.currentSection = 1;
  }
}
