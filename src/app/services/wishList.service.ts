import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { UtenteService } from "./utente.service";
import { PopupService } from "./popUp.service";
import { Wishlist } from "../models/wishlist.model";

@Injectable({
  providedIn: 'root',
})
export class WishListService{

    wishlist: Wishlist | null = null;
    prodottiWishlist: any[] = [];

    constructor(private utenteService: UtenteService, private http: HttpClient, private popUpService:PopupService) {}

  getUserWishList(idUtente: string) {
    if (!idUtente || idUtente.trim() === '') {
      console.warn("Attenzione: hai provato a cercare una wishlist senza passare l'ID utente!");
      return;
    }

    this.prodottiWishlist = [];
    this.wishlist = null;

    const urlCompleto = `http://localhost:8080/api/v1/wishlist/utente/${idUtente}`;

    this.http.get<Wishlist>(urlCompleto).subscribe(
      (response) => {
        if (response) {
            this.wishlist = response;
            this.prodottiWishlist = response.prodotti || [];
            console.log("Wishlist caricata!", this.prodottiWishlist);
        }
      },
      (error) => {
        console.error("Errore nel caricamento della wishlist", error);
        this.popUpService.updateStringa("Errore di connessione col server durante il caricamento della wishlist.");
        this.popUpService.openPopups(999, true);
      }
    );
  }
  
  aggiungiProdottoAWishlist(idUtente: string, idProdotto: string) {
    if (!idUtente || !idProdotto) return;

    const urlCompleto = `http://localhost:8080/api/v1/wishlist/utente/${idUtente}/prodotto/${idProdotto}`;

    this.http.post<Wishlist>(urlCompleto, null).subscribe(
      (response) => {
        this.wishlist = response;
        this.prodottiWishlist = response.prodotti || [];
        this.popUpService.updateStringa("Prodotto aggiunto alla tua lista dei desideri!");
        this.popUpService.openPopups(999, false);
      },
      (error) => {
        console.error("Errore durante l'aggiunta alla wishlist", error);
        this.popUpService.updateStringa("Si è verificato un errore durante l'aggiunta del prodotto.");
        this.popUpService.openPopups(999, true);
      }
    );
  }

  rimuoviDaWishlist(idUtente: string, idProdotto: string) {
    if (!idUtente || !idProdotto) return;

    const urlCompleto = `http://localhost:8080/api/v1/wishlist/utente/${idUtente}/prodotto/${idProdotto}`;

    this.http.delete<Wishlist>(urlCompleto).subscribe(
      (response) => {
        this.wishlist = response;
        this.prodottiWishlist = response.prodotti || [];
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

    const urlCompleto = `http://localhost:8080/api/v1/wishlist/utente/${idUtente}/svuota`;

    this.http.delete<void>(urlCompleto).subscribe(
      () => {
        this.wishlist = null;
        this.prodottiWishlist = [];
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
