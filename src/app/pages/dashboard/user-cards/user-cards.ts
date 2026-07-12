import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Keycloak from 'keycloak-js';
import { CartaPagamentoService } from '../../../services/cartaPagamento.service';
import { NotificationService } from '../../../services/notification.service';
import { DialogModule } from 'primeng/dialog';
import { CartaPagamento } from '../../../models/cartaPagamento.model';

@Component({
  selector: 'app-user-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './user-cards.html',
  styleUrls: ['./user-cards.css']
})
export class UserCardsComponent implements OnInit {
  mostraFormCarta = false;
  mostraCvv = false;
  
  nuovaCarta: any = { 
    intestatario: '', 
    numeroCarta: '', 
    scadenza: '', 
    cvv: '', 
    tipoCarta: '', 
    isDefault: false 
  };
  idUtente: string = '';

  // Filtro
  mostraDropdownFiltro = false;
  filterTipoCarta = 'TUTTE'; // TUTTE, VISA, MASTERCARD

  // Dialogs
  mostraDialogEliminaTutto = false;
  mostraDialogEliminaSingola = false;
  cartaDaEliminareId = '';

  private keycloak = inject(Keycloak);

  constructor(
    public cartaPagamentoService: CartaPagamentoService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      this.cartaPagamentoService.getCarteUtente(this.idUtente);
      
      let count = 0;
      const intervalId = setInterval(() => {
        this.cdr.detectChanges();
        count++;
        if(count > 10) clearInterval(intervalId); // Stop after 1 second (10 * 100ms)
      }, 100);
    }
  }

  get carteFiltrate(): CartaPagamento[] {
    let carte = this.cartaPagamentoService.carteUtente || [];
    if (this.filterTipoCarta !== 'TUTTE') {
      carte = carte.filter((c: CartaPagamento) => c.tipoCarta === this.filterTipoCarta);
    }
    return carte;
  }

  toggleDropdownFiltro(event: Event) {
    event.stopPropagation();
    this.mostraDropdownFiltro = !this.mostraDropdownFiltro;
  }

  selezionaFiltro(tipo: string) {
    this.filterTipoCarta = tipo;
    this.mostraDropdownFiltro = false;
  }

  formattaNumeroCarta(event: any) {
    let input = event.target.value.replace(/\D/g, ''); // Rimuove tutto ciò che non è numerico
    input = input.substring(0, 16); // Massimo 16 cifre

    let formatted = '';
    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += input[i];
    }
    this.nuovaCarta.numeroCarta = formatted;

    // Riconosce automaticamente il tipo di carta
    this.nuovaCarta.tipoCarta = this.getCardTypeFromPrefix(input);
  }

  getCardTypeFromPrefix(numero: string): string {
    if (!numero) return '';
    if (numero.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(numero) || /^2[2-7]/.test(numero)) return 'MASTERCARD';
    if (/^(50|5[6-9]|6)/.test(numero)) return 'MAESTRO';
    return '';
  }

  formattaScadenza(event: any) {
    let input = event.target.value.replace(/\D/g, ''); // Solo numeri
    if (input.length > 2) {
      input = input.substring(0, 2) + '/' + input.substring(2, 4);
    }
    this.nuovaCarta.scadenza = input;
  }

  salvaCarta() {
    if (!this.nuovaCarta.intestatario || !this.nuovaCarta.numeroCarta || !this.nuovaCarta.scadenza || !this.nuovaCarta.cvv) {
      this.notification.warning('Dati Incompleti', 'Compila tutti i campi della carta.');
      return;
    }

    if (!this.nuovaCarta.tipoCarta) {
      this.notification.warning('Dati Errati', 'Tipo di carta non riconosciuto. Inserire una carta Visa, Mastercard o Maestro valida.');
      return;
    }
    
    // Validazione Scadenza MM/YY
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.nuovaCarta.scadenza)) {
      this.notification.warning('Dati Errati', 'La scadenza deve essere nel formato MM/YY e con mese valido (es. 05/26).');
      return;
    }
    
    // Verifica logica se non è già scaduta (opzionale ma consigliata)
    const parti = this.nuovaCarta.scadenza.split('/');
    const mese = parseInt(parti[0], 10);
    const anno = parseInt(parti[1], 10) + 2000;
    const now = new Date();
    if (anno < now.getFullYear() || (anno === now.getFullYear() && mese < now.getMonth() + 1)) {
      this.notification.warning('Carta Scaduta', 'La carta inserita risulta già scaduta.');
      return;
    }

    if (!/^\d{3,4}$/.test(this.nuovaCarta.cvv)) {
      this.notification.warning('Dati Errati', 'Il CVV deve contenere solo valori numerici (3 o 4 cifre).');
      return;
    }

    if(this.idUtente) {
      // Rimuoviamo gli spazi prima di inviare al backend
      const numeroPulito = this.nuovaCarta.numeroCarta.replace(/\s+/g, '');

      const cartaDaSalvare = {
        ...this.nuovaCarta,
        numeroCarta: numeroPulito,
        utenteId: this.idUtente
      };

      this.cartaPagamentoService.aggiungiCarta(cartaDaSalvare);
      this.mostraFormCarta = false;
      this.nuovaCarta = { intestatario: '', numeroCarta: '', scadenza: '', cvv: '', isDefault: false };
    }
  }

  confermaEliminaCarta(id: string) {
    this.cartaDaEliminareId = id;
    this.mostraDialogEliminaSingola = true;
  }

  eseguiEliminaCarta() {
    if (this.cartaDaEliminareId) {
      this.cartaPagamentoService.eliminaCarta(this.cartaDaEliminareId);
    }
    this.mostraDialogEliminaSingola = false;
    this.cartaDaEliminareId = '';
  }

  confermaSvuotaCarte() {
    this.mostraDialogEliminaTutto = true;
  }

  eseguiSvuotaCarte() {
    this.cartaPagamentoService.svuotaCarteUtente(this.idUtente);
    this.mostraDialogEliminaTutto = false;
  }

  impostaPredefinito(carta: CartaPagamento) {
    this.cartaPagamentoService.impostaComePredefinito(carta, true);
  }

  rimuoviPredefinito(carta: CartaPagamento) {
    this.cartaPagamentoService.impostaComePredefinito(carta, false);
  }
}
