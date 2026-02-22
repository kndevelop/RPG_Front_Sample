import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../parts/header/header.component";
import { FooterComponent } from '../parts/footer/footer.component';

@Component({
  selector: 'home',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    MatToolbarModule,
    RouterModule /* standone componentでrouterLinkを使用するために必要 */,
    HeaderComponent
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  
}
