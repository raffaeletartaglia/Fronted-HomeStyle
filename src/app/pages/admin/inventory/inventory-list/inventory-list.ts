import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InventoryMovement } from '../../../../models/inventory.model';
import { InventoryService } from '../../../../services/inventory.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Dialogs
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Prodotto } from '../../../../models/prodotto.model';
import { ProductService } from '../../../../services/productService';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    ToastModule,
    MatDialogModule
  ],
  providers: [MessageService],
  templateUrl: './inventory-list.html',
  styleUrls: ['./inventory-list.css']
})
export class InventoryList implements OnInit {
  movements: InventoryMovement[] = [];
  displayedColumns: string[] = ['prodottoId', 'tipoMovimento', 'quantita', 'dataMovimento', 'note'];
  
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly dialog: MatDialog,
    private readonly messageService: MessageService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.inventoryService.getAllMovements(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.movements = response.content;
        this.totalElements = response.totalElements;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMessage('error', 'Errore', 'Errore durante il caricamento dei movimenti.');
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMovements();
  }

  openRestockDialog(): void {
    const dialogRef = this.dialog.open(RestockDialogComponent, {
      width: '400px',
      panelClass: 'bootstrap-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inventoryService.addManualRestock(result.prodottoId, result.quantita, result.note).subscribe({
          next: () => {
            this.showMessage('success', 'Successo', 'Rifornimento registrato con successo.');
            this.loadMovements();
          },
          error: () => {
            this.showMessage('error', 'Errore', 'Errore durante il rifornimento.');
          }
        });
      }
    });
  }

  showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  }
}

// ----- DIALOG COMPONENT PER RIFORNIMENTO MANUALE -----
@Component({
  selector: 'app-restock-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="p-4" style="background-color: var(--bs-body-bg); color: var(--bs-body-color);">
      <h2 class="h5 mb-4 d-flex align-items-center">
        <mat-icon class="me-2 text-primary">add_box</mat-icon>
        Rifornimento Manuale
      </h2>
      
      <div class="mb-3">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>ID Prodotto</mat-label>
          <input matInput [(ngModel)]="prodottoId" placeholder="Es. 1234-abcd-..." />
        </mat-form-field>
      </div>

      <div class="mb-3">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Quantità da aggiungere</mat-label>
          <input matInput type="number" [(ngModel)]="quantita" min="1" />
        </mat-form-field>
      </div>

      <div class="mb-3">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Note (opzionale)</mat-label>
          <textarea matInput [(ngModel)]="note" rows="3"></textarea>
        </mat-form-field>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-4">
        <button mat-button mat-dialog-close color="warn">Annulla</button>
        <button mat-flat-button color="primary" [mat-dialog-close]="{prodottoId: prodottoId, quantita: quantita, note: note}" [disabled]="!prodottoId || !quantita || quantita <= 0">Conferma</button>
      </div>
    </div>
  `
})
export class RestockDialogComponent {
  prodottoId = '';
  quantita = 1;
  note = '';
}
