import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { PopupService } from './popUp.service';
import { Indirizzo } from '../models/indirizzo.model';

@Injectable({
  providedIn: 'root',
})
export class IndirizzoService {

  // LA NOSTRA VETRINA: Tutti gli indirizzi dell'utente attualmente visualizzati
  indirizziUtente: Indirizzo[] = [];

  // Vetrina usata solo dall'Admin per vedere gli indirizzi di tutto il sistema
  indirizziGlobali: Indirizzo[] = [];

  // L'URL di base per il controller degli indirizzi
  private baseUrl = 'http://localhost:8080/api/v1/indirizzi';

  constructor(
    private http: HttpClient,
    private router: Router,
    private popUpService: PopupService
  ) {}

  // ==========================================
  // METODO AIUTANTE PER LA SICUREZZA

  // ==========================================
  // 1. RECUPERA INDIRIZZO TRAMITE ID
  // Endpoint: GET /{idIndirizzo}
  // ==========================================
  getIndirizzoPerId(idIndirizzo: string) {
    if (!idIndirizzo) return;

    const url = `${this.baseUrl}/${idIndirizzo}`;

    this.http.get<Indirizzo>(url).subscribe(
      (response) => {
        console.log("Indirizzo caricato:", response);
      },
      (error) => console.error("Errore caricamento singolo indirizzo", error)
    );
  }

  // ==========================================
  // 2. RECUPERA TUTTI GLI INDIRIZZI DI UN UTENTE
  // Endpoint: GET /utente/{idUtente}
  // ==========================================
  getIndirizziUtente(idUtente: string) {
    if (!idUtente) return;

    const url = `${this.baseUrl}/utente/${idUtente}`;

    this.http.get<Indirizzo[]>(url).subscribe(
      (response) => {
        // Popoliamo la vetrina con gli indirizzi dell'utente
        this.indirizziUtente = response;
      },
      (error) => console.error("Errore caricamento indirizzi utente", error)
    );
  }

  getIndirizziUtenteObservable(idUtente: string) {
    const url = `${this.baseUrl}/utente/${idUtente}`;
    return this.http.get<Indirizzo[]>(url);
  }

  // ==========================================
  // 3. RECUPERA INDIRIZZI DI UN UTENTE PER TIPO (Es. SPEDIZIONE)
  // Endpoint: GET /utente/{idUtente}/{tipo}
  // ==========================================
  getIndirizziUtentePerTipo(idUtente: string, tipo: string) {
    if (!idUtente || !tipo) return;

    const url = `${this.baseUrl}/utente/${idUtente}/${tipo}`;

    this.http.get<Indirizzo[]>(url).subscribe(
      (response) => {
        // Sostituiamo la vetrina con la lista filtrata
        this.indirizziUtente = response;
      },
      (error) => console.error("Errore caricamento indirizzi per tipo", error)
    );
  }

  // ==========================================
  // 4. RECUPERA TUTTI GLI INDIRIZZI A SISTEMA (ADMIN)
  // Endpoint: GET /
  // ==========================================
  getTuttiIndirizziAdmin() {

    this.http.get<Indirizzo[]>(this.baseUrl).subscribe(
      (response) => {
        this.indirizziGlobali = response;
      },
      (error) => {
        console.error("Errore caricamento totale indirizzi", error);
        this.popUpService.updateStringa("Accesso negato. Probabilmente non sei Admin.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 5. CREA UN NUOVO INDIRIZZO
  // Endpoint: POST /utente/{idUtente}
  // ==========================================
  aggiungiIndirizzo(idUtente: string, nuovoIndirizzo: any) {
    if (!idUtente || !nuovoIndirizzo) return;

    const url = `${this.baseUrl}/utente/${idUtente}`;

    this.http.post<Indirizzo>(url, nuovoIndirizzo).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: nuova referenza per triggerare change detection
        this.indirizziUtente = [...this.indirizziUtente, response];

        this.popUpService.updateStringa("Indirizzo aggiunto con successo!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore salvataggio indirizzo", error);
        this.popUpService.updateStringa("Errore durante il salvataggio dell'indirizzo.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 6. CREA UNA LISTA DI INDIRIZZI (MULTIFILE)
  // Endpoint: POST /utente/{idUtente}/lista
  // ==========================================
  aggiungiListaIndirizzi(idUtente: string, listaIndirizzi: any[]) {
    if (!idUtente || listaIndirizzi.length === 0) return;

    const url = `${this.baseUrl}/utente/${idUtente}/lista`;

    this.http.post<Indirizzo[]>(url, listaIndirizzi).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO: nuova referenza per triggerare change detection
        this.indirizziUtente = [...this.indirizziUtente, ...response];

        this.popUpService.updateStringa("Indirizzi multipli aggiunti con successo!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore salvataggio lista indirizzi", error);
        this.popUpService.updateStringa("Errore durante il salvataggio della lista.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 7. MODIFICA UN INDIRIZZO ESISTENTE
  // Endpoint: PUT /utente/{idUtente}/indirizzo/{idIndirizzo}
  // ==========================================
  modificaIndirizzo(idUtente: string, idIndirizzo: string, datiAggiornati: any) {
    if (!idUtente || !idIndirizzo || !datiAggiornati) return;

    const url = `${this.baseUrl}/utente/${idUtente}/indirizzo/${idIndirizzo}`;

    this.http.put<Indirizzo>(url, datiAggiornati).subscribe(
      (response) => {
        // Ricarica tutta la lista: il backend potrebbe aver modificato isDefault su più record
        this.getIndirizziUtente(idUtente);

        this.popUpService.updateStringa("Indirizzo modificato con successo!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore modifica indirizzo", error);
        this.popUpService.updateStringa("Errore durante la modifica dell'indirizzo.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  // ==========================================
  // 8. ELIMINA FISICAMENTE UN INDIRIZZO (Generico)
  // Endpoint: DELETE /{idIndirizzo}
  // ==========================================
  eliminaIndirizzo(idIndirizzo: string) {
    if (!idIndirizzo) return;

    const url = `${this.baseUrl}/${idIndirizzo}`;

    this.http.delete<void>(url).subscribe(
      () => {
        // AGGIORNAMENTO ISTANTANEO: Togliamo l'indirizzo dalla vetrina
        this.indirizziUtente = this.indirizziUtente.filter(i => i.id !== idIndirizzo);
        this.popUpService.updateStringa("Indirizzo eliminato.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore eliminazione indirizzo", error);
      }
    );
  }

  // ==========================================
  // 9. ELIMINA UN INDIRIZZO DI UNO SPECIFICO UTENTE
  // Endpoint: DELETE /utente/{idUtente}/indirizzo/{idIndirizzo}
  // ==========================================
  eliminaIndirizzoUtenteSpecifico(idUtente: string, idIndirizzo: string) {
    if (!idUtente || !idIndirizzo) return;

    const url = `${this.baseUrl}/utente/${idUtente}/indirizzo/${idIndirizzo}`;

    this.http.delete<void>(url).subscribe(
      () => {
        // AGGIORNAMENTO ISTANTANEO: Togliamo l'indirizzo dalla vetrina
        this.indirizziUtente = this.indirizziUtente.filter(i => i.id !== idIndirizzo);
        this.popUpService.updateStringa("Indirizzo dell'utente eliminato.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore eliminazione indirizzo utente specifico", error);
      }
    );
  }

  // ==========================================
  // 10. CANCELLA TUTTI GLI INDIRIZZI DI UN UTENTE
  // Endpoint: DELETE /utente/{idUtente}
  // ==========================================
  svuotaIndirizziUtente(idUtente: string) {
    if (!idUtente) return;

    const url = `${this.baseUrl}/utente/${idUtente}`;

    this.http.delete<void>(url).subscribe(
      () => {
        // AGGIORNAMENTO ISTANTANEO: Svuotiamo totalmente l'array
        this.indirizziUtente = [];
        this.popUpService.updateStringa("Rubrica indirizzi svuotata completamente.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore svuotamento rubrica indirizzi", error);
      }
    );
  }

}
