import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { CarrelloService } from '../../services/carrello.service';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, DrawerModule, ButtonModule],
  templateUrl: './cart-sidebar.html',
  styleUrls: ['./cart-sidebar.css']
})
export class CartSidebar implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  
  cartItems: any[] = [];
  total: number = 0;

  constructor(
    private carrelloService: CarrelloService,
    private router: Router,
    private keycloak: Keycloak
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      const idUtente = this.keycloak.tokenParsed.sub;
      this.carrelloService.getCarrelloUtenteObservable(idUtente).subscribe({
        next: (res: any) => {
          this.cartItems = res.prodotti || [];
          this.calculateTotal();
        },
        error: (err: any) => console.log('Nessun carrello attivo')
      });
    }
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((acc: number, item: any) => acc + (item.prodotto.prezzo * item.quantita), 0);
  }

  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  goToCheckout() {
    this.onHide();
    this.router.navigate(['/checkout']);
  }
}
