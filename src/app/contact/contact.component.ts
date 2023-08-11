import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactUsers: any[] = [];

  contactObj: any = {
    userName: '',
    email: '',
    password:''
  };
  
  constructor() {}

  ngOnInit(): void {
    const localData = localStorage.getItem('contactUsers');
    if(localData != null)
    {
      this.contactUsers = JSON.parse(localData);
    }
  }

  onContact() {
    this.contactUsers.push(this.contactObj);
    localStorage.setItem('contactUsers', JSON.stringify(this.contactUsers));
    this.contactObj= {
      userName: '',
      email: '',
      password:''
    };

  }

  
}
