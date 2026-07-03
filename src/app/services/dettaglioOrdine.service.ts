import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { PopupService } from './popUp.service';
import { DettaglioOrdine } from '../models/dettaglioOrdine.model';

@Injectable({
  providedIn: 'root',
})
export class DettaglioOrdineService {

  // LE NOSTRE VETRINE
  // Vetrina per le liste (es. dettagli di un ordine o dettagli contenenti un prodotto)
  dettagliCorrenti: DettaglioOrdine[] = [];

  // Vetrina per un dettaglio singolo (se cercato per ID specifico)
  dettaglioSingolo: DettaglioOrdine | null = null;

  // URL base del controller
  private baseUrl = 'http://localhost:8080/api/v1/dettaglio-ordine';

  constructor(
    private http: HttpClient,
    private router: Router,
    private popUpService: PopupService
  ) {}

  // ==========================================
  // METODO AIUTANTE PER LA SICUREZZA

  // ==========================================
  // 1. RECUPERA SINGOLO DETTAGLIO PER ID
  // Endpoint: GET /api/v1/dettaglio-ordine/{idDettaglio}
  // ==========================================
  getDettaglioPerId(idDettaglio: string) {
    if (!idDettaglio) return;

    const url = `${this.baseUrl}/${idDettaglio}`;

    this.http.get<DettaglioOrdine>(url).subscribe(
      (response) => {
        // Salviamo il singolo risultato nella vetrina apposita
        this.dettaglioSingolo = response;
        console.log("Dettaglio ordine caricato:", this.dettaglioSingolo);
      },
      (error) => console.error("Errore caricamento dettaglio singolo", error)
    );
  }

  // ==========================================
  // 2. RECUPERA TUTTI I DETTAGLI DI UN ORDINE
  // Endpoint: GET /api/v1/dettaglio-ordine/ordine/{idOrdine}
  // ==========================================
  getDettagliPerOrdine(idOrdine: string) {
    if (!idOrdine) return;

    const url = `${this.baseUrl}/ordine/${idOrdine}`;

    this.http.get<DettaglioOrdine[]>(url).subscribe(
      (response) => {
        // Riempiamo l'array con tutti i dettagli di quell'ordine
        this.dettagliCorrenti = response;
        console.log("Dettagli dell'ordine caricati:", this.dettagliCorrenti);
      },
      (error) => console.error("Errore caricamento dettagli per ordine", error)
    );
  }

  // ==========================================
  // 3. RECUPERA TUTTI I DETTAGLI CHE CONTENGONO UN PRODOTTO
  // Endpoint: GET /api/v1/dettaglio-ordine/prodotto/{idProdotto}
  // ==========================================
  getDettagliPerProdotto(idProdotto: string) {
    if (!idProdotto) return;

    const url = `${this.baseUrl}/prodotto/${idProdotto}`;

    this.http.get<DettaglioOrdine[]>(url).subscribe(
      (response) => {
        // Anche in questo caso usiamo l'array perché potrebbe restituire più righe
        this.dettagliCorrenti = response;
        console.log("Dettagli contenenti il prodotto caricati:", this.dettagliCorrenti);
      },
      (error) => console.error("Errore caricamento dettagli per prodotto", error)
    );
  }

}
