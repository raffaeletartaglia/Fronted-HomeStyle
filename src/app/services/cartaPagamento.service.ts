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
        // AGGIORNAMENTO ISTANTANEO con spread operator per Change Detection
        this.carteUtente = [...this.carteUtente, response];

        // Se la nuova carta era predefinita, ricarichiamo la lista per allineare le altre
        if (response.isDefault) {
          this.getCarteUtente(response.utenteId);
        }

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

  getCarteUtenteObservable(utenteId: string) {
    const url = `${this.baseUrl}/utente/${utenteId}`;
    return this.http.get<CartaPagamento[]>(url);
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

  // ==========================================
  // Svuota tutte le carte dell'utente
  // ==========================================
  svuotaCarteUtente(idUtente: string) {
    if (!idUtente || !this.carteUtente || this.carteUtente.length === 0) return;

    // Simulate deleting all cards by deleting them one by one
    this.carteUtente.forEach(carta => {
      const url = `${this.baseUrl}/${carta.id}`;
      this.http.delete<void>(url).subscribe(
        () => {},
        (error) => console.error("Errore eliminazione carta", error)
      );
    });

    // AGGIORNAMENTO ISTANTANEO:
    this.carteUtente = [];
    this.popUpService.updateStringa("Tutte le carte sono state rimosse.");
    this.popUpService.openPopups(999, false);
  }

  // ==========================================
  // 5. IMPOSTA COME PREDEFINITO
  // Endpoint: PUT /api/v1/carta-pagamento/{idCartaPagamento}
  // ==========================================
  /**
   * Imposta o rimuove una carta come predefinita.
   * @param carta   La carta da modificare
   * @param valore  true = imposta come predefinita, false = rimuovi default (default: true)
   */
  impostaComePredefinito(carta: CartaPagamento, valore: boolean = true) {
    if (!carta) return;

    const url = `${this.baseUrl}/${carta.id}/predefinita?predefinita=${valore}`;

    this.http.patch<CartaPagamento>(url, null).subscribe(
      (response) => {
        // Aggiornamento locale istantaneo: se stiamo impostando una nuova predefinita,
        // azzeriamo il flag su tutte le altre carte e aggiorniamo quella modificata
        if (valore) {
          this.carteUtente = this.carteUtente.map(c => ({
            ...c,
            isDefault: c.id === carta.id
          }));
        } else {
          this.carteUtente = this.carteUtente.map(c =>
            c.id === carta.id ? { ...c, isDefault: false } : c
          );
        }
        const msg = valore ? 'Carta impostata come predefinita!' : 'Carta rimossa dai predefiniti.';
        this.popUpService.updateStringa(msg);
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error('Errore toggle predefinita carta', error);
        this.popUpService.updateStringa("Errore durante l'aggiornamento della carta.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

}
