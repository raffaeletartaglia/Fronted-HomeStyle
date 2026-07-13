import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RouterModule } from '@angular/router';

import { ResoService } from '../../../../services/reso.service';
import { Reso } from '../../../../models/reso.model';

@Component({
  selector: 'app-return-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    RouterModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './return-list.html',
  styleUrls: ['./return-list.css']
})
export class ReturnListComponent implements OnInit {
  resi: Reso[] = [];
  displayedColumns: string[] = ['id', 'dettaglioOrdineId', 'dataResoPrevista', 'oraRitiroReso', 'statoReso', 'azioni'];
  
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private readonly resoService: ResoService,
    private readonly messageService: MessageService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadResi();
  }

  loadResi(): void {
    this.resoService.getTuttiIResi(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.resi = page.content;
        this.totalElements = page.totalElements;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore durante il caricamento dei resi', err);
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Errore durante il caricamento dei resi' });
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadResi();
  }

  cambiaStato(resoId: string, nuovoStato: string): void {
    this.resoService.modificaStatoReso(resoId, nuovoStato).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Stato modificato con successo' });
        this.loadResi();
      },
      error: (err) => {
        console.error('Errore durante la modifica dello stato', err);
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Errore durante la modifica dello stato' });
      }
    });
  }

  getStatoColor(stato: string): string {
    switch (stato) {
      case 'RICHIESTO': return 'accent';
      case 'ACCETTATO': return 'primary';
      case 'RIFIUTATO': return 'warn';
      case 'ANNULLATO': return 'warn';
      default: return '';
    }
  }
}
