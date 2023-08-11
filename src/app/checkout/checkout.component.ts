import { Component } from '@angular/core';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {

  checkoutUsers: any[] = [];

  checkoutObj: any = {
    mobphno: '',
    userName: '',
    addrl1: '',
    addrl2: '',
    city: '',
    state: '',
    pin:'',
    email:'',
  };
  
  constructor() {}

  ngOnInit(): void {
    const localData = localStorage.getItem('checkoutUsers');
    if(localData != null)
    {
      this.checkoutUsers = JSON.parse(localData);
    }
  }

  onCheckout() {
    this.checkoutUsers.push(this.checkoutObj);
    localStorage.setItem('checkoutUsers', JSON.stringify(this.checkoutUsers));
    this.checkoutObj= {
      mobphno: '',
    userName: '',
    addrl1: '',
    addrl2: '',
    city: '',
    state: '',
    pin:'',
    email:'',
    };

  }

}
