import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Keycloak from 'keycloak-js';
import { IndirizzoService } from '../../../services/indirizzo.service';
import { NotificationService } from '../../../services/notification.service';
import { Indirizzo } from '../../../models/indirizzo.model';

@Component({
  selector: 'app-user-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-addresses.html',
  styleUrls: ['./user-addresses.css']
})
export class UserAddressesComponent implements OnInit {
  mostraFormIndirizzo = false;
  nuovoIndirizzo: any = { citta: '', provincia: '', nazione: '', cap: '', via: '', numeroCivico: '', tipo: 'SPEDIZIONE', isDefault: false };
  idUtente: string = '';

  constructor(
    public indirizzoService: IndirizzoService,
    private notification: NotificationService,
    private keycloak: Keycloak
  ) {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      this.indirizzoService.getIndirizziUtente(this.idUtente);
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

  eliminaIndirizzo(id: string) {
    this.indirizzoService.eliminaIndirizzo(id);
  }

  impostaPredefinito(indirizzo: Indirizzo) {
    // Creiamo una copia e settiamo isDefault = true
    const indirizzoAggiornato = { ...indirizzo, isDefault: true };
    this.indirizzoService.modificaIndirizzo(this.idUtente, indirizzo.id, indirizzoAggiornato);
  }
}
