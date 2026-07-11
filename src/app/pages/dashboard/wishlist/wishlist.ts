import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishListService } from '../../../services/wishList.service';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.css']
})
export class Wishlist implements OnInit {
  idUtente: string = '';

  constructor(
    public wishlistService: WishListService,
    private keycloak: Keycloak
  ) {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      this.caricaWishlist();
    }
  }

  caricaWishlist() {
    this.wishlistService.getUserWishList(this.idUtente);
  }

  rimuoviDaWishlist(idProdotto: string) {
    this.wishlistService.rimuoviDaWishlist(this.idUtente, idProdotto);
  }

  svuotaWishlist() {
    if(confirm("Sei sicuro di voler svuotare la tua wishlist?")) {
      this.wishlistService.svuotaWishlistUtente(this.idUtente);
    }
  }
}
