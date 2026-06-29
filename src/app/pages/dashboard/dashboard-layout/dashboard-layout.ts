import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout implements OnInit {
  isAdmin = false;

  constructor(private keycloak: Keycloak) {}

  ngOnInit() {
    this.isAdmin = this.keycloak.hasRealmRole('ADMIN') || this.keycloak.hasRealmRole('ROLE_ADMIN');
  }
}
