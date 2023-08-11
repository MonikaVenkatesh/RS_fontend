import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SignupComponent } from './signup/signup.component';
import { ContactComponent } from './contact/contact.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { FooterComponent } from './footer/footer.component';

const routes: Routes = [

  {
    component : HeaderComponent,
    path:'component/header'
      },
  {
component : SignupComponent,
path:'signup'
  },

  {
    component : ContactComponent,
    path:'contact'
      },

      {
        component : CheckoutComponent,
        path:'checkout'
          },

          {
            component : FooterComponent,
            path:'component/footer'
              },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
 
 }
