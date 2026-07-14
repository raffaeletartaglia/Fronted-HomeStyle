import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { inject, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import Keycloak from 'keycloak-js';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { UtenteService } from '../services/utente.service';
import { ProductService } from '../services/productService';
import { IfAuthenticatedDirective } from '../directives/if-authenticated.directive';
import { CartSidebar } from '../components/cart-sidebar/cart-sidebar';
import { StanzaService } from '../services/stanza.service';
import { CategoriaService } from '../services/categoria.service';
import { Stanza } from '../models/stanza.model';
import { Categoria } from '../models/categoria.model';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'my-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MenuModule,
    AutoCompleteModule,
    DialogModule,
    ButtonModule,
    IfAuthenticatedDirective,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css', '../../styles.css']
})
export class headerComponent implements OnInit {

  items: MenuItem[] | undefined;
  userMenuItems: MenuItem[] | undefined;
  mostraDialogWishlist: boolean = false;


  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  userProfile: any = null;

  ricercaTesto: string = '';
  suggerimenti: any[] = [];
  cartSidebarVisible: boolean = false;
  isMobileMenuOpen: boolean = false; // Flag per il menu su mobile
  isUserMenuOpen: boolean = false; // Flag per il custom user menu
  isSearchDropdownOpen: boolean = false; // Flag per il dropdown di ricerca

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
      this.isSearchDropdownOpen = false;
    }
  }

  constructor(
    private keycloak: Keycloak, 
    private utenteService: UtenteService, 
    private productService: ProductService, 
    public router: Router, 
    private stanzaService: StanzaService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
    private eRef: ElementRef
  ) { }

  /**
   * Inizializza il componente leggendo lo stato di autenticazione
   * da Keycloak. Se l'utente è loggato, prova a prendere i dati dal nostro DB.
   * Se il DB risponde 404 (nuovo utente appena registrato), lo sincronizza
   * automaticamente con i dati del token chiamando creaOAggiorna.
   */
  ngOnInit() {
    this.isLoggedIn = this.keycloak.authenticated ?? false;
    this.loadHeaderMenu();

    if (this.isLoggedIn) {
      // Proviamo a ottenere i dati dal nostro backend (database locale)
      this.utenteService.getUserData().subscribe({
        next: (datiDb: any) => {
          // L'utente esiste già nel DB, usiamo i suoi dati
          this.userProfile = {
            firstName: datiDb.nome,
            lastName: datiDb.cognome,
            email: datiDb.email
          };
        },
        error: (err: any) => {
          // Se il server risponde 404 (utente non trovato), significa che
          // si è appena registrato su Keycloak ma non esiste nel nostro DB.
          // Lo sincronizziamo!
          if (err.status === 404 && this.keycloak.tokenParsed) {
            const tokenNome = this.keycloak.tokenParsed['given_name'] || '';
            const tokenCognome = this.keycloak.tokenParsed['family_name'] || '';

            this.utenteService.aggiornaProfilo(tokenNome, tokenCognome, '').subscribe({
              next: (newDati: any) => {
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
  loadHeaderMenu() {
    forkJoin({
      stanzeRes: this.stanzaService.getAllStanze(0, 100),
      categorieRes: this.categoriaService.getAllCategorie(0, 500)
    }).subscribe({
      next: ({ stanzeRes, categorieRes }: any) => {
        // @ts-ignore - Assuming PaginatedResponse structure has 'content' or fallback to array if it's already array
        const stanze: Stanza[] = stanzeRes.content || stanzeRes || [];
        // @ts-ignore
        const categorie: Categoria[] = categorieRes.content || categorieRes || [];

        const menuItems: MenuItem[] = [];
        const MAX_VISIBLE = 3;

        const stanzeVisibili = stanze.slice(0, MAX_VISIBLE);
        const stanzeNascoste = stanze.slice(MAX_VISIBLE);

        const buildMenuStanza = (stanza: Stanza): MenuItem => {
          const catDiStanza = categorie.filter(c => c.stanze?.some(s => s.id === stanza.id));
          const items = catDiStanza.map(cat => ({
            label: cat.nomeCategoria,
            command: () => this.router.navigate(['/risultati-ricerca'], { queryParams: { stanzaId: stanza.id, categoriaId: cat.id } })
          }));

          const labelSanitized = stanza.tipologia.replace(/_/g, ' ');

          return {
            label: labelSanitized,
            items: items.length > 0 ? items : undefined,
            command: () => this.router.navigate(['/risultati-ricerca'], { queryParams: { stanzaId: stanza.id } })
          };
        };

        stanzeVisibili.forEach(s => {
          menuItems.push(buildMenuStanza(s));
        });

        if (stanzeNascoste.length > 0) {
          const hiddenItems = stanzeNascoste.map(s => buildMenuStanza(s));
          menuItems.push({
            label: 'Altre',
            items: hiddenItems
          });
        }

        this.items = menuItems;
        this.cdr.detectChanges();
      }
    });
  }

  toggleUserMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  goToWishlist() {
    const idUtente = this.keycloak.tokenParsed?.sub;
    if (idUtente) {
      this.router.navigate(['/dashboard/preferiti']);
    }
  }

  goToCart() {
    this.router.navigate(['/dashboard/carrello']);
  }

  showWishlistDialog() {
    this.mostraDialogWishlist = true;
  }

  cercaSuggerimentiCustom(event: any) {
    const query = event.target.value;
    if (query && query.length >= 2) {
      this.productService.ricercaSuggerimenti(query).subscribe({
        next: (res: any) => {
          this.suggerimenti = res;
          this.isSearchDropdownOpen = this.suggerimenti.length > 0;
        },
        error: (err: any) => {
          console.error("Errore suggerimenti:", err);
          this.suggerimenti = [];
          this.isSearchDropdownOpen = false;
        }
      });
    } else {
      this.suggerimenti = [];
      this.isSearchDropdownOpen = false;
    }
  }

  onSearchFocus() {
    if (this.suggerimenti.length > 0) {
      this.isSearchDropdownOpen = true;
    }
  }

  onProdottoSelezionatoCustom(prod: any) {
    this.isSearchDropdownOpen = false;
    this.ricercaTesto = prod.nomeProdotto;
    this.router.navigate(['/product', prod.id]);
  }

  onSearchEnter() {
    this.isSearchDropdownOpen = false;
    const queryStr = typeof this.ricercaTesto === 'string' ? this.ricercaTesto : this.ricercaTesto?.['nomeProdotto'];
    
    if (queryStr && queryStr.trim().length > 0) {
      this.router.navigate(['/risultati-ricerca'], { queryParams: { query: queryStr.trim() } });
    } else {
      // Ricerca vuota: porta alla pagina risultati mostrando tutti i prodotti
      this.router.navigate(['/risultati-ricerca']);
    }
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

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  executeItemCommand(item: any) {
    if (item.command) {
      item.command();
    }
    this.closeMobileMenu();
  }
}


