import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.css']
})
export class NotFound {
  constructor(private keycloak: Keycloak, private router: Router, private location: Location) {}

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  async goToLogin() {
    if (this.keycloak.authenticated) {
      // Se già loggato (ma non autorizzato), facciamo logout così può loggarsi con un utente admin
      await this.keycloak.logout({ redirectUri: window.location.origin });
    } else {
      await this.keycloak.login();
    }
  }
}
