import { Injectable } from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {tap, catchError} from "rxjs/operators";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {Router} from "@angular/router";
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class KeyCloakService {

 private keycloak: Keycloak;

 private authUrl = 'http://localhost:8080/api/auth';

 constructor(private http: HttpClient) {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8081',
      realm: 'home_style',
      clientId: 'home_style_client'
    });
 }

 async init(): Promise<boolean> {
  try {
    return await this.keycloak.init({
      onLoad: 'check-sso'
    });
  } catch (error) {
    console.error('Errore inizializzazione Keycloak', error);
    return false;
  }
 }

 async login(): Promise<void> {
  await this.keycloak.login();
 }

 async register(): Promise<void> {
  await this.keycloak.register();
 }

 async logout(): Promise<void> {
  await this.keycloak.logout({
    redirectUri: window.location.origin
  });
 }

 isLoggedIn(): boolean {
  return !!this.keycloak.authenticated;
 }

 getToken(): string | undefined {
  return this.keycloak.token;
 }

 // =========================
 // BACKEND (AGGIUNTE)
 // =========================

 getCurrentUser(): Observable<any> {
  return this.http.get<any>(`${this.authUrl}/me`);
 }

 logoutBackend(): Observable<any> {
  return this.http.post<any>(`${this.authUrl}/logout`, {
    logout: true
  });
 }

 async completeLogout(): Promise<void> {
  await this.logoutBackend().toPromise();
  await this.logout();
 }
}
