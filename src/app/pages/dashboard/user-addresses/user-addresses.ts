import { Component, OnInit, HostListener, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

import Keycloak from 'keycloak-js';
import { IndirizzoService } from '../../../services/indirizzo.service';
import { NotificationService } from '../../../services/notification.service';
import { Indirizzo } from '../../../models/indirizzo.model';

@Component({
  selector: 'app-user-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './user-addresses.html',
  styleUrls: ['./user-addresses.css']
})
export class UserAddressesComponent implements OnInit {
  mostraFormIndirizzo = false;
  mostraDropdownTipo = false;
  mostraDropdownFiltro = false;
  nuovoIndirizzo: any = { citta: '', provincia: '', nazione: '', cap: '', via: '', numeroCivico: '', tipo: 'SPEDIZIONE', isDefault: false };
  idUtente: string = '';

  // Dialogs
  mostraDialogEliminaTutto = false;
  mostraDialogEliminaSingolo = false;
  indirizzoDaEliminareId = '';

  selezionaTipo(tipo: string) {
    this.nuovoIndirizzo.tipo = tipo;
    this.mostraDropdownTipo = false;
  }

  toggleDropdownTipo(event: Event) {
    event.stopPropagation();
    this.mostraDropdownTipo = !this.mostraDropdownTipo;
    this.mostraDropdownFiltro = false;
  }

  selezionaFiltro(tipo: string) {
    this.filterType = tipo;
    this.mostraDropdownFiltro = false;
  }

  toggleDropdownFiltro(event: Event) {
    event.stopPropagation();
    this.mostraDropdownFiltro = !this.mostraDropdownFiltro;
    this.mostraDropdownTipo = false;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.mostraDropdownTipo = false;
    this.mostraDropdownFiltro = false;
  }

  private keycloak = inject(Keycloak);

  constructor(
    public indirizzoService: IndirizzoService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  searchQuery: string = '';
  filterType: string = 'TUTTI'; // 'TUTTI', 'SPEDIZIONE', 'FATTURAZIONE', 'RESIDENZA'

  get indirizziFiltrati(): Indirizzo[] {
    let indirizzi = this.indirizzoService.indirizziUtente || [];
    
    if (this.filterType !== 'TUTTI') {
      indirizzi = indirizzi.filter(ind => ind.tipo === this.filterType);
    }
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      indirizzi = indirizzi.filter(ind => 
        (ind.citta && ind.citta.toLowerCase().includes(query)) || 
        (ind.via && ind.via.toLowerCase().includes(query)) ||
        (ind.provincia && ind.provincia.toLowerCase().includes(query)) ||
        (ind.nazione && ind.nazione.toLowerCase().includes(query)) ||
        (ind.cap && ind.cap.includes(query))
      );
    }
    
    return indirizzi;
  }

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      this.indirizzoService.getIndirizziUtente(this.idUtente);
      
      // Fix initial load not displaying instantly:
      // Force change detection a few times to catch the async HTTP response from the service
      let count = 0;
      const intervalId = setInterval(() => {
        this.cdr.detectChanges();
        count++;
        if(count > 10) clearInterval(intervalId); // Stop after 1 second (10 * 100ms)
      }, 100);
    }
  }

  salvaIndirizzo() {
    // 1. Verifica campi obbligatori
    if (!this.nuovoIndirizzo.via || !this.nuovoIndirizzo.numeroCivico || !this.nuovoIndirizzo.citta || !this.nuovoIndirizzo.cap || !this.nuovoIndirizzo.provincia || !this.nuovoIndirizzo.nazione) {
      this.notification.warning('Dati Incompleti', 'Compila tutti i campi obbligatori dell\'indirizzo.');
      return;
    }

    // 2. Verifica Civico e CAP numerici
    if (!/^\d+$/.test(this.nuovoIndirizzo.numeroCivico)) {
      this.notification.warning('Dati Errati', 'Il numero civico deve contenere solo valori numerici.');
      return;
    }
    if (!/^\d+$/.test(this.nuovoIndirizzo.cap)) {
      this.notification.warning('Dati Errati', 'Il CAP deve contenere solo valori numerici.');
      return;
    }

    // 3. Formatta e verifica Provincia (2 lettere maiuscole)
    this.nuovoIndirizzo.provincia = this.nuovoIndirizzo.provincia.toUpperCase().trim();
    if (!/^[A-Z]{2}$/.test(this.nuovoIndirizzo.provincia)) {
      this.notification.warning('Dati Errati', 'La provincia deve essere esattamente di 2 lettere (es. RM, MI).');
      return;
    }

    if(this.idUtente) {
      this.indirizzoService.aggiungiIndirizzo(this.idUtente, this.nuovoIndirizzo);
      this.mostraFormIndirizzo = false;
      this.nuovoIndirizzo = { citta: '', provincia: '', nazione: '', cap: '', via: '', numeroCivico: '', tipo: 'SPEDIZIONE', isDefault: false };
    }
  }

  confermaEliminaIndirizzo(id: string) {
    this.indirizzoDaEliminareId = id;
    this.mostraDialogEliminaSingolo = true;
  }

  eseguiEliminaIndirizzo() {
    if (this.indirizzoDaEliminareId) {
      this.indirizzoService.eliminaIndirizzo(this.indirizzoDaEliminareId);
    }
    this.mostraDialogEliminaSingolo = false;
    this.indirizzoDaEliminareId = '';
  }

  confermaSvuotaIndirizzi() {
    this.mostraDialogEliminaTutto = true;
  }

  eseguiSvuotaIndirizzi() {
    this.indirizzoService.svuotaIndirizziUtente(this.idUtente);
    this.mostraDialogEliminaTutto = false;
  }

  impostaPredefinito(indirizzo: Indirizzo) {
    // Creiamo una copia e settiamo isDefault = true
    const indirizzoAggiornato = { ...indirizzo, isDefault: true };
    this.indirizzoService.modificaIndirizzo(this.idUtente, indirizzo.id, indirizzoAggiornato);
    this.forceDetectChanges();
  }

  private forceDetectChanges() {
    let count = 0;
    const intervalId = setInterval(() => {
      this.cdr.detectChanges();
      count++;
      if (count > 10) clearInterval(intervalId);
    }, 100);
  }
}
