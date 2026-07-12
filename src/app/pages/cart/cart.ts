import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { CarrelloService } from '../../services/carrello.service';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { MessageService } from 'primeng/api';

import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ToastModule, DialogModule],
  providers: [MessageService],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {
  cartItems: any[] = [];
  total: number = 0;
  
  currentPage: number = 0;
  pageSize: number = 4;
  totalPages: number = 0;
  idCarrello: string = '';

  mostraDialogSvuota: boolean = false;
  mostraDialogEliminaSingolo: boolean = false;
  itemDaRimuovere: any = null;

  private keycloak = inject(Keycloak);

  constructor(
    private carrelloService: CarrelloService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.loadCart();
    } else {
      this.router.navigate(['/']); // Redirect se non loggati
    }
  }

  loadCart() {
    const idUtente = this.keycloak.tokenParsed?.sub;
    if (!idUtente) return;
    
    this.carrelloService.getCarrelloUtenteObservable(idUtente).subscribe({
      next: (res: any) => {
        this.idCarrello = res.id;
        this.refreshTotal();
        this.loadCartItems();
      },
      error: (err: any) => {
        console.log('Nessun carrello attivo');
        this.cartItems = [];
        this.total = 0;
        this.cdr.detectChanges();
      }
    });
  }

  loadCartItems() {
    if (!this.idCarrello) return;
    this.carrelloService.getSoloProdottiObservable(this.idCarrello, this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.cartItems = res.content || [];
        this.totalPages = res.totalPages || 0;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Errore caricamento prodotti carrello', err);
      }
    });
  }

  refreshTotal() {
    if (this.idCarrello) {
      this.carrelloService.getTotaleCarrelloObservable(this.idCarrello).subscribe(
        (tot: number) => { 
          this.total = tot || 0; 
          this.cdr.detectChanges();
        }
      );
    }
  }

  updateQuantity(item: any, newQuantity: number) {
    if (newQuantity < 1) return;
    this.carrelloService.aggiornaQuantitaObservable(item.id, newQuantity).subscribe({
      next: (res) => {
        item.quantita = newQuantity;
        this.refreshTotal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        // Differenziamo i messaggi d'errore
        if (err.status === 400 || err.status === 409 || (err.error && JSON.stringify(err.error).toLowerCase().includes('stock'))) {
          this.messageService.add({ severity: 'warn', summary: 'Attenzione', detail: 'La quantità richiesta non è disponibile in magazzino.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Qualcosa è andato storto durante l\'aggiornamento.' });
        }
      }
    });
  }

  confermaRimuoviItem(item: any) {
    this.itemDaRimuovere = item;
    this.mostraDialogEliminaSingolo = true;
  }

  eseguiRimuoviItem() {
    if (this.itemDaRimuovere) {
      this.removeItem(this.itemDaRimuovere);
      this.mostraDialogEliminaSingolo = false;
      this.itemDaRimuovere = null;
    }
  }

  removeItem(item: any) {
    this.carrelloService.rimuoviProdottoObservable(item.id).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(i => i.id !== item.id);
        this.refreshTotal();
        
        if (this.cartItems.length === 0 && this.currentPage > 0) {
          this.currentPage--;
        }
        this.loadCartItems();

        this.messageService.add({ severity: 'success', summary: 'Prodotto Rimosso', detail: 'Prodotto rimosso dal carrello' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Qualcosa è andato storto. Impossibile rimuovere il prodotto.' });
      }
    });
  }

  confermaSvuotaCarrello() {
    this.mostraDialogSvuota = true;
  }

  eseguiSvuotaCarrello() {
    if (!this.idCarrello) return;
    this.carrelloService.svuotaCarrelloObservable(this.idCarrello).subscribe({
      next: () => {
        this.cartItems = [];
        this.total = 0;
        this.currentPage = 0;
        this.totalPages = 0;
        this.mostraDialogSvuota = false;
        this.messageService.add({ severity: 'success', summary: 'Carrello Svuotato', detail: 'Tutti i prodotti sono stati rimossi dal carrello.' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore svuotamento carrello', err);
        this.mostraDialogSvuota = false;
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Impossibile svuotare il carrello.' });
        this.cdr.detectChanges();
      }
    });
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadCartItems();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCartItems();
    }
  }

  goToProduct(productId: string) {
    if (productId) {
      this.router.navigate(['/product', productId]);
    }
  }
}
