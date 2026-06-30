import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';

export const adminGuard: CanActivateFn = async (route, state) => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  // Prima controlliamo se è autenticato
  if (!keycloak.authenticated) {
    await keycloak.login();
    return false;
  }

  // Controlliamo il ruolo admin
  const hasAdminRole = keycloak.hasRealmRole('ADMIN') || keycloak.hasRealmRole('ROLE_ADMIN');
  
  if (hasAdminRole) {
    return true;
  }

  // Se non ha il ruolo admin, redirect alla pagina 404
  router.navigate(['/not-found']);
  return false;
};
