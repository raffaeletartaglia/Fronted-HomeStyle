import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { PopupService } from './popUp.service';
import { MovimentoMagazzino } from '../models/movimentoMagazzino.model';

@Injectable({
  providedIn: 'root',
})
export class MovimentoMagazzinoService {

  // LE NOSTRE VETRINE (Solo per ADMIN)
  movimenti: MovimentoMagazzino[] = [];

  // Vetrina speciale per conservare le informazioni della paginazione
  // (es. quante pagine ci sono in totale, a che pagina siamo, ecc.)
  datiPaginazione: any = null;

  // URL base
  private baseUrl = 'http://localhost:8080/api/v1/movimento-magazzino';

  constructor(
    private http: HttpClient,
    private router: Router,
    private popUpService: PopupService
  ) {}

  // ==========================================
  // METODO AIUTANTE PER LA SICUREZZA

  // ==========================================
  // 1. RECUPERA MOVIMENTI PER PRODOTTO (SOLO ADMIN)
  // Endpoint: GET /prodotto/{prodottoId}
  // ==========================================
  getMovimentiPerProdotto(prodottoId: string) {
    if (!prodottoId) return;

    const url = `${this.baseUrl}/prodotto/${prodottoId}`;

    this.http.get<MovimentoMagazzino[]>(url).subscribe(
      (response) => {
        this.movimenti = response;
        console.log(`Movimenti per prodotto ${prodottoId} caricati:`, this.movimenti);
      },
      (error) => {
        console.error("Errore caricamento movimenti prodotto", error);
        this.popUpService.updateStringa("Accesso Negato: Riservato agli Admin.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 2. RECUPERA MOVIMENTI PER ORDINE (SOLO ADMIN)
  // Endpoint: GET /ordine/{ordineId}
  // ==========================================
  getMovimentiPerOrdine(ordineId: string) {
    if (!ordineId) return;

    const url = `${this.baseUrl}/ordine/${ordineId}`;

    this.http.get<MovimentoMagazzino[]>(url).subscribe(
      (response) => {
        this.movimenti = response;
      },
      (error) => console.error("Errore caricamento movimenti ordine", error)
    );
  }

  // ==========================================
  // 3. RECUPERA MOVIMENTI PER RESO (SOLO ADMIN)
  // Endpoint: GET /reso/{resoId}
  // ==========================================
  getMovimentiPerReso(resoId: string) {
    if (!resoId) return;

    const url = `${this.baseUrl}/reso/${resoId}`;

    this.http.get<MovimentoMagazzino[]>(url).subscribe(
      (response) => {
        this.movimenti = response;
      },
      (error) => console.error("Errore caricamento movimenti reso", error)
    );
  }

  // ==========================================
  // 4. RECUPERA TUTTI I MOVIMENTI (PAGINATI - SOLO ADMIN)
  // Endpoint: GET /?page=X&size=Y
  // ==========================================
  getTuttiMovimenti(page: number = 0, size: number = 10) {

    // Aggiungiamo i parametri di paginazione all'URL
    const url = `${this.baseUrl}?page=${page}&size=${size}`;

    // Mettiamo <any> perché Spring restituisce un oggetto Page, non un semplice array
    this.http.get<any>(url).subscribe(
      (response) => {
        // Estrapoliamo l'array dei movimenti (che in Spring Data si trova dentro 'content')
        this.movimenti = response.content;

        // Salviamo l'intero oggetto di risposta per avere i dati di paginazione
        this.datiPaginazione = response;

        console.log("Movimenti globali paginati caricati:", this.movimenti);
      },
      (error) => console.error("Errore caricamento movimenti totali", error)
    );
  }

  // ==========================================
  // 5. AGGIUNGI RIFORNIMENTO MANUALE (SOLO ADMIN)
  // Endpoint: POST /rifornimento
  // ==========================================
  aggiungiRifornimento(prodottoId: string, quantita: number, note?: string) {
    if (!prodottoId || !quantita) return;

    // Il controller si aspetta i parametri via Query (nell'URL), quindi li concateniamo
    let url = `${this.baseUrl}/rifornimento?prodottoId=${prodottoId}&quantita=${quantita}`;
    if (note) {
      url += `&note=${encodeURIComponent(note)}`; // encodeURIComponent evita problemi se ci sono spazi o caratteri speciali
    }

    // Essendo i parametri nell'URL, passiamo null come body
    this.http.post<MovimentoMagazzino>(url, null).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Aggiungiamo in cima alla vetrina (unshift) o ricarichiamo la pagina 0
        this.movimenti.unshift(response);

        this.popUpService.updateStringa("Rifornimento registrato con successo!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore registrazione rifornimento", error);
        this.popUpService.updateStringa("Impossibile registrare il rifornimento.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

}
