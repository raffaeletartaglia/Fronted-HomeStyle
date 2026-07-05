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
  currentPage: number = 0;
  pageSize: number = 4;

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
    this.wishlistService.getUserWishList(this.idUtente, this.currentPage, this.pageSize);
  }

  rimuoviDaWishlist(idWishlist: string) {
    this.wishlistService.rimuoviDaWishlist(idWishlist);
  }

  nextPage() {
    if (this.wishlistService.wishlistPaginated && this.currentPage < this.wishlistService.wishlistPaginated.totalPages - 1) {
      this.currentPage++;
      this.caricaWishlist();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.caricaWishlist();
    }
  }
}
