import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { PopupService } from './popUp.service';
import { Pagamento } from '../models/pagamento.model';

@Injectable({
  providedIn: 'root',
})
export class PagamentoService {

  // LA NOSTRA VETRINA: Il pagamento che l'utente sta visualizzando o effettuando in questo momento
  pagamentoCorrente: Pagamento | null = null;

  // L'URL base per il controller dei pagamenti
  private baseUrl = 'http://localhost:8080/api/v1/pagamento';

  constructor(
    private http: HttpClient,
    private router: Router,
    private popUpService: PopupService
  ) {}

  // ==========================================
  // METODO AIUTANTE PER LA SICUREZZA

  // ==========================================
  // 1. CREA UN NUOVO PAGAMENTO (IN ATTESA)
  // Endpoint: POST /api/v1/pagamento
  // ==========================================
  creaPagamento(datiPagamento: any) {
    if (!datiPagamento) return;

    // Passiamo i dati della richiesta nel body
    this.http.post<Pagamento>(this.baseUrl, datiPagamento).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Mettiamo il pagamento appena creato nella vetrina
        this.pagamentoCorrente = response;

        console.log("Transazione di pagamento creata:", this.pagamentoCorrente);
        this.popUpService.updateStringa("Transazione creata. Procedi al pagamento.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore creazione pagamento", error);
        this.popUpService.updateStringa("Errore durante la creazione del pagamento.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 2. RECUPERA DETTAGLIO PAGAMENTO TRAMITE ID
  // Endpoint: GET /api/v1/pagamento/{pagamentoId}
  // ==========================================
  getPagamentoPerId(pagamentoId: string) {
    if (!pagamentoId) return;

    const url = `${this.baseUrl}/${pagamentoId}`;

    this.http.get<Pagamento>(url).subscribe(
      (response) => {
        this.pagamentoCorrente = response;
      },
      (error) => console.error("Errore recupero pagamento per ID", error)
    );
  }

  // ==========================================
  // 3. RECUPERA PAGAMENTO DI UN ORDINE SPECIFICO
  // Endpoint: GET /api/v1/pagamento/ordine/{ordineId}
  // ==========================================
  getPagamentoPerOrdine(ordineId: string) {
    if (!ordineId) return;

    const url = `${this.baseUrl}/ordine/${ordineId}`;

    this.http.get<Pagamento>(url).subscribe(
      (response) => {
        // Mettiamo in vetrina il pagamento associato a quell'ordine
        this.pagamentoCorrente = response;
        console.log("Pagamento dell'ordine caricato:", this.pagamentoCorrente);
      },
      (error) => console.error("Errore recupero pagamento per ordine", error)
    );
  }

  // ==========================================
  // 4. ANNULLA UN PAGAMENTO
  // Endpoint: PUT /api/v1/pagamento/annulla/{pagamentoId}
  // ==========================================
  annullaPagamento(pagamentoId: string) {
    if (!pagamentoId) return;

    const url = `${this.baseUrl}/annulla/${pagamentoId}`;

    // Passiamo null come body visto che usiamo solo l'URL
    this.http.put<Pagamento>(url, null).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Il backend ci restituisce il pagamento annullato, lo mettiamo in vetrina
        this.pagamentoCorrente = response;

        this.popUpService.updateStringa("Il pagamento è stato annullato.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore annullamento pagamento", error);
        this.popUpService.updateStringa("Impossibile annullare il pagamento.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 5. EFFETTUA (CONFERMA) IL PAGAMENTO
  // Endpoint: PUT /api/v1/pagamento/effettua/{pagamentoId}
  // ==========================================
  effettuaPagamento(pagamentoId: string) {
    if (!pagamentoId) return;

    const url = `${this.baseUrl}/effettua/${pagamentoId}`;

    this.http.put<Pagamento>(url, null).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Aggiorniamo la vetrina col pagamento completato
        this.pagamentoCorrente = response;

        this.popUpService.updateStringa("Pagamento confermato! Ordine completato.");
        this.popUpService.openPopups(999, false);

        // Da pro: qui potresti usare 'this.router.navigate(['/conferma'])' per mandare
        // l'utente alla pagina di "Grazie per l'acquisto!"
      },
      (error) => {
        console.error("Errore durante il pagamento", error);
        this.popUpService.updateStringa("Transazione fallita o respinta.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 6. PAGA UNA RATA (Sistemi Rateali)
  // Endpoint: PUT /api/v1/pagamento/rata/{pagamentoId}
  // ==========================================
  pagaRata(pagamentoId: string) {
    if (!pagamentoId) return;

    const url = `${this.baseUrl}/rata/${pagamentoId}`;

    this.http.put<Pagamento>(url, null).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Aggiorniamo la vetrina con il nuovo numero rata corrente
        this.pagamentoCorrente = response;

        this.popUpService.updateStringa(`Rata n°${response.rataCorrente} pagata con successo!`);
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore pagamento rata", error);
        this.popUpService.updateStringa("Errore durante il pagamento della rata.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

}
