import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
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
  imports: [CommonModule, FormsModule, StepperModule, ButtonModule, CardModule, RadioButtonModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {
  idUtente: string = '';
  indirizzoSelezionato: any = null;
  cartaSelezionata: any = null;
  cartItems: any[] = [];
  totale: number = 0;
  activeStep: number = 1;

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
      this.carrelloService.getCarrelloUtenteObservable(this.idUtente).subscribe({
        next: (res: any) => {
          this.cartItems = res.prodotti || [];
          this.totale = this.cartItems.reduce((acc: number, item: any) => acc + (item.prodotto.prezzo * item.quantita), 0);
        }
      });
    } else {
      this.router.navigate(['/']); // Redirect se non loggato
    }
  }

  confermaOrdine() {
    if (!this.indirizzoSelezionato || !this.cartaSelezionata) return;

    this.ordineService.creaOrdine(this.idUtente, this.indirizzoSelezionato.id).subscribe({
      next: (ordine) => {
        // Ordine creato, simuliamo pagamento
        const datiPagamento = {
          importo: this.totale,
          metodoPagamento: 'CARTA_CREDITO',
          statoPagamento: 'COMPLETATO',
          ordineId: ordine.id,
          cartaPagamentoId: this.cartaSelezionata.id
        };
        this.pagamentoService.creaPagamento(datiPagamento);
        this.carrelloService.svuotaCarrello(this.idUtente); // Se il BE non lo fa in automatico
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => console.error("Errore creazione ordine", err)
    });
  }
}
