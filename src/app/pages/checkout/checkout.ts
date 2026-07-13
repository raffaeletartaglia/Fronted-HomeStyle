import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
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
  private keycloak = inject(Keycloak);
  idUtente: string = '';
  indirizzoSelezionato: any = null;
  modalitaSelezionata: any = null;
  modalitaDisponibili = [
    { id: '1', tipo: 'ONLINE', descrizione: 'Paga in modo sicuro con carta di credito' },
    { id: '2', tipo: 'FISICO', descrizione: 'Paga in contanti alla consegna' }
  ];
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      
      // Carica Indirizzi e pre-seleziona il default
      this.indirizzoService.getIndirizziUtenteObservable(this.idUtente).subscribe(res => {
        this.indirizzoService.indirizziUtente = res;
        const defaultInd = res.find((i: any) => i.isDefault);
        if (defaultInd) {
          this.indirizzoSelezionato = defaultInd;
        }
      });

      // Carica Carte e pre-seleziona la default
      this.cartaPagamentoService.getCarteUtenteObservable(this.idUtente).subscribe(res => {
        this.cartaPagamentoService.carteUtente = res;
        const defaultCarta = res.find((c: any) => c.isDefault);
        if (defaultCarta) {
          this.cartaSelezionata = defaultCarta;
          this.modalitaSelezionata = this.modalitaDisponibili.find(m => m.tipo === 'ONLINE');
        }
      });

      this.carrelloService.getCarrelloUtenteObservable(this.idUtente).subscribe({
        next: (res: any) => {
          this.cartItems = res.prodotti || [];
          this.totale = this.cartItems.reduce((acc: number, item: any) => acc + (item.prodotto.prezzo * item.quantita), 0);
        }
      });
    } else {
      this.keycloak.login();
    }
  }

  salvaNuovoIndirizzo() {
    if (!this.nuovoIndirizzo.via || !this.nuovoIndirizzo.citta) return;
    this.indirizzoService.aggiungiIndirizzo(this.idUtente, this.nuovoIndirizzo);
    this.isAddingIndirizzo = false;
    this.nuovoIndirizzo = { citta: '', provincia: '', cap: '', via: '', numeroCivico: '', tipo: 'SPEDIZIONE' };
    setTimeout(() => this.cdr.detectChanges(), 300);
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
    setTimeout(() => this.cdr.detectChanges(), 300);
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
    if (!this.indirizzoSelezionato || !this.modalitaSelezionata) return;
    if (this.modalitaSelezionata.tipo === 'ONLINE' && !this.cartaSelezionata) return;

    this.ordineService.creaOrdine(this.idUtente, this.indirizzoSelezionato.id).subscribe({
      next: (ordine) => {
        const datiPagamento = {
          importo: this.totale,
          modalitaPagamentoId: this.modalitaSelezionata.id,
          cartaPagamentoId: this.modalitaSelezionata.tipo === 'ONLINE' ? this.cartaSelezionata.id : null,
          pagamentoEffettuato: this.modalitaSelezionata.tipo === 'ONLINE' ? true : false,
          numeroRate: 1,
          rataCorrente: 1,
          importoRata: this.totale,
          ordineId: ordine.id
        };
        this.pagamentoService.creaPagamento(datiPagamento);
        
        const idCarrello = this.carrelloService.carrelloAttivo?.id;
        if (idCarrello) {
          this.carrelloService.svuotaCarrello(idCarrello);
        }
        
        setTimeout(() => this.router.navigateByUrl('/dashboard/orders'), 2000);
      },
      error: (err) => console.error("Errore creazione ordine", err)
    });
  }
}
