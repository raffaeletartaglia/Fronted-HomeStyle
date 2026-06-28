import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import Keycloak from 'keycloak-js';
import { UtenteService } from '../../../services/utente.service';

/**
 * Componente per l'Header dell'applicazione (Navbar in alto).
 * 
 * Questo componente funge da guscio condiviso per tutte le pagine, ed è
 * responsabile di gestire lo stato di autenticazione dell'utente
 * chiamando i metodi di Keycloak (Login, Logout, Registrazione, Profilo).
 */
@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        MatToolbarModule, MatButtonModule, MatIconModule, NgIf
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css', '../../../../styles.css']
})
export class HeaderComponent implements OnInit {

    isLoggedIn: boolean = false;
    userProfile: any = null;

    constructor(private keycloak: Keycloak, private utenteService: UtenteService) {}

    /**
     * Inizializza il componente leggendo lo stato di autenticazione
     * da Keycloak. Se l'utente è loggato, prova a prendere i dati dal nostro DB.
     * Se il DB risponde 404 (nuovo utente appena registrato), lo sincronizza
     * automaticamente con i dati del token chiamando creaOAggiorna.
     */
    ngOnInit() {
        this.isLoggedIn = this.keycloak.authenticated ?? false;
        
        if (this.isLoggedIn) {
            // Proviamo a ottenere i dati dal nostro backend (database locale)
            this.utenteService.getUserData().subscribe({
                next: (datiDb) => {
                    // L'utente esiste già nel DB, usiamo i suoi dati
                    this.userProfile = {
                        firstName: datiDb.nome,
                        lastName: datiDb.cognome,
                        email: datiDb.email
                    };
                },
                error: (err) => {
                    // Se il server risponde 404 (utente non trovato), significa che
                    // si è appena registrato su Keycloak ma non esiste nel nostro DB.
                    // Lo sincronizziamo!
                    if (err.status === 404 && this.keycloak.tokenParsed) {
                        const tokenNome = this.keycloak.tokenParsed['given_name'] || '';
                        const tokenCognome = this.keycloak.tokenParsed['family_name'] || '';
                        
                        this.utenteService.aggiornaProfilo(tokenNome, tokenCognome, '').subscribe({
                            next: (newDati) => {
                                this.userProfile = {
                                    firstName: newDati.nome,
                                    lastName: newDati.cognome,
                                    email: newDati.email
                                };
                            }
                        });
                    }
                }
            });
        }
    }

    /**
     * Effettua il reindirizzamento dell'utente alla pagina di Login
     * esposta direttamente da Keycloak.
     */
    async login() {
        await this.keycloak.login();
    }

    /**
     * Reindirizza l'utente alla pagina di Registrazione
     * gestita nativamente da Keycloak (Signup).
     */
    async register() {
        await this.keycloak.register();
    }

    /**
     * Effettua il logout in 2 fasi:
     * 1. Chiama il backend Spring Boot per inserire access e refresh token
     *    nella blacklist (così non possono essere riutilizzati).
     * 2. Chiama Keycloak per distruggere la sessione e fare redirect alla home.
     */
    async logout() {
        const accessToken = this.keycloak.token;
        const refreshToken = this.keycloak.refreshToken;

        if (accessToken && refreshToken) {
            // Prima invalidiamo i token lato backend
            this.utenteService.logoutBackend(accessToken, refreshToken).subscribe({
                next: () => {
                    console.log('Token inseriti nella blacklist del backend.');
                },
                error: (err: any) => {
                    console.error('Errore durante la blacklist dei token:', err);
                },
                complete: async () => {
                    // Poi facciamo il logout da Keycloak (redirect alla home)
                    await this.keycloak.logout({ redirectUri: window.location.origin });
                }
            });
        } else {
            // Se non abbiamo i token (caso raro), facciamo logout diretto da Keycloak
            await this.keycloak.logout({ redirectUri: window.location.origin });
        }
    }

    /**
     * Apre il pannello "Account Management" di Keycloak, una pagina
     * integrata che permette all'utente di gestire la sua password, i dispositivi,
     * l'autenticazione a due fattori e i dati personali.
     */
    async manageAccount() {
        await this.keycloak.accountManagement();
    }
}
