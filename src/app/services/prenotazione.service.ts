import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { PopupService } from './popUp.service';
import { Prenotazione } from '../models/prenotazione.model';

@Injectable({
  providedIn: 'root',
})
export class PrenotazioneService {

  // LE NOSTRE VETRINE
  // Vetrina per il cliente: mostra le sue prenotazioni o quelle di un prodotto
  prenotazioniUtente: Prenotazione[] = [];

  // Vetrina per l'Admin: usata per le liste globali filtrate per stato o data
  prenotazioniGlobali: Prenotazione[] = [];

  // URL base per il controller delle prenotazioni
  private baseUrl = 'http://localhost:8080/api/v1/prenotazione';

  constructor(
    private http: HttpClient,
    private router: Router,
    private popUpService: PopupService
  ) {}

  // ==========================================
  // METODO AIUTANTE PER LA SICUREZZA

  // ==========================================
  // 1. CREA UNA NUOVA PRENOTAZIONE
  // Endpoint: POST /api/v1/prenotazione
  // ==========================================
  creaPrenotazione(datiPrenotazione: any) {
    if (!datiPrenotazione) return;

    this.http.post<Prenotazione>(this.baseUrl, datiPrenotazione).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Aggiungiamo la prenotazione appena creata all'array
        this.prenotazioniUtente.push(response);

        this.popUpService.updateStringa("Prodotto prenotato con successo! Ti avviseremo quando sarà disponibile.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore creazione prenotazione", error);
        this.popUpService.updateStringa("Errore durante la prenotazione del prodotto.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 2. RECUPERA PRENOTAZIONI DI UN UTENTE
  // Endpoint: GET /api/v1/prenotazione/utente/{utenteId}
  // ==========================================
  getPrenotazioniUtente(utenteId: string) {
    if (!utenteId) return;

    const url = `${this.baseUrl}/utente/${utenteId}`;

    this.http.get<Prenotazione[]>(url).subscribe(
      (response) => {
        this.prenotazioniUtente = response;
      },
      (error) => console.error("Errore caricamento prenotazioni utente", error)
    );
  }

  // ==========================================
  // 3. RECUPERA TUTTE LE PRENOTAZIONI DI UN PRODOTTO
  // Endpoint: GET /api/v1/prenotazione/prodotto/{prodottoId}
  // ==========================================
  getPrenotazioniProdotto(prodottoId: string) {
    if (!prodottoId) return;

    const url = `${this.baseUrl}/prodotto/${prodottoId}`;

    this.http.get<Prenotazione[]>(url).subscribe(
      (response) => {
        this.prenotazioniUtente = response;
      },
      (error) => console.error("Errore caricamento prenotazioni prodotto", error)
    );
  }

  // ==========================================
  // 4. RECUPERA PRENOTAZIONI ATTIVE PER PRODOTTO
  // Endpoint: GET /api/v1/prenotazione/prodotto/{prodottoId}/attive
  // ==========================================
  getPrenotazioniAttiveProdotto(prodottoId: string) {
    if (!prodottoId) return;

    const url = `${this.baseUrl}/prodotto/${prodottoId}/attive`;

    this.http.get<Prenotazione[]>(url).subscribe(
      (response) => {
        this.prenotazioniUtente = response;
      },
      (error) => console.error("Errore caricamento prenotazioni attive prodotto", error)
    );
  }

  // ==========================================
  // 5. RECUPERA PRENOTAZIONI PER STATO (SOLO ADMIN)
  // Endpoint: GET /api/v1/prenotazione/stato/{stato}
  // ==========================================
  getPrenotazioniPerStato(stato: string) {
    if (!stato) return;

    const url = `${this.baseUrl}/stato/${stato}`;

    this.http.get<Prenotazione[]>(url).subscribe(
      (response) => {
        // Usiamo la vetrina globale per non sporcare quella dell'utente
        this.prenotazioniGlobali = response;
      },
      (error) => console.error("Errore caricamento prenotazioni per stato", error)
    );
  }

  // ==========================================
  // 6. RECUPERA PRENOTAZIONI IN ARRIVO (SOLO ADMIN)
  // Endpoint: GET /api/v1/prenotazione/in-arrivo?data=XYZ
  // ==========================================
  getPrenotazioniInArrivo(dataIsoString: string) {
    if (!dataIsoString) return;

    // Aggiungiamo la data come Query Parameter
    const url = `${this.baseUrl}/in-arrivo?data=${dataIsoString}`;

    this.http.get<Prenotazione[]>(url).subscribe(
      (response) => {
        this.prenotazioniGlobali = response;
      },
      (error) => console.error("Errore caricamento prenotazioni in arrivo", error)
    );
  }

  // ==========================================
  // 7. ANNULLA PRENOTAZIONE
  // Endpoint: PUT /api/v1/prenotazione/annulla/{prenotazioneId}
  // ==========================================
  annullaPrenotazione(prenotazioneId: string) {
    if (!prenotazioneId) return;

    const url = `${this.baseUrl}/annulla/${prenotazioneId}`;

    this.http.put<Prenotazione>(url, null).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Cerchiamo la prenotazione e sostituiamola con quella annullata
        const index = this.prenotazioniUtente.findIndex(p => p.id === prenotazioneId);
        if (index !== -1) {
          this.prenotazioniUtente[index] = response;
        }

        this.popUpService.updateStringa("La prenotazione è stata annullata.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore annullamento prenotazione", error);
        this.popUpService.updateStringa("Impossibile annullare la prenotazione.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 8. ESEGUI PRENOTAZIONE (Es. Conversione in Ordine)
  // Endpoint: PUT /api/v1/prenotazione/esegui/{prenotazioneId}
  // ==========================================
  eseguiPrenotazione(prenotazioneId: string) {
    if (!prenotazioneId) return;

    const url = `${this.baseUrl}/esegui/${prenotazioneId}`;

    this.http.put<Prenotazione>(url, null).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO
        const index = this.prenotazioniUtente.findIndex(p => p.id === prenotazioneId);
        if (index !== -1) {
          this.prenotazioniUtente[index] = response;
        }

        this.popUpService.updateStringa("La prenotazione è stata eseguita con successo!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore esecuzione prenotazione", error);
        this.popUpService.updateStringa("Impossibile eseguire la prenotazione.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

}
