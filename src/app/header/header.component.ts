import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { FormsModule } from "@angular/forms";

// Assicurati che i percorsi di questi servizi siano corretti nel tuo progetto
import {KeyCloakService } from "../services/keyCloack.service"
import {AdminService} from "../services/admin.service"
import { ProductService } from "../services/productService";
import {PopupService} from "../services/popUp.service"
import { Notifications } from "../models/notification.model";

// Import material se ti servono ancora, altrimenti puoi rimuoverli
import { MatIcon } from "@angular/material/icon";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { MatIconButton } from "@angular/material/button";
import { MatList, MatListItem } from "@angular/material/list";
import { MatBadge } from "@angular/material/badge";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgClass, NgIf, NgForOf, DatePipe, NgOptimizedImage, FormsModule,
    MatIcon, MatMenuTrigger, MatMenu, MatIconButton, MatList, MatListItem, MatBadge
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'] // Rimosso styles.css globale se non strettamente necessario
})
export class HeaderComponent implements OnInit, OnDestroy {

  // ==========================================
  // 1. VARIABILI DI STATO (Tendine e Notifiche)
  // ==========================================

  isUserMenuOpen = false;
  isCartMenuOpen = false;

  notifyCount = 0;
  private notifyCountSubscription!: Subscription;

  // ==========================================
  // 2. COSTRUTTORE E INIZIALIZZAZIONE
  // ==========================================

  constructor(
    public productService: ProductService,
    public popupService: PopupService,
    private router: Router,
    public keyCloak: KeyCloakService,
    public adminService: AdminService
  ) {
    // Ci abboniamo per ricevere il numero di notifiche (es. elementi nel carrello)
    this.notifyCountSubscription = this.keyCloak.notifyCount$.subscribe(count => {
      this.notifyCount = count;
    });
  }

  ngOnInit(): void {
    // Caricamento iniziale delle notifiche dal server
    this.keyCloak.getNotify().subscribe(notifies => {
      this.keyCloak.notifications = notifies;
    });
  }

  ngOnDestroy(): void {
    // Pulizia dell'abbonamento quando si esce dal componente
    this.notifyCountSubscription.unsubscribe();
  }

  // ==========================================
  // 3. LOGICA DEI CLICK SULLE ICONE PRINCIPALI
  // ==========================================

  // Metodo per l'icona Utente
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isCartMenuOpen = false; // Se apro l'utente, chiudo il carrello
  }

  // Metodo per l'icona Carrello
  clickCartIcon(event: MouseEvent): void {
    event.preventDefault();
    if (this.keyCloak.getLoggedStatus() === true) {
      // È loggato: apri la tendina del carrello
      this.isCartMenuOpen = !this.isCartMenuOpen;
      this.isUserMenuOpen = false; // Chiudi l'utente
    } else {
      // NON è loggato: vai alla pagina Accedi
      this.router.navigate(['accedi']);
    }
  }

  // Metodo per l'icona Wishlist (Cuore)
  clickWishlistIcon(event: MouseEvent): void {
    event.preventDefault();
    if (this.keyCloak.getLoggedStatus() === true) {
      // È loggato: vai fisicamente alla pagina della wishlist
      this.router.navigate(['wish-list']);
      // Chiudo eventuali tendine rimaste aperte
      this.isUserMenuOpen = false;
      this.isCartMenuOpen = false;
    } else {
      // NON è loggato: vai alla pagina Accedi
      this.router.navigate(['accedi']);
    }
  }

  // ==========================================
  // 4. CLICK FUORI (Per chiudere le tendine)
  // ==========================================

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Attenzione: nell'HTML dovrai dare la classe "user-icon-container"
    // al div che contiene l'icona utente e il suo menu, e "cart-icon-container" a quello del carrello
    const clickedInsideUser = target.closest('.user-icon-container');
    const clickedInsideCart = target.closest('.cart-icon-container');

    if (!clickedInsideUser && !clickedInsideCart) {
      // Se l'utente clicca nel vuoto, chiudi tutto
      this.isUserMenuOpen = false;
      this.isCartMenuOpen = false;
    }
  }

  // ==========================================
  // 5. METODI DI NAVIGAZIONE BASE
  // ==========================================

  goHomepage(): void {
    this.router.navigate(['']);
  }

  changePage(event: MouseEvent, page: string): void {
    // Se sta andando nell'area admin, assicuriamoci di partire dalla prima scheda
    if(page === "admin-area") {
      this.adminService.section = 0;
    }
    event.preventDefault();
    this.router.navigate([page]);

    // Quando cambio pagina chiudo le tendine per pulizia visiva
    this.isUserMenuOpen = false;
    this.isCartMenuOpen = false;
  }

  // ==========================================
  // 6. METODI PER L'AREA ADMIN
  // ==========================================

  addProduct(event: MouseEvent, page: string): void {
    if(page === "admin-area") {
      this.adminService.section = 0;
    }
    event.preventDefault();
    this.productService.resetFields(); // Svuota i campi del form prodotto
    this.router.navigate([page]);
  }

  changeSection(event: MouseEvent, num: number, page: string, numResult: number): void {
    if(num === 0){
      this.adminService.getUsers(false);
      this.goToAdminArea(event, page, numResult);
    } else if(num === 1){
      this.adminService.getReports(false);
      this.goToAdminArea(event, page, numResult);
    } else if(num === 2){
      this.adminService.getSupports(false);
      this.goToAdminArea(event, page, numResult);
    } else if(num === 3){
      this.adminService.getBans(false);
      this.goToAdminArea(event, page, numResult);
    }
  }

  goToAdminArea(event: MouseEvent, page: string, num: number): void {
    this.adminService.section = num;
    event.preventDefault();
    this.router.navigate([page]);
  }

  // ==========================================
  // 7. GESTIONE NOTIFICHE (Dal vecchio componente)
  // ==========================================

  removeNotification(notification: Notifications): void {
    this.keyCloak.deleteNotify(notification).subscribe();
  }

  toggleDescription(notification: Notifications): void {
    notification.showDescription = !notification.showDescription;
  }
}


