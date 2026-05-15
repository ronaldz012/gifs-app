import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import { AuthService } from '../services/auth-service';


@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styles: ``,
})
export default class Login {
  // En tu componente
  loginForm = new FormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(4)], nonNullable: true }),
  });

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit(){
    if(this.loginForm.valid)
    {
      this.authService.login(this.loginForm.value.email!, this.loginForm.value.password!).subscribe(
        {
          next:() => {this.router.navigate(['/home']);
              console.log("éxito")},
          error:() => alert('error al loguear')
        }
      )
    }
  }
}
