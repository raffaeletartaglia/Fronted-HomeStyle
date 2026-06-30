import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import Keycloak from 'keycloak-js';

/**
 * Functional Guard (Angular 15+) che protegge le rotte richiedendo l'autenticazione.
 * Se l'utente non è autenticato, forza il login tramite Keycloak.
 */
export const authGuard: CanActivateFn = async () => {
  const keycloak = inject(Keycloak);
  
  if (keycloak.authenticated) {
    return true;
  }
  
  // Se non è loggato, scatta il redirect a Keycloak e impedisce l'accesso alla rotta locale
  await keycloak.login();
  return false;
};
