import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdineService } from '../../../services/ordine.service';
import { ResoService } from '../../../services/reso.service';
import { IndirizzoService } from '../../../services/indirizzo.service';
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
  idIndirizzoReso: string = ''; 
  today: Date = new Date();

  constructor(
    private ordineService: OrdineService,
    private resoService: ResoService,
    private indirizzoService: IndirizzoService,
    private messageService: MessageService,
    private keycloak: Keycloak
  ) {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      this.caricaOrdini();
      this.caricaIndirizzi();
    } else {
      this.isLoading = false;
    }
  }

  get indirizziUtente() {
    return this.indirizzoService.indirizziUtente;
  }

  caricaIndirizzi() {
    this.indirizzoService.getIndirizziUtente(this.idUtente);
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

    const ora = this.oraRitiroReso.getHours();
    if (ora < 9 || ora > 13) {
      this.messageService.add({severity:'warn', summary:'Orario Non Valido', detail:'L\'orario di ritiro deve essere compreso tra le 09:00 e le 13:00'});
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
        this.caricaOrdini(); // Ricarichiamo per vedere lo stato aggiornato
      },
      error: (err) => {
        console.error(err);
        const errorMessage = err.error?.messaggio || 'Errore durante la richiesta di reso';
        this.messageService.add({severity:'error', summary:'Errore', detail: errorMessage});
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
