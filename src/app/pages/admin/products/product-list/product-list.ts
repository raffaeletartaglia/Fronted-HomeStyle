import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../../services/productService';
import { Prodotto } from '../../../../models/prodotto.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ProductForm } from '../product-form/product-form';
import { ConfirmModal } from '../../../../confirm-modal/confirm-modal';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatProgressSpinnerModule, MatPaginatorModule, ToastModule],
  providers: [MessageService],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductList implements OnInit {
  products: Prodotto[] = [];
  displayedColumns: string[] = ['immagine', 'nomeProdotto', 'marca', 'categoria', 'prezzo', 'giacenza', 'azioni'];
  isLoading = signal(true);

  // Pagination variables
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private readonly productService: ProductService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAllProdotti(this.pageIndex, this.pageSize).subscribe({
      next: (data) => {
        this.products = data.content;
        this.totalElements = data.totalElements;
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel caricamento prodotti', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  goToDetail(id: string) {
    this.router.navigate(['/product', id]);
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(ProductForm, {
      width: '700px',
      data: { isEdit: false, product: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  openEditDialog(product: Prodotto) {
    const dialogRef = this.dialog.open(ProductForm, {
      width: '700px',
      data: { isEdit: true, product: { ...product } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  deleteProduct(id: string) {
    const dialogRef = this.dialog.open(ConfirmModal, {
      width: '400px',
      data: { title: 'Conferma Eliminazione', message: 'Sei sicuro di voler eliminare questo prodotto?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.deleteProdotto(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Prodotto eliminato con successo!' });
            this.loadProducts();
          },
          error: (err) => {
            console.error('Errore durante eliminazione', err);
            this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Non è stato possibile eliminare il prodotto.' });
          }
        });
      }
    });
  }
}
