import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  imports: [CommonModule, DialogModule, FormsModule, InputTextModule, DatePickerModule, ToastModule, RouterModule],
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
  dataResoPrevista: string = '';
  oraRitiroReso: string = '';
  idIndirizzoReso: string = ''; 
  todayStr: string = new Date().toISOString().split('T')[0];
  
  mostraDropdownIndirizzo: boolean = false;
  mostraDropdownOrario: boolean = false;
  orariDisponibili: string[] = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'];

  // Filtri
  mostraDropdownSpedizione = false;
  mostraDropdownReso = false;
  filterSpedizione = 'TUTTI';
  filterReso = 'TUTTI';

  private keycloak = inject(Keycloak);

  constructor(
    private ordineService: OrdineService,
    private resoService: ResoService,
    private indirizzoService: IndirizzoService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      this.caricaOrdini();
      this.caricaIndirizzi();
      
      let count = 0;
      const intervalId = setInterval(() => {
        this.cdr.detectChanges();
        count++;
        if(count > 10) clearInterval(intervalId); // Stop after 1 second (10 * 100ms)
      }, 100);
    } else {
      this.isLoading = false;
    }
  }

  get ordiniFiltrati(): any[] {
    return this.ordini.filter(o => {
      const matchSpedizione = this.filterSpedizione === 'TUTTI' || o.statoSpedizione === this.filterSpedizione;
      const matchReso = this.filterReso === 'TUTTI' || 
                        (this.filterReso === 'NESSUNO' ? !o.statoReso : o.statoReso === this.filterReso);
      return matchSpedizione && matchReso;
    });
  }

  toggleDropdownSpedizione(event: Event) {
    event.stopPropagation();
    this.mostraDropdownSpedizione = !this.mostraDropdownSpedizione;
    this.mostraDropdownReso = false;
  }

  selezionaFiltroSpedizione(stato: string) {
    this.filterSpedizione = stato;
    this.mostraDropdownSpedizione = false;
  }

  toggleDropdownReso(event: Event) {
    event.stopPropagation();
    this.mostraDropdownReso = !this.mostraDropdownReso;
    this.mostraDropdownSpedizione = false;
  }

  selezionaFiltroReso(stato: string) {
    this.filterReso = stato;
    this.mostraDropdownReso = false;
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.mostraDropdownSpedizione = false;
    this.mostraDropdownReso = false;
    this.mostraDropdownIndirizzo = false;
    this.mostraDropdownOrario = false;
  }

  vaiAlloShop() {
    this.router.navigate(['/risultati-ricerca'], { queryParams: { query: null } });
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore caricamento ordini", err);
        this.isLoading = false;
        this.cdr.detectChanges();
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

  formattaStato(stato: string): string {
    if (!stato) return '';
    return stato.replace(/_/g, ' ');
  }

  apriDialogReso(idDettaglioOrdine: string) {
    this.resoDettaglioOrdineId = idDettaglioOrdine;
    this.motivoReso = '';
    this.dataResoPrevista = '';
    this.oraRitiroReso = '';
    this.mostraDialogReso = true;
  }

  inviaReso() {
    if(!this.motivoReso || !this.dataResoPrevista || !this.oraRitiroReso || !this.idIndirizzoReso) {
      this.messageService.add({severity:'warn', summary:'Attenzione', detail:'Compila tutti i campi'});
      return;
    }

    const ora = parseInt(this.oraRitiroReso.split(':')[0], 10);
    if (ora < 9 || ora > 13) {
      this.messageService.add({severity:'warn', summary:'Orario Non Valido', detail:'L\'orario di ritiro deve essere compreso tra le 09:00 e le 13:00'});
      return;
    }

    const dataIso = this.dataResoPrevista;
    const oraIso = this.oraRitiroReso + ':00';

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

  toggleDropdownIndirizzo(event: Event) {
    event.stopPropagation();
    this.mostraDropdownIndirizzo = !this.mostraDropdownIndirizzo;
    this.mostraDropdownOrario = false;
  }

  selezionaIndirizzo(id: string) {
    this.idIndirizzoReso = id;
    this.mostraDropdownIndirizzo = false;
  }

  toggleDropdownOrario(event: Event) {
    event.stopPropagation();
    this.mostraDropdownOrario = !this.mostraDropdownOrario;
    this.mostraDropdownIndirizzo = false;
  }

  selezionaOrario(orario: string) {
    this.oraRitiroReso = orario;
    this.mostraDropdownOrario = false;
  }

  getIndirizzoDisplay(): string {
    const ind = this.indirizziUtente.find(i => i.id === this.idIndirizzoReso);
    if (ind) {
      return `${ind.via} ${ind.numeroCivico}, ${ind.citta} (${ind.provincia})`;
    }
    return 'Seleziona un indirizzo';
  }



  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.caricaOrdini();
    }
  }
}
