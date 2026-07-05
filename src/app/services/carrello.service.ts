import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { PopupService } from './popUp.service';
import { Carrello } from '../models/carrello.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class CarrelloService {

  // LA NOSTRA VETRINA: Qui salviamo il carrello dell'utente attualmente loggato
  carrelloAttivo: Carrello | null = null;
  carrelloProdottiPaginated: PaginatedResponse<any> | null = null;

  // L'URL di base (da cui derivano tutti gli altri)
  private baseUrl = 'http://localhost:8080/api/v1/carrello';

  constructor(
    private http: HttpClient,
    private router: Router,
    private popUpService: PopupService
  ) {}

  // ==========================================
  // METODO AIUTANTE PER LA SICUREZZA

  // ==========================================
  // 1. SCARICA IL CARRELLO DELL'UTENTE
  // Endpoint: GET /utente/{idUtente}
  // ==========================================
  getCarrelloUtente(idUtente: string) {
    if (!idUtente) return;

    const url = `${this.baseUrl}/utente/${idUtente}`;

    this.http.get<Carrello>(url).subscribe(
      (response) => {
        this.carrelloAttivo = response;
        console.log("Carrello caricato:", this.carrelloAttivo);
      },
      (error) => console.error("Errore caricamento carrello", error)
    );
  }

  getCarrelloUtenteObservable(idUtente: string) {
    const url = `${this.baseUrl}/utente/${idUtente}`;
    return this.http.get<Carrello>(url);
  }

  // ==========================================
  // 2. RECUPERA CARRELLO TRAMITE ID
  // Endpoint: GET /{idCarrello}
  // ==========================================
  getCarrelloPerId(idCarrello: string) {
    if (!idCarrello) return;

    const url = `${this.baseUrl}/${idCarrello}`;

    this.http.get<Carrello>(url).subscribe(
      (response) => {
        this.carrelloAttivo = response;
      },
      (error) => console.error("Errore recupero carrello per ID", error)
    );
  }

  // ==========================================
  // 3. RECUPERA SOLO LA LISTA DEI PRODOTTI
  // Endpoint: GET /{idCarrello}/prodotti
  // ==========================================
  getSoloProdotti(idCarrello: string, page: number = 0, size: number = 5) {
    if (!idCarrello) return;

    const url = `${this.baseUrl}/${idCarrello}/prodotti?page=${page}&size=${size}`;

    this.http.get<PaginatedResponse<any>>(url).subscribe(
      (response) => {
        this.carrelloProdottiPaginated = response;
        if (this.carrelloAttivo) {
          this.carrelloAttivo.prodotti = response.content;
        }
      },
      (error) => console.error("Errore recupero prodotti", error)
    );
  }

  getSoloProdottiObservable(idCarrello: string, page: number = 0, size: number = 5) {
    const url = `${this.baseUrl}/${idCarrello}/prodotti?page=${page}&size=${size}`;
    return this.http.get<PaginatedResponse<any>>(url);
  }

  // ==========================================
  // 4. CALCOLA TOTALE CARRELLO (Dal Server)
  // Endpoint: GET /{idCarrello}/totale
  // ==========================================
  getTotaleCarrello(idCarrello: string) {
    if (!idCarrello) return;

    const url = `${this.baseUrl}/${idCarrello}/totale`;

    this.http.get<number>(url).subscribe(
      (totale) => {
        console.log("Il totale calcolato dal server è:", totale);
      },
      (error) => console.error("Errore calcolo totale", error)
    );
  }

  getTotaleCarrelloObservable(idCarrello: string) {
    const url = `${this.baseUrl}/${idCarrello}/totale`;
    return this.http.get<number>(url);
  }

  // ==========================================
  // 5. AGGIUNGI PRODOTTI AL CARRELLO
  // Endpoint: POST /utente/{idUtente}/prodotti
  // ==========================================
  aggiungiProdotti(idUtente: string, prodottiDaAggiungere: any[]) {
    if (!idUtente || prodottiDaAggiungere.length === 0) return;

    const url = `${this.baseUrl}/utente/${idUtente}/prodotti`;

    this.http.post<Carrello>(url, prodottiDaAggiungere).subscribe(
      (response) => {
        this.carrelloAttivo = response;
        this.popUpService.updateStringa("Prodotti aggiunti al carrello!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore aggiunta al carrello", error);
        this.popUpService.updateStringa("Errore durante l'aggiunta al carrello.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  aggiungiProdottiObservable(idUtente: string, prodottiDaAggiungere: any[]) {
    const url = `${this.baseUrl}/utente/${idUtente}/prodotti`;
    return this.http.post<Carrello>(url, prodottiDaAggiungere);
  }

  // ==========================================
  // 6. AGGIORNA LA QUANTITÀ DI UN PRODOTTO
  // Endpoint: PUT /prodotti/{idCarrelloProdotto}/quantita?quantita=X
  // ==========================================
  aggiornaQuantita(idCarrelloProdotto: string, nuovaQuantita: number) {
    if (!idCarrelloProdotto || nuovaQuantita < 0) return;

    const url = `${this.baseUrl}/prodotti/${idCarrelloProdotto}/quantita?quantita=${nuovaQuantita}`;

    this.http.put<any>(url, null).subscribe(
      (prodottoAggiornato) => {
        if (this.carrelloAttivo && this.carrelloAttivo.prodotti) {
          const index = this.carrelloAttivo.prodotti.findIndex(p => p.id === idCarrelloProdotto);
          if (index !== -1) {
            this.carrelloAttivo.prodotti[index] = prodottoAggiornato;
          }
        }
      },
      (error) => {
        console.error("Errore aggiornamento quantità", error);
        this.popUpService.updateStringa("Impossibile aggiornare la quantità.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  aggiornaQuantitaObservable(idCarrelloProdotto: string, nuovaQuantita: number) {
    const url = `${this.baseUrl}/prodotti/${idCarrelloProdotto}/quantita?quantita=${nuovaQuantita}`;
    return this.http.put<any>(url, null);
  }

  // ==========================================
  // 7. RIMUOVI UN PRODOTTO DAL CARRELLO
  // Endpoint: DELETE /prodotti/{idCarrelloProdotto}
  // ==========================================
  rimuoviProdotto(idCarrelloProdotto: string) {
    if (!idCarrelloProdotto) return;

    const url = `${this.baseUrl}/prodotti/${idCarrelloProdotto}`;

    this.http.delete<void>(url).subscribe(
      () => {
        if (this.carrelloAttivo && this.carrelloAttivo.prodotti) {
          this.carrelloAttivo.prodotti = this.carrelloAttivo.prodotti.filter(p => p.id !== idCarrelloProdotto);
        }
        this.popUpService.updateStringa("Prodotto rimosso dal carrello.");
        this.popUpService.openPopups(999, false);
      },
      (error) => console.error("Errore rimozione prodotto", error)
    );
  }

  rimuoviProdottoObservable(idCarrelloProdotto: string) {
    const url = `${this.baseUrl}/prodotti/${idCarrelloProdotto}`;
    return this.http.delete<void>(url);
  }

  // ==========================================
  // 8. SVUOTA COMPLETAMENTE IL CARRELLO
  // Endpoint: DELETE /{idCarrello}/svuota
  // ==========================================
  svuotaCarrello(idCarrello: string) {
    if (!idCarrello) return;

    const url = `${this.baseUrl}/${idCarrello}/svuota`;

    this.http.delete<void>(url).subscribe(
      () => {
        if (this.carrelloAttivo) {
          this.carrelloAttivo.prodotti = [];
        }
        this.popUpService.updateStringa("Il carrello è stato svuotato.");
        this.popUpService.openPopups(999, false);
      },
      (error) => console.error("Errore svuotamento carrello", error)
    );
  }

  // ==========================================
  // 9. ELIMINA FISICAMENTE IL CARRELLO (ADMIN)
  // Endpoint: DELETE /{idCarrello}
  // ==========================================
  eliminaCarrelloAdmin(idCarrello: string) {
    if (!idCarrello) return;

    const url = `${this.baseUrl}/${idCarrello}`;

    this.http.delete<void>(url).subscribe(
      () => {
        this.carrelloAttivo = null;
        this.popUpService.updateStringa("Carrello eliminato dal database.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore eliminazione carrello", error);
        this.popUpService.updateStringa("Errore: Probabilmente non sei un Admin.");
        this.popUpService.openPopups(999, true);
      }
    );
  }
}
