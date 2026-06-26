import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtenteService } from "./utente.service";
import { PopupService } from "./popUp.service";
import { Wishlist } from "../models/wishlist.model";
import { KeyCloakService } from "./keyCloack.service";



@Injectable({
  providedIn: 'root',
})
export class WishListService{

    wishlistUtente: Wishlist[] = [];

    constructor(private utenteService: UtenteService, private http: HttpClient, private popUpService:PopupService, private keycloakService: KeyCloakService) {}

    private getWishListUtentesURL = 'http://localhost:8080/api/v1/wishlist/utente';

    private addProductToWishListURL = 'http://localhost:8080/api/v1/wishlist/utente/{{idUtente}}/prodotto/{{idProdotto}}';

    private aggiornaPrioritaURL = 'http://localhost:8080/api/v1/wishlist/{{idWishlist}}/priorita';

    private rimuoviDaWishlistUrl = 'http://localhost:8080/api/v1/wishlist/{{idWishlist}}';

    private svuotaWishlistUtenteURL = 'http://localhost:8080/api/v1/wishlist/utente/{{idUtente}}/svuota';

    getUserWishList(idUtente: string) {
        
    }

    /* aggiungiAWishlist */

    /*aggiornaPriorita*/

    /* rimuoviDaWishlist */

    /* svuotaWishlistPerUtente */

}