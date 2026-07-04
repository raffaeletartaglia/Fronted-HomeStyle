import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu'; // <--- IMPORTANTE: Aggiungi il MenuModule
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { WishListService } from '../services/wishList.service'; // Adjust path if needed
import { UtenteService } from '../services/utente.service';
import { IfAuthenticatedDirective } from '../directives/if-authenticated.directive';

@Component({
  selector: 'my-header',
  standalone: true,
  imports: [
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MenubarModule,
    MenuModule, // <--- Aggiungilo qui
    DialogModule,
    ButtonModule,
    IfAuthenticatedDirective
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css', '../../styles.css']
})
export class headerComponent implements OnInit {

  items: MenuItem[] | undefined;
  userMenuItems: MenuItem[] | undefined;
  mostraDialogWishlist: boolean = false;


  isLoggedIn: boolean = false;
  userProfile: any = null;

  constructor(private keycloak: Keycloak, private utenteService: UtenteService, private router: Router, private wishlistService: WishListService) { }

  /**
   * Inizializza il componente leggendo lo stato di autenticazione
   * da Keycloak. Se l'utente è loggato, prova a prendere i dati dal nostro DB.
   * Se il DB risponde 404 (nuovo utente appena registrato), lo sincronizza
   * automaticamente con i dati del token chiamando creaOAggiorna.
   */
  ngOnInit() {
    this.isLoggedIn = this.keycloak.authenticated ?? false;
    this.updateUserMenu();
    if (this.isLoggedIn) {
      // Proviamo a ottenere i dati dal nostro backend (database locale)
      this.utenteService.getUserData().subscribe({
        next: (datiDb) => {
          // L'utente esiste già nel DB, usiamo i suoi dati
          this.userProfile = {
            firstName: datiDb.nome,
            lastName: datiDb.cognome,
            email: datiDb.email
          };
          this.updateUserMenu();
        },
        error: (err) => {
          // Se il server risponde 404 (utente non trovato), significa che
          // si è appena registrato su Keycloak ma non esiste nel nostro DB.
          // Lo sincronizziamo!
          if (err.status === 404 && this.keycloak.tokenParsed) {
            const tokenNome = this.keycloak.tokenParsed['given_name'] || '';
            const tokenCognome = this.keycloak.tokenParsed['family_name'] || '';

            this.utenteService.aggiornaProfilo(tokenNome, tokenCognome, '').subscribe({
              next: (newDati) => {
                this.userProfile = {
                  firstName: newDati.nome,
                  lastName: newDati.cognome,
                  email: newDati.email
                };
              }
            });
          }
        }
      });
    }
  }
  updateUserMenu() {
    if (this.keycloak.authenticated) {
      // VOCI SE L'UTENTE È LOGGATO
      this.userMenuItems = [
        { label: 'Il mio profilo', icon: 'pi pi-user' },
        { label: 'Ordini', icon: 'pi pi-box' },
        { label: 'Effettua un reso', icon: 'pi pi-refresh' },
        { label: 'Aiuti e contatti', icon: 'pi pi-envelope' },
        { separator: true }, // Linea di separazione
        { label: 'Disconnettiti', icon: 'pi pi-sign-out', command: () => this.logout() }
      ];
    } else {
      // VOCI SE L'UTENTE NON È LOGGATO
      this.userMenuItems = [
        {
          label: `<div style="display: block; width: 100%; text-align: center; padding: 0.2rem 0; cursor: pointer;"><strong style="font-size: 1rem; color: #333; text-decoration: underline; text-decoration-color: #d32f2f; text-decoration-thickness: 2px;">ACCEDI</strong></div>`,
          escape: false,
          styleClass: 'center-menu-item',
          command: () => this.login()
        },
        {
          label: `<div style="padding: 0.2rem 0; cursor: pointer; text-align: center;"><span style="font-size: 0.85rem; color: #666;">se non sei registrato : </span><strong style="font-size: 1rem; color: #d32f2f; text-decoration: underline; text-decoration-color: #d32f2f; text-decoration-thickness: 2px;">REGISTRATI</strong></div>`,
          escape: false,
          command: () => this.register()
        },
        { separator: true },
        { label: 'Il mio profilo', icon: 'pi pi-user' },
        { label: 'Ordini', icon: 'pi pi-box' },
        { label: 'Effettua un reso', icon: 'pi pi-refresh' },
        { label: 'Aiuto e contatti', icon: 'pi pi-envelope' }
      ];
    }
  }

  goToWishlist() {
    const idUtente = this.keycloak.tokenParsed?.sub;
    if (idUtente) {
      this.wishlistService.getUserWishList(idUtente);
      this.router.navigate(['/wishlist']);
    }
  }

  showWishlistDialog() {
    this.mostraDialogWishlist = true;
  }

  goHomepage() {
    this.router.navigate(['']);
  }

  /**
   * Effettua il reindirizzamento dell'utente alla pagina di Login
   * esposta direttamente da Keycloak.
   */
  async login() {
    await this.keycloak.login();
  }

  /**
   * Reindirizza l'utente alla pagina di Registrazione
   * gestita nativamente da Keycloak (Signup).
   */
  async register() {
    await this.keycloak.register();
  }

  /**
   * Effettua il logout direttamente tramite Keycloak
   * assicurando il ritorno alla modalità non loggati.
   */
  async logout() {
    await this.keycloak.logout({ redirectUri: window.location.origin });
  }

  /**
   * Apre il pannello "Account Management" di Keycloak, una pagina
   * integrata che permette all'utente di gestire la sua password, i dispositivi,
   * l'autenticazione a due fattori e i dati personali.
   */
  async manageAccount() {
    await this.keycloak.accountManagement();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}


