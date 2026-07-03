import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { PopupService } from './popUp.service';
import { CartaPagamento } from '../models/cartaPagamento.model';

@Injectable({
  providedIn: 'root',
})
export class CartaPagamentoService {

  // LA NOSTRA VETRINA: Tutte le carte di pagamento dell'utente loggato
  carteUtente: CartaPagamento[] = [];

  // L'URL di base per il controller delle carte
  private baseUrl = 'http://localhost:8080/api/v1/carta-pagamento';

  constructor(
    private http: HttpClient,
    private router: Router,
    private popUpService: PopupService
  ) {}

  // ==========================================
  // METODO AIUTANTE PER LA SICUREZZA

  // ==========================================
  // 1. AGGIUNGI UNA NUOVA CARTA DI PAGAMENTO
  // Endpoint: POST /api/v1/carta-pagamento
  // ==========================================
  aggiungiCarta(nuovaCarta: any) {
    if (!nuovaCarta) return;

    // Passiamo i dati della carta (il RequestDTO) come body della richiesta
    this.http.post<CartaPagamento>(this.baseUrl, nuovaCarta).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Aggiungiamo la carta appena salvata alla vetrina!
        this.carteUtente.push(response);

        this.popUpService.updateStringa("Carta di pagamento aggiunta con successo!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore salvataggio carta", error);
        this.popUpService.updateStringa("Errore durante il salvataggio della carta.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 2. RECUPERA TUTTE LE CARTE DELL'UTENTE
  // Endpoint: GET /api/v1/carta-pagamento/utente/{utenteId}
  // ==========================================
  getCarteUtente(utenteId: string) {
    if (!utenteId) return;

    const url = `${this.baseUrl}/utente/${utenteId}`;

    this.http.get<CartaPagamento[]>(url).subscribe(
      (response) => {
        // Riempiamo la vetrina con le carte scaricate
        this.carteUtente = response;
        console.log("Carte utente caricate:", this.carteUtente);
      },
      (error) => console.error("Errore caricamento carte utente", error)
    );
  }

  // ==========================================
  // 3. RECUPERA DETTAGLI DI UNA SINGOLA CARTA
  // Endpoint: GET /api/v1/carta-pagamento/{cartaId}
  // ==========================================
  getCartaSingola(cartaId: string) {
    if (!cartaId) return;

    const url = `${this.baseUrl}/${cartaId}`;

    this.http.get<CartaPagamento>(url).subscribe(
      (response) => {
        console.log("Dettaglio carta caricato:", response);
      },
      (error) => console.error("Errore caricamento singola carta", error)
    );
  }

  // ==========================================
  // 4. ELIMINA CARTA DI PAGAMENTO
  // Endpoint: DELETE /api/v1/carta-pagamento/{idCartaPagamento}
  // ==========================================
  eliminaCarta(idCartaPagamento: string) {
    if (!idCartaPagamento) return;

    const url = `${this.baseUrl}/${idCartaPagamento}`;

    this.http.delete<void>(url).subscribe(
      () => {
        // AGGIORNAMENTO ISTANTANEO:
        // Filtriamo l'array rimuovendo la carta che abbiamo appena cancellato
        this.carteUtente = this.carteUtente.filter(c => c.id !== idCartaPagamento);

        this.popUpService.updateStringa("Carta di pagamento rimossa correttamente.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore eliminazione carta", error);
        this.popUpService.updateStringa("Impossibile eliminare la carta.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

}
