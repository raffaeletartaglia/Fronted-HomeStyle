import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { WishListService } from '../../../services/wishList.service';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
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
      this.wishlistService.getUserWishList(this.idUtente);
    }
  }

  rimuoviDaWishlist(idWishlist: string) {
    this.wishlistService.rimuoviDaWishlist(idWishlist);
  }
}
