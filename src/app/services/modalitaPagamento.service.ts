import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { PopupService } from './popUp.service';
import { ModalitaPagamento } from '../models/modalitaPagamento.model';

@Injectable({
  providedIn: 'root',
})
export class ModalitaPagamentoService {

  // LA NOSTRA VETRINA: Tutte le modalità di pagamento disponibili nel sistema
  modalitaDisponibili: ModalitaPagamento[] = [];

  // L'URL di base per il controller delle modalità di pagamento
  private baseUrl = 'http://localhost:8080/api/v1/modalita-pagamento';

  constructor(
    private http: HttpClient,
    private router: Router,
    private popUpService: PopupService
  ) {}

  // ==========================================
  // METODO AIUTANTE PER LA SICUREZZA

  // ==========================================
  // 1. RECUPERA TUTTE LE MODALITÀ DI PAGAMENTO (USER / ADMIN)
  // Endpoint: GET /
  // ==========================================
  getAllModalita() {

    this.http.get<ModalitaPagamento[]>(this.baseUrl).subscribe(
      (response) => {
        // Riempiamo la vetrina con tutte le modalità (es. PayPal, Bonifico)
        this.modalitaDisponibili = response;
        console.log("Modalità di pagamento caricate:", this.modalitaDisponibili);
      },
      (error) => console.error("Errore caricamento modalità di pagamento", error)
    );
  }

  // ==========================================
  // 2. RECUPERA DETTAGLIO DI UNA SINGOLA MODALITÀ (USER / ADMIN)
  // Endpoint: GET /{id}
  // ==========================================
  getModalitaPerId(id: string) {
    if (!id) return;

    const url = `${this.baseUrl}/${id}`;

    this.http.get<ModalitaPagamento>(url).subscribe(
      (response) => {
        console.log("Dettaglio modalità caricato:", response);
      },
      (error) => console.error("Errore caricamento singola modalità", error)
    );
  }

  // ==========================================
  // 3. CREA UNA NUOVA MODALITÀ (SOLO ADMIN)
  // Endpoint: POST /
  // ==========================================
  creaModalita(nuovaModalita: any) {
    if (!nuovaModalita) return;

    this.http.post<ModalitaPagamento>(this.baseUrl, nuovaModalita).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Aggiungiamo la nuova modalità alla vetrina dell'Admin
        this.modalitaDisponibili.push(response);

        this.popUpService.updateStringa("Nuova modalità di pagamento creata con successo!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore creazione modalità", error);
        this.popUpService.updateStringa("Errore: Impossibile creare la modalità (sei un Admin?)");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 4. MODIFICA UNA MODALITÀ ESISTENTE (SOLO ADMIN)
  // Endpoint: PUT /{id}
  // ==========================================
  modificaModalita(id: string, datiAggiornati: any) {
    if (!id || !datiAggiornati) return;

    const url = `${this.baseUrl}/${id}`;

    this.http.put<ModalitaPagamento>(url, datiAggiornati).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: Troviamo la modalità e la aggiorniamo in memoria
        const index = this.modalitaDisponibili.findIndex(m => m.id === id);
        if (index !== -1) {
          this.modalitaDisponibili[index] = response;
        }

        this.popUpService.updateStringa("Modalità di pagamento modificata!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore modifica modalità", error);
        this.popUpService.updateStringa("Errore durante la modifica della modalità.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 5. ELIMINA UNA MODALITÀ DI PAGAMENTO (SOLO ADMIN)
  // Endpoint: DELETE /{id}
  // ==========================================
  eliminaModalita(id: string) {
    if (!id) return;

    const url = `${this.baseUrl}/${id}`;

    this.http.delete<void>(url).subscribe(
      () => {
        // AGGIORNAMENTO ISTANTANEO: Rimuoviamo la modalità dalla vetrina
        this.modalitaDisponibili = this.modalitaDisponibili.filter(m => m.id !== id);

        this.popUpService.updateStringa("Modalità di pagamento eliminata dal sistema.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore eliminazione modalità", error);
        this.popUpService.updateStringa("Impossibile eliminare. Verificare permessi Admin.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

}
