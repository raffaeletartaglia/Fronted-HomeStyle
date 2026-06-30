import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../../../services/categoria.service';
import { Categoria } from '../../../../models/categoria.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CategoryForm } from '../category-form/category-form';
import { NotificationModal } from '../../../../notification-modal/notification-modal';
import { ConfirmModal } from '../../../../confirm-modal/confirm-modal';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatProgressSpinnerModule, MatPaginatorModule],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.css']
})
export class CategoryList implements OnInit {
  categories: Categoria[] = [];
  displayedColumns: string[] = ['nomeCategoria', 'descrizione', 'azioni'];
  isLoading = signal(true);

  // Pagination variables
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(private categoriaService: CategoriaService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading.set(true);
    this.categoriaService.getAllCategorie(this.pageIndex, this.pageSize).subscribe({
      next: (data) => {
        this.categories = data.content;
        this.totalElements = data.totalElements;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore nel caricamento categorie', err);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCategories();
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(CategoryForm, {
      width: '500px',
      data: { isEdit: false, category: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  openEditDialog(category: Categoria) {
    const dialogRef = this.dialog.open(CategoryForm, {
      width: '500px',
      data: { isEdit: true, category: { ...category } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  deleteCategory(id: string) {
    const dialogRef = this.dialog.open(ConfirmModal, {
      width: '400px',
      data: { title: 'Conferma Eliminazione', message: 'Sei sicuro di voler eliminare questa categoria?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoriaService.deleteCategoria(id).subscribe({
          next: () => {
            this.dialog.open(NotificationModal, { data: { title: 'Successo', message: 'Categoria eliminata con successo!', level: 'success' } });
            this.loadCategories();
          },
          error: (err) => {
            console.error('Errore durante eliminazione', err);
            this.dialog.open(NotificationModal, { data: { title: 'Errore', message: 'Non è stato possibile eliminare la categoria.', level: 'error' } });
          }
        });
      }
    });
  }
}
