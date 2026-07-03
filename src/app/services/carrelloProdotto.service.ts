import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { PopupService } from './popUp.service';
import { CarrelloProdotto } from '../models/carrelloProdotto.model';

@Injectable({
  providedIn: 'root',
})
export class CarrelloProdottoService {

  // LE NOSTRE VETRINE PER L'INTERFACCIA GRAFICA
  prodottiCarrello: CarrelloProdotto[] = [];
  totaleCarrello: number = 0;

  // L'URL di base per questo specifico controller
  private baseUrl = 'http://localhost:8080/api/v1/carrello-prodotto';

  constructor(
    private http: HttpClient,
    private router: Router,
    private popUpService: PopupService
  ) {}

  // ==========================================
  // METODO AIUTANTE PER LA SICUREZZA

  // ==========================================
  // 1. RECUPERA UNA SINGOLA RIGA CARRELLO
  // Endpoint: GET /{idCarrelloProdotto}
  // ==========================================
  getCarrelloProdottoPerId(idCarrelloProdotto: string) {
    if (!idCarrelloProdotto) return;

    const url = `${this.baseUrl}/${idCarrelloProdotto}`;

    this.http.get<CarrelloProdotto>(url).subscribe(
      (response) => {
        console.log("Singola riga carrello caricata:", response);
        // Essendo un singolo prodotto, di solito non si salva nell'array generale,
        // ma puoi gestirlo come preferisci se ti serve per una vista di "dettaglio".
      },
      (error) => console.error("Errore recupero riga carrello", error)
    );
  }

  // ==========================================
  // 2. RECUPERA TUTTI I PRODOTTI DI UN CARRELLO
  // Endpoint: GET /prodotti/{idCarrello}
  // ==========================================
  getProdottiDelCarrello(idCarrello: string) {
    if (!idCarrello) return;

    const url = `${this.baseUrl}/prodotti/${idCarrello}`;

    this.http.get<CarrelloProdotto[]>(url).subscribe(
      (response) => {
        // Riempiamo la nostra vetrina con tutti i prodotti scaricati
        this.prodottiCarrello = response;
        console.log("Prodotti del carrello caricati:", this.prodottiCarrello);
      },
      (error) => console.error("Errore recupero prodotti del carrello", error)
    );
  }

  // ==========================================
  // 3. AGGIORNA LA QUANTITÀ (O RIMUOVE SE È 0)
  // Endpoint: PUT /{idCarrelloProdotto}?quantita=X
  // ==========================================
  aggiornaQuantita(idCarrelloProdotto: string, nuovaQuantita: number) {
    if (!idCarrelloProdotto || nuovaQuantita < 0) return;

    const url = `${this.baseUrl}/${idCarrelloProdotto}?quantita=${nuovaQuantita}`;

    // Passiamo null come body perché i dati sono nell'URL
    this.http.put<CarrelloProdotto>(url, null).subscribe(
      (prodottoAggiornato) => {
        // AGGIORNAMENTO ISTANTANEO DELL'INTERFACCIA:
        if (nuovaQuantita === 0) {
          // Se la quantità è 0, il backend lo elimina. Quindi lo filtriamo via dall'array.
          this.prodottiCarrello = this.prodottiCarrello.filter(p => p.id !== idCarrelloProdotto);
          this.popUpService.updateStringa("Prodotto rimosso dal carrello.");
        } else {
          // Altrimenti cerchiamo il prodotto e aggiorniamo i suoi dati (es. la nuova quantità)
          const index = this.prodottiCarrello.findIndex(p => p.id === idCarrelloProdotto);
          if (index !== -1) {
            this.prodottiCarrello[index] = prodottoAggiornato;
          }
        }
      },
      (error) => {
        console.error("Errore aggiornamento quantità", error);
        this.popUpService.updateStringa("Errore durante l'aggiornamento della quantità.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 4. RIMUOVI FISICAMENTE UN PRODOTTO
  // Endpoint: DELETE /{idCarrelloProdotto}/rimuovi
  // ==========================================
  rimuoviProdottoDalCarrello(idCarrelloProdotto: string) {
    if (!idCarrelloProdotto) return;

    const url = `${this.baseUrl}/${idCarrelloProdotto}/rimuovi`;

    this.http.delete<void>(url).subscribe(
      () => {
        // AGGIORNAMENTO ISTANTANEO:
        // Togliamo il prodotto cancellato dall'array in memoria
        this.prodottiCarrello = this.prodottiCarrello.filter(p => p.id !== idCarrelloProdotto);

        this.popUpService.updateStringa("Prodotto rimosso con successo.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore rimozione prodotto", error);
        this.popUpService.updateStringa("Impossibile rimuovere il prodotto.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 5. CALCOLA IL TOTALE DEL CARRELLO
  // Endpoint: GET /{idCarrello}/totale
  // ==========================================
  calcolaTotaleCarrello(idCarrello: string) {
    if (!idCarrello) return;

    const url = `${this.baseUrl}/${idCarrello}/totale`;

    // Il backend restituisce un BigDecimal, che in TypeScript viene letto come 'number'
    this.http.get<number>(url).subscribe(
      (totale) => {
        // Salviamo il totale calcolato dal server nella nostra vetrina!
        this.totaleCarrello = totale;
      },
      (error) => console.error("Errore calcolo totale", error)
    );
  }

}
