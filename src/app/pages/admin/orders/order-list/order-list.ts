import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrdineService } from '../../../../services/ordine.service';
import { Ordine, StatoOrdine } from '../../../../models/ordine.model';
import { NotificationModal } from '../../../../notification-modal/notification-modal';
import { OrderDetailModal } from '../order-detail/order-detail';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSelectModule, MatProgressSpinnerModule, MatDialogModule, MatPaginatorModule],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})
export class OrderList implements OnInit {
  orders: Ordine[] = [];
  displayedColumns: string[] = ['id', 'data', 'utente', 'totale', 'stato', 'azioni'];
  isLoading = signal(true);

  // Pagination variables
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  statiDisponibili: StatoOrdine[] = ['IN_ELABORAZIONE', 'SPEDITO', 'CONSEGNATO', 'ANNULLATO'];

  constructor(
    private readonly ordineService: OrdineService,
    private readonly dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.ordineService.getAllOrdini(this.pageIndex, this.pageSize).subscribe({
      next: (data) => {
        // Ordina gli ordini per data decrescente (i più recenti prima)
        this.orders = data.content.sort((a, b) => new Date(b.dataOrdine).getTime() - new Date(a.dataOrdine).getTime());
        this.totalElements = data.totalElements;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore nel caricamento ordini', err);
        this.isLoading.set(false);
        this.dialog.open(NotificationModal, { data: { title: 'Errore', message: 'Non è stato possibile caricare gli ordini.', level: 'error' } });
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  onStatoChange(order: Ordine, nuovoStato: string) {
    if (order.statoOrdine === nuovoStato) return;

    this.ordineService.updateStatoOrdine(order.id, nuovoStato).subscribe({
      next: () => {
        order.statoOrdine = nuovoStato as StatoOrdine;
        this.dialog.open(NotificationModal, { data: { title: 'Stato Aggiornato', message: "Lo stato dell'ordine è stato aggiornato con successo.", level: 'success' } });
      },
      error: (err) => {
        console.error("Errore durante l'aggiornamento dello stato", err);
        const msg = err.error?.messaggio || "Errore durante l'aggiornamento dello stato.";
        this.dialog.open(NotificationModal, { data: { title: 'Errore', message: msg, level: 'error' } });
        this.loadOrders(); // Ricarica per ripristinare la UI
      }
    });
  }

  openDetails(order: Ordine) {
    this.dialog.open(OrderDetailModal, {
      width: '800px',
      data: { order }
    });
  }

  formatStato(stato: string): string {
    if (!stato) return '';
    return stato.replaceAll('_', ' ');
  }
}
