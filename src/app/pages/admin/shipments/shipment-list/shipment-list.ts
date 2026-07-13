import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SpedizioneService } from '../../../../services/spedizione.service';
import { Spedizione, StatoSpedizione } from '../../../../models/spedizione.model';

@Component({
  selector: 'app-shipment-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Aggiorna Dettagli Spedizione</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="w-100 mt-2">
        <mat-label>Corriere</mat-label>
        <input matInput [(ngModel)]="data.corriere" placeholder="es. DHL, BRT">
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-100 mt-2">
        <mat-label>Codice Tracking</mat-label>
        <input matInput [(ngModel)]="data.codiceTracking" placeholder="Tracking">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annulla</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="data">Salva</button>
    </mat-dialog-actions>
  `,
  styles: ['.w-100 { width: 100%; } .mt-2 { margin-top: 1rem; }']
})
export class ShipmentEditDialog {
  constructor(
    public dialogRef: MatDialogRef<ShipmentEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { corriere: string, codiceTracking: string }
  ) {}
}

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    RouterModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './shipment-list.html',
  styleUrls: ['./shipment-list.css']
})
export class ShipmentList implements OnInit {
  spedizioni: Spedizione[] = [];
  displayedColumns: string[] = ['id', 'ordineId', 'corriere', 'codiceTracking', 'statoSpedizione', 'azioni'];
  
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private readonly spedizioneService: SpedizioneService,
    private readonly messageService: MessageService,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSpedizioni();
  }

  loadSpedizioni(): void {
    this.spedizioneService.getTutteSpedizioni(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.spedizioni = page.content;
        this.totalElements = page.totalElements;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento spedizioni', err);
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Errore caricamento spedizioni' });
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSpedizioni();
  }

  cambiaStato(id: string, nuovoStato: StatoSpedizione): void {
    this.spedizioneService.aggiornaStatoSpedizione(id, nuovoStato).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Stato modificato con successo' });
        this.loadSpedizioni();
      },
      error: (err) => {
        console.error('Errore modifica stato', err);
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Errore modifica stato' });
      }
    });
  }

  apriModalModifica(spedizione: Spedizione): void {
    const dialogRef = this.dialog.open(ShipmentEditDialog, {
      width: '400px',
      data: { 
        corriere: spedizione.corriere || '', 
        codiceTracking: spedizione.codiceTracking || '' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spedizioneService.aggiornaDettagliSpedizione(spedizione.id, result.corriere, result.codiceTracking)
          .subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Dettagli aggiornati con successo' });
              this.loadSpedizioni();
            },
            error: (err) => {
              console.error('Errore aggiornamento', err);
              this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Errore durante l\'aggiornamento' });
            }
          });
      }
    });
  }

  getStatoColor(stato: string): string {
    switch (stato) {
      case 'PREPARAZIONE': return 'accent';
      case 'SPEDITO': return 'primary';
      case 'IN_TRANSITO': return 'primary';
      case 'CONSEGNATO': return 'primary';
      case 'ANNULLATO': return 'warn';
      default: return '';
    }
  }
}
