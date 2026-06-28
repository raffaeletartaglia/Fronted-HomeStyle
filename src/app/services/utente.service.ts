import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import { UserRegistration } from '../models/utenteRegistrazione.model';
import { Utente } from '../models/utente.model';
import { PasswordChange } from '../models/passwordChange';
import Keycloak from 'keycloak-js';
import { PopupService } from './popUp.service';


@Injectable({
  providedIn: 'root',
})

export class UtenteService {

  private profileURL = 'http://localhost:8080/api/utenti/me';
  private logoutURL = 'http://localhost:8080/api/auth/logout';

   constructor( private http: HttpClient, private keycloak: Keycloak, private popUp: PopupService) { }

  /**
   * Aggiorna i dati del profilo chiamando l'endpoint del DB Spring Boot
   */
  aggiornaProfilo(nome: string, cognome: string, numeroTelefono: string): Observable<any> {
    const payload = {
      nome: nome,
      cognome: cognome,
      numeroTelefono: numeroTelefono
    };
    return this.http.post(this.profileURL, payload);
  }

  /**
   * Effettua il logout lato backend: invia access e refresh token
   * all'endpoint /api/auth/logout per inserirli nella blacklist.
   * Questo impedisce che token rubati o scaduti vengano riutilizzati.
   */
  logoutBackend(accessToken: string, refreshToken: string): Observable<any> {
    const payload = {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
    return this.http.post(this.logoutURL, payload);
  }

  /**
   * (Vecchio metodo deprecato da quando c'è Keycloak)
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
          this.keycloak.login();
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