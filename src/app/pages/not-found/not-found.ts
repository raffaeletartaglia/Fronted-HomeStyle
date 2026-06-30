import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.css']
})
export class NotFound {
  constructor(private keycloak: Keycloak) {}

  async goToLogin() {
    if (this.keycloak.authenticated) {
      // Se già loggato (ma non autorizzato), facciamo logout così può loggarsi con un utente admin
      await this.keycloak.logout({ redirectUri: window.location.origin });
    } else {
      await this.keycloak.login();
    }
  }
}
