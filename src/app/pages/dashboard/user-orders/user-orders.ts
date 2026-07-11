import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdineService } from '../../../services/ordine.service';
import { ResoService } from '../../../services/reso.service';
import Keycloak from 'keycloak-js';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule, InputTextModule, DatePickerModule, ToastModule],
  providers: [MessageService],
  templateUrl: './user-orders.html',
  styleUrls: ['./user-orders.css']
})
export class UserOrdersComponent implements OnInit {
  idUtente: string = '';
  ordini: any[] = [];
  isLoading: boolean = true;
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 5;

  // Dialog Reso
  mostraDialogReso: boolean = false;
  resoDettaglioOrdineId: string = '';
  
  // Campi form reso
  motivoReso: string = '';
  dataResoPrevista: Date | null = null;
  oraRitiroReso: Date | null = null;
  idIndirizzoReso: string = 'fa1b0a88-eeb6-4114-87cf-45123d24268e'; // TODO: Prenderlo dagli indirizzi utente (hardcoded per ora)

  constructor(
    private ordineService: OrdineService,
    private resoService: ResoService,
    private messageService: MessageService,
    private keycloak: Keycloak
  ) {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      this.caricaOrdini();
    } else {
      this.isLoading = false;
    }
  }

  caricaOrdini() {
    this.isLoading = true;
    this.ordineService.getOrdiniPerUtente(this.idUtente, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.ordini = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Errore caricamento ordini", err);
        this.isLoading = false;
        this.messageService.add({severity:'error', summary:'Errore', detail:'Impossibile caricare gli ordini'});
      }
    });
  }

  getStatoSeverity(stato: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch(stato) {
      case 'IN_ELABORAZIONE': return 'info';
      case 'SPEDITO': return 'warn';
      case 'CONSEGNATO': return 'success';
      case 'ANNULLATO': return 'danger';
      default: return 'secondary';
    }
  }

  apriDialogReso(idDettaglioOrdine: string) {
    this.resoDettaglioOrdineId = idDettaglioOrdine;
    this.motivoReso = '';
    this.dataResoPrevista = null;
    this.oraRitiroReso = null;
    this.mostraDialogReso = true;
  }

  inviaReso() {
    if(!this.motivoReso || !this.dataResoPrevista || !this.oraRitiroReso || !this.idIndirizzoReso) {
      this.messageService.add({severity:'warn', summary:'Attenzione', detail:'Compila tutti i campi'});
      return;
    }

    const dataIso = this.dataResoPrevista.toISOString().split('T')[0];
    const oraIso = this.oraRitiroReso.toTimeString().split(' ')[0];

    this.resoService.creaReso(
      this.resoDettaglioOrdineId, 
      this.idIndirizzoReso, 
      dataIso, 
      oraIso, 
      this.motivoReso
    ).subscribe({
      next: (res) => {
        this.messageService.add({severity:'success', summary:'Successo', detail:'Reso richiesto correttamente'});
        this.mostraDialogReso = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({severity:'error', summary:'Errore', detail:'Errore durante la richiesta di reso'});
      }
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.caricaOrdini();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.caricaOrdini();
    }
  }
}
