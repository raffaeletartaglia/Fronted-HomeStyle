import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CarrelloService } from '../../services/carrello.service';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, DividerModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {
  cartItems: any[] = [];
  total: number = 0;

  constructor(
    private carrelloService: CarrelloService,
    public router: Router,
    private keycloak: Keycloak
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
        this.cartItems = res.prodotti || [];
        this.calculateTotal();
      },
      error: (err: any) => {
        console.log('Nessun carrello attivo');
        this.cartItems = [];
      }
    });
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((acc: number, item: any) => acc + (item.prodotto.prezzo * item.quantita), 0);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
