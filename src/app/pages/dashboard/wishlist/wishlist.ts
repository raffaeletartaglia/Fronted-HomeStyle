import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishListService } from '../../../services/wishList.service';
import { Router } from '@angular/router';
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
  public wishlistService = inject(WishListService);
  private keycloak = inject(Keycloak);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      this.wishlistService.wishlistUpdated$.subscribe(() => {
        this.cdr.detectChanges();
      });
      this.caricaWishlist();
    }
  }

  caricaWishlist() {
    this.wishlistService.getUserWishList(this.idUtente);
  }

  goToDetail(idProdotto: string) {
    this.router.navigate(['/product', idProdotto]);
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
