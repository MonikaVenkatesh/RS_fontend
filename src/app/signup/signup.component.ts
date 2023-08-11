import { Component } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupUsers: any[] = [];

  signupObj: any = {
    FName: '',
    LName: '',
    email: '',
    password:''
  };
  loginObj: any = {
    userName: '',
    password:''
  };
  constructor() {}

  ngOnInit(): void {
    const localData = localStorage.getItem('signUpUsers');
    if(localData != null)
    {
      this.signupUsers = JSON.parse(localData);
    }
  }

  onSignUp() {
    
  

  }

  onLogin()
  {

  }

}
