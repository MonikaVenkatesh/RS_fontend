import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  footerUsers: any[] = [];

  footerObj: any = {
    email: ''
  };
  constructor() {}
  onContact() {
    this.footerUsers.push(this.footerObj);
    localStorage.setItem('footerUsers', JSON.stringify(this.footerUsers));
    this.footerObj= {
     
      email: ''
    };

}
}
