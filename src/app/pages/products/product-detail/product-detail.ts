import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/productService';
import { Prodotto } from '../../../models/prodotto.model';
import Keycloak from 'keycloak-js';

import { CarrelloService } from '../../../services/carrello.service';
import { WishListService } from '../../../services/wishList.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ProductForm } from '../../admin/products/product-form/product-form';
import { ConfirmModal } from '../../../confirm-modal/confirm-modal';
import { NotificationModal } from '../../../notification-modal/notification-modal';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule, 
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit {
  productId: string = '';
  product: Prodotto | null = null;
  isLoading = signal(true);
  isAdmin: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private productService: ProductService,
    private keycloak: Keycloak,
    private dialog: MatDialog,

    private carrelloService: CarrelloService,
    private wishListService: WishListService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (this.keycloak.authenticated) {
      this.isAdmin = this.keycloak.hasRealmRole('ADMIN') || this.keycloak.hasRealmRole('ROLE_ADMIN');
    }
    this.loadProduct();
  }

  loadProduct() {
    if (!this.productId) return;
    this.isLoading.set(true);
    this.productService.getProdottoById(this.productId).subscribe({
      next: (data: Prodotto) => {
        this.product = data;
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Errore nel caricamento del prodotto', err);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    if (this.isAdmin) {
      this.router.navigate(['/dashboard/admin/prodotti']);
    } else {
      this.router.navigate(['/']); // or catalog page
    }
  }

  openEditDialog() {
    if (!this.product) return;
    const dialogRef = this.dialog.open(ProductForm, {
      width: '700px',
      data: { isEdit: true, product: { ...this.product } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProduct();
      }
    });
  }

  deleteProduct() {
    if (!this.product) return;
    const dialogRef = this.dialog.open(ConfirmModal, {
      width: '400px',
      data: { title: 'Conferma Eliminazione', message: 'Sei sicuro di voler eliminare questo prodotto?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.deleteProdotto(this.product!.id!).subscribe({
          next: () => {
            this.dialog.open(NotificationModal, { data: { title: 'Successo', message: 'Prodotto eliminato con successo!', level: 'success' } });
            this.goBack();
          },
          error: (err: any) => {
            console.error('Errore durante eliminazione', err);
            this.dialog.open(NotificationModal, { data: { title: 'Errore', message: 'Non è stato possibile eliminare il prodotto.', level: 'error' } });
          }
        });
      }
    });
  }

  aggiungiAlCarrello() {
    if (!this.product) return;
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      const prodottoDaAggiungere = {
        prodottoId: this.product.id,
        quantita: 1
      };
      this.carrelloService.aggiungiProdotti(this.keycloak.tokenParsed.sub, [prodottoDaAggiungere]);
    } else {
      this.keycloak.login();
    }
  }

  compraOra() {
    if (!this.product) return;
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.router.navigate(['/checkout'], { 
        state: { 
          singoloProdotto: this.product,
          quantita: 1 
        } 
      });
    } else {
      this.keycloak.login();
    }
  }



  aggiungiAllaWishlist() {
    if (!this.product) return;
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.wishListService.aggiungiProdottoAWishlist(this.keycloak.tokenParsed.sub, this.product.id!);
    } else {
      this.keycloak.login();
    }
  }
}
