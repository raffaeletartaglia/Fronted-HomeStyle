import { Component, OnInit, signal, HostListener, ChangeDetectorRef } from '@angular/core';
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
import { OrderDetailModal } from '../order-detail/order-detail';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSelectModule, MatProgressSpinnerModule, MatDialogModule, MatPaginatorModule, ToastModule],
  providers: [MessageService],
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
  
  openDropdownId: string | null = null;

  constructor(
    private readonly ordineService: OrdineService,
    private readonly dialog: MatDialog,
    private readonly messageService: MessageService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  @HostListener('document:click')
  closeDropdown() {
    this.openDropdownId = null;
  }

  toggleDropdown(orderId: string, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === orderId ? null : orderId;
  }

  loadOrders() {
    this.isLoading.set(true);
    this.ordineService.getAllOrdini(this.pageIndex, this.pageSize).subscribe({
      next: (data) => {
        // Ordina gli ordini per data decrescente (i più recenti prima)
        this.orders = data.content.sort((a, b) => new Date(b.dataOrdine).getTime() - new Date(a.dataOrdine).getTime());
        this.totalElements = data.totalElements;
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel caricamento ordini', err);
        this.isLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Non è stato possibile caricare gli ordini.' });
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  onStatoChange(order: Ordine, nuovoStato: string) {
    this.openDropdownId = null;
    if (order.statoOrdine === nuovoStato) return;

    this.ordineService.updateStatoOrdine(order.id, nuovoStato).subscribe({
      next: () => {
        order.statoOrdine = nuovoStato as StatoOrdine;
        this.messageService.add({ severity: 'success', summary: 'Stato Aggiornato', detail: "Lo stato dell'ordine è stato aggiornato con successo." });
      },
      error: (err) => {
        console.error("Errore durante l'aggiornamento dello stato", err);
        const msg = err.error?.messaggio || "Errore durante l'aggiornamento dello stato.";
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: msg });
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
