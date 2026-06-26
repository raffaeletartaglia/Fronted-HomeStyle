import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import { UserRegistration } from '../models/utenteRegistrazione.model';
import { Utente } from '../models/utente.model';
import { PasswordChange } from '../models/passwordChange';
import { KeyCloakService } from './keyCloack.service';
import { PopupService } from './popUp.service';


@Injectable({
  providedIn: 'root',
})

export class UtenteService {

  private profileURL = 'http://localhost:8080/api/utenti/me';

   constructor( private http: HttpClient, private keycloakService: KeyCloakService, private popUp: PopupService) { }

  /**
   * Crea o aggiorna il profilo dell'utente loggato
   */
   
  salvaProfilo(nome: string, cognome: string, email: string, numeroTelefono: string, password: string ){
    const datiUtente : UserRegistration ={
      nome : nome,
      cognome: cognome,
      email: email,
      numeroTelefono: numeroTelefono,
      password: password
    };
    this.inviaDatiUtente(datiUtente).subscribe(
      response => {
        this.popUp.updateStringa("Account creato correttamente! Verrai reinderizzato")
        this.popUp.openPopups(103, true)
        setTimeout(() => {
          this.keycloakService.login();
        }, 3000);
      },
      error => {
        this.popUp.updateStringa("Problemi nella creazione dell'account, riprova più tardi.")
        this.popUp.openPopups(1034, true)
        console.error('Error sending user data:', error);

      }
    );



  }

  /**
   * Recupera il profilo dell'utente autenticato
   */
 getUserData(): Observable<Utente> {
  return this.http.get<Utente>(this.profileURL);
}

   /**
   * Invia i dati per creare/aggiornare il profilo utente autenticato
   */
  inviaDatiUtente(datiUtente: UserRegistration): Observable<any>  {
    return this.http.post<any>(this.profileURL, datiUtente, {responseType: 'text' as 'json' });
  }

  



  
}