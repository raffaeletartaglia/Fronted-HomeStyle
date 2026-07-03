import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtenteService } from "./utente.service";
import { PopupService } from "./popUp.service";
import { Wishlist } from "../models/wishlist.model";

@Injectable({
  providedIn: 'root',
})
export class WishListService{

    wishlistUtente: Wishlist[] = [];

    constructor(private utenteService: UtenteService, private http: HttpClient, private popUpService:PopupService) {}

    private getWishListUtentesURL = 'http://localhost:8080/api/v1/wishlist/utente';

    private addProductToWishListURL = 'http://localhost:8080/api/v1/wishlist/utente/{{idUtente}}/prodotto/{{idProdotto}}';

    private aggiornaPrioritaURL = 'http://localhost:8080/api/v1/wishlist/{{idWishlist}}/priorita';

    private rimuoviDaWishlistUrl = 'http://localhost:8080/api/v1/wishlist/{{idWishlist}}';

    private svuotaWishlistUtenteURL = 'http://localhost:8080/api/v1/wishlist/utente/{{idUtente}}/svuota';

  getUserWishList(idUtente: string) {
    // 1. CONTROLLO INPUT: L'ID è valido?
    if (!idUtente || idUtente.trim() === '') {
      console.warn("Attenzione: hai provato a cercare una wishlist senza passare l'ID utente!");
      return;
    }

    // 3. PULIZIA STATO: Svuotiamo i vecchi dati prima di caricare i nuovi
    this.wishlistUtente = [];

    // CHIAMATA VERA E PROPRIA
    const urlCompleto = `${this.getWishListUtentesURL}/${idUtente}`;

    this.http.get<Wishlist[]>(urlCompleto).subscribe(
      (response) => {
        this.wishlistUtente = response;
        console.log("Wishlist caricata!", this.wishlistUtente);
      },
      (error) => {
        console.error("Errore nel caricamento della wishlist", error);

        this.popUpService.updateStringa("Errore di connessione col server durante il caricamento della wishlist.");
        this.popUpService.openPopups(999, true);
      }
    );
  }
  
  aggiungiProdottoAWishlist(idUtente: string, idProdotto: string, priorita?: string) {
    // 1. CONTROLLO INPUT
    if (!idUtente || !idProdotto) {
      console.warn("Attenzione: Manca l'ID utente o l'ID prodotto.");
      return;
    }

    // 3. COSTRUZIONE URL RESTful
    let urlCompleto = `http://localhost:8080/api/v1/wishlist/utente/${idUtente}/prodotto/${idProdotto}`;

    // Aggiunta parametro opzionale se presente
    if (priorita) {
      urlCompleto += `?priorita=${priorita}`;
    }

    // 4. CHIAMATA POST (il body è null perché passiamo i dati nell'URL)
    this.http.post<Wishlist>(urlCompleto, null).subscribe(
      (response) => {
        // SUCCESSO!
        console.log("Prodotto aggiunto con successo al database:", response);

        // Diamo feedback visivo all'utente
        this.popUpService.updateStringa("Prodotto aggiunto alla tua lista dei desideri!");
        this.popUpService.openPopups(999, false);

        // AGGIORNAMENTO ISTANTANEO (La Scelta A)
        // Inseriamo il prodotto restituito dal server direttamente nella nostra "vetrina"
        // così la pagina si aggiorna magicamente senza ricaricare nulla!
        this.wishlistUtente.push(response);
      },
      (error) => {
        // GESTIONE ERRORE
        console.error("Errore durante l'aggiunta alla wishlist", error);
        this.popUpService.updateStringa("Si è verificato un errore durante l'aggiunta del prodotto.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  aggiornaPriorita(idWishlist: string, nuovaPriorita: string) {
    if (!idWishlist || !nuovaPriorita) return;

    // URL: /api/v1/wishlist/{idWishlist}/priorita?nuovaPriorita=ALTA
    const urlCompleto = `http://localhost:8080/api/v1/wishlist/${idWishlist}/priorita?nuovaPriorita=${nuovaPriorita}`;

    // Essendo un PUT che prende i dati dall'URL, il body è null
    this.http.put<Wishlist>(urlCompleto, null).subscribe(
      (response) => {
        // AGGIORNAMENTO ISTANTANEO:
        // Cerchiamo l'oggetto nel nostro array e ne aggiorniamo solo la priorità
        const index = this.wishlistUtente.findIndex(item => item.id === idWishlist);
        if (index !== -1) {
          this.wishlistUtente[index].priorita = response.priorita;
        }

        this.popUpService.updateStringa("Priorità aggiornata con successo!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore aggiornamento priorità", error);
        this.popUpService.updateStringa("Errore durante l'aggiornamento della priorità.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  rimuoviDaWishlist(idWishlist: string) {
    if (!idWishlist) return;

    // URL: /api/v1/wishlist/{idWishlist}
    const urlCompleto = `http://localhost:8080/api/v1/wishlist/${idWishlist}`;

    // Attenzione: nelle chiamate DELETE non si passa mai il 'body' (null), si passano solo gli header!
    this.http.delete<void>(urlCompleto).subscribe(
      () => {
        // AGGIORNAMENTO ISTANTANEO:
        // Teniamo nell'array solo gli elementi che NON hanno l'ID appena cancellato
        this.wishlistUtente = this.wishlistUtente.filter(item => item.id !== idWishlist);

        this.popUpService.updateStringa("Prodotto rimosso dalla wishlist.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore rimozione", error);
        this.popUpService.updateStringa("Errore durante la rimozione del prodotto.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  svuotaWishlistUtente(idUtente: string) {
    if (!idUtente) return;

    // URL: /api/v1/wishlist/utente/{idUtente}/svuota
    const urlCompleto = `http://localhost:8080/api/v1/wishlist/utente/${idUtente}/svuota`;

    this.http.delete<void>(urlCompleto).subscribe(
      () => {
        // AGGIORNAMENTO ISTANTANEO:
        // Visto che abbiamo cancellato tutto, semplicemente svuotiamo il nostro array!
        this.wishlistUtente = [];

        this.popUpService.updateStringa("La tua lista dei desideri è stata svuotata.");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore svuotamento", error);
        this.popUpService.updateStringa("Errore durante lo svuotamento della wishlist.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

}
