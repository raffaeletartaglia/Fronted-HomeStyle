import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { PopupService } from './popUp.service';
import { Recensione } from '../models/recensione.model';

@Injectable({
  providedIn: 'root',
})
export class RecensioneService {

  // LA NOSTRA VETRINA
  // Raccoglie le recensioni che stiamo guardando al momento
  // (es. tutte quelle di un singolo prodotto o tutte quelle lasciate dall'utente)
  recensioni: Recensione[] = [];

  // L'URL base per il controller delle recensioni
  private baseUrl = 'http://localhost:8080/api/v1/recensione';

  constructor(
    private http: HttpClient,
    private router: Router,
    private popUpService: PopupService
  ) {}

  // ==========================================
  // METODO AIUTANTE PER LA SICUREZZA

  // ==========================================
  // 1. CREA UNA NUOVA RECENSIONE
  // Endpoint: POST /api/v1/recensione
  // ==========================================
  creaRecensione(datiRecensione: any) {
    if (!datiRecensione) return;

    // I dati (voto, commento, ecc.) viaggiano nel corpo della chiamata
    this.http.post<Recensione>(this.baseUrl, datiRecensione).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Aggiungiamo la recensione all'elenco a schermo
        this.recensioni.push(response);

        this.popUpService.updateStringa("Grazie! La tua recensione è stata pubblicata.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore creazione recensione", error);
        this.popUpService.updateStringa("Errore: impossibile pubblicare la recensione. Hai già recensito questo prodotto?");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 2. RECUPERA TUTTE LE RECENSIONI DI UN PRODOTTO
  // Endpoint: GET /api/v1/recensione/prodotto/{prodottoId}
  // ==========================================
  getRecensioniProdotto(prodottoId: string) {
    if (!prodottoId) return;

    const url = `${this.baseUrl}/prodotto/${prodottoId}`;

    this.http.get<Recensione[]>(url).subscribe(
      (response) => {
        // Riempiamo la vetrina con i feedback del prodotto (utile nella pagina dettaglio prodotto)
        this.recensioni = response;
      },
      (error) => console.error("Errore caricamento recensioni del prodotto", error)
    );
  }

  // ==========================================
  // 3. RECUPERA TUTTE LE RECENSIONI DI UN UTENTE
  // Endpoint: GET /api/v1/recensione/utente/{utenteId}
  // ==========================================
  getRecensioniUtente(utenteId: string) {
    if (!utenteId) return;

    const url = `${this.baseUrl}/utente/${utenteId}`;

    this.http.get<Recensione[]>(url).subscribe(
      (response) => {
        // Riempiamo la vetrina con i feedback dell'utente (utile nella pagina profilo utente)
        this.recensioni = response;
      },
      (error) => console.error("Errore caricamento recensioni dell'utente", error)
    );
  }

  // ==========================================
  // 4. RECUPERA RECENSIONE DI UN DETTAGLIO ORDINE
  // Endpoint: GET /api/v1/recensione/dettaglio-ordine/{dettaglioOrdineId}
  // ==========================================
  getRecensioneDettaglioOrdine(dettaglioOrdineId: string) {
    if (!dettaglioOrdineId) return;

    const url = `${this.baseUrl}/dettaglio-ordine/${dettaglioOrdineId}`;

    this.http.get<Recensione[]>(url).subscribe(
      (response) => {
        this.recensioni = response;
      },
      (error) => console.error("Errore caricamento recensione dell'ordine", error)
    );
  }

  // ==========================================
  // 5. MODIFICA UNA RECENSIONE ESISTENTE
  // Endpoint: PUT /api/v1/recensione/{recensioneId}
  // ==========================================
  modificaRecensione(recensioneId: string, datiAggiornati: any) {
    if (!recensioneId || !datiAggiornati) return;

    const url = `${this.baseUrl}/${recensioneId}`;

    this.http.put<Recensione>(url, datiAggiornati).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Cerchiamo la vecchia recensione e la aggiorniamo
        const index = this.recensioni.findIndex(r => r.id === recensioneId);
        if (index !== -1) {
          this.recensioni[index] = response;
        }

        this.popUpService.updateStringa("La tua recensione è stata modificata.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore modifica recensione", error);
        this.popUpService.updateStringa("Errore durante la modifica della recensione.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 6. ELIMINA UNA RECENSIONE
  // Endpoint: DELETE /api/v1/recensione/{recensioneId}
  // ==========================================
  eliminaRecensione(recensioneId: string) {
    if (!recensioneId) return;

    const url = `${this.baseUrl}/${recensioneId}`;

    this.http.delete<void>(url).subscribe(
      () => {
        // AGGIORNAMENTO ISTANTANEO: Rimuoviamo la recensione dalla vetrina
        this.recensioni = this.recensioni.filter(r => r.id !== recensioneId);

        this.popUpService.updateStringa("Recensione eliminata con successo.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore eliminazione recensione", error);
        this.popUpService.updateStringa("Impossibile eliminare la recensione.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

}
