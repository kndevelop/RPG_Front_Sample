import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PasswordComponent } from './password/password.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', title: 'ログイン', component: LoginComponent },
  //{ path: 'logout', title: 'ログアウト', component: LogoutComponent },
  { path: 'password', title: 'パスワード', component: PasswordComponent },
  { path: 'register', title: 'アカウント登録', component: RegisterComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
