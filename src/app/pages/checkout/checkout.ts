import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndirizzoService } from '../../services/indirizzo.service';
import { CartaPagamentoService } from '../../services/cartaPagamento.service';
import { CarrelloService } from '../../services/carrello.service';
import { OrdineService } from '../../services/ordine.service';
import { PagamentoService } from '../../services/pagamento.service';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {
  idUtente: string = '';
  indirizzoSelezionato: any = null;
  pagamentoOnlineSelezionato: boolean | null = null;
  cartaSelezionata: any = null;
  cartItems: any[] = [];
  totale: number = 0;
  activeStep: number = 1;

  isAddingIndirizzo: boolean = false;
  nuovoIndirizzo: any = { citta: '', provincia: '', cap: '', via: '', numeroCivico: '', tipo: 'SPEDIZIONE' };

  isAddingCarta: boolean = false;
  nuovaCarta: any = { intestatario: '', numeroCarta: '', scadenza: '', cvv: '' };

  constructor(
    public indirizzoService: IndirizzoService,
    public cartaPagamentoService: CartaPagamentoService,
    private carrelloService: CarrelloService,
    private ordineService: OrdineService,
    private pagamentoService: PagamentoService,
    private keycloak: Keycloak,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      this.indirizzoService.getIndirizziUtente(this.idUtente);
      this.cartaPagamentoService.getCarteUtente(this.idUtente);

      // Controlla se siamo in modalità "Acquisto Singolo"
      const state = history.state;
      if (state && state.singoloProdotto) {
        this.cartItems = [{
          prodotto: state.singoloProdotto,
          quantita: state.quantita || 1
        }];
        this.totale = this.cartItems.reduce((acc: number, item: any) => acc + (item.prodotto.prezzo * item.quantita), 0);
      } else {
        // Altrimenti carica il carrello normale
        this.carrelloService.getCarrelloUtenteObservable(this.idUtente).subscribe({
          next: (res: any) => {
            this.cartItems = res.prodotti || [];
            this.totale = this.cartItems.reduce((acc: number, item: any) => acc + (item.prodotto.prezzo * item.quantita), 0);
          }
        });
      }
    } else {
      this.keycloak.login();
    }
  }

  salvaNuovoIndirizzo() {
    if (!this.nuovoIndirizzo.via || !this.nuovoIndirizzo.citta) return;
    this.indirizzoService.aggiungiIndirizzo(this.idUtente, this.nuovoIndirizzo);
    this.isAddingIndirizzo = false;
    this.nuovoIndirizzo = { citta: '', provincia: '', cap: '', via: '', numeroCivico: '', tipo: 'SPEDIZIONE' };
  }

  salvaNuovaCarta() {
    if (!this.nuovaCarta.intestatario || !this.nuovaCarta.numeroCarta || !this.nuovaCarta.scadenza || !this.nuovaCarta.cvv) {
      alert("Compila tutti i campi della carta.");
      return;
    }
    
    // Validazione Scadenza MM/YY
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.nuovaCarta.scadenza)) {
      alert("La scadenza deve essere nel formato MM/YY (es. 05/26).");
      return;
    }

    if (!this.nuovaCarta.tipoCarta) {
      alert("Tipo di carta non riconosciuto. Inserire una carta Visa, Mastercard o Maestro valida.");
      return;
    }

    // Rimuoviamo gli spazi prima di inviare al backend
    const numeroPulito = this.nuovaCarta.numeroCarta.replace(/\s+/g, '');

    const cartaDaSalvare = {
      ...this.nuovaCarta,
      numeroCarta: numeroPulito,
      utenteId: this.idUtente
    };

    this.cartaPagamentoService.aggiungiCarta(cartaDaSalvare);
    this.isAddingCarta = false;
    this.nuovaCarta = { intestatario: '', numeroCarta: '', scadenza: '', cvv: '' };
  }

  formattaNumeroCarta(event: any) {
    let input = event.target.value.replace(/\D/g, ''); // Solo numeri
    input = input.substring(0, 16);

    let formatted = '';
    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += input[i];
    }
    this.nuovaCarta.numeroCarta = formatted;
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

  confermaOrdine() {
    if (!this.indirizzoSelezionato || this.pagamentoOnlineSelezionato === null) return;
    if (this.pagamentoOnlineSelezionato && !this.cartaSelezionata) return;

    const state = history.state;
    const isAcquistoSingolo = state && state.singoloProdotto;

    const ordineObservable = isAcquistoSingolo 
      ? this.ordineService.creaOrdineSingolo(this.idUtente, this.indirizzoSelezionato.id, state.singoloProdotto.id, state.quantita || 1)
      : this.ordineService.creaOrdine(this.idUtente, this.indirizzoSelezionato.id);

    ordineObservable.subscribe({
      next: (ordine) => {
        const datiPagamento = {
          importo: this.totale,
          pagamentoOnline: this.pagamentoOnlineSelezionato,
          cartaPagamentoId: this.pagamentoOnlineSelezionato ? this.cartaSelezionata.id : null,
          pagamentoEffettuato: this.pagamentoOnlineSelezionato ? true : false,
          ordineId: ordine.id
        };
        this.pagamentoService.creaPagamento(datiPagamento);
        
        if (!isAcquistoSingolo) {
          const idCarrello = this.carrelloService.carrelloAttivo?.id;
          if (idCarrello) {
            this.carrelloService.svuotaCarrello(idCarrello);
          }
        }
        
        setTimeout(() => this.router.navigateByUrl('/dashboard/orders'), 2000);
      },
      error: (err) => console.error("Errore creazione ordine", err)
    });
  }
}
