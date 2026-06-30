import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationModal, NotificationData } from '../notification-modal/notification-modal';

/**
 * Servizio globale per la gestione delle notifiche (Toast / Modali).
 * 
 * Questo servizio espone i metodi per mostrare dei messaggi di feedback
 * all'utente tramite una modale di Angular Material (NotificationModal).
 * Ispirato alle classiche librerie di Toast, permette di mostrare
 * vari livelli di messaggi: Info, Success, Warning, ed Error.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private readonly dialog: MatDialog) {}

  /**
   * Mostra una modale informativa con un'icona azzurra (info).
   * @param title Titolo della notifica
   * @param message Corpo del messaggio
   */
  info(title: string, message: string): void {
    this.openModal(title, message, 'info');
  }

  /**
   * Mostra una modale di successo con un'icona verde (check_circle).
   * @param title Titolo della notifica
   * @param message Corpo del messaggio
   */
  success(title: string, message: string): void {
    this.openModal(title, message, 'success');
  }

  /**
   * Mostra una modale di avviso con un'icona arancione (warning).
   * @param title Titolo della notifica
   * @param message Corpo del messaggio
   */
  warning(title: string, message: string): void {
    this.openModal(title, message, 'warning');
  }

  /**
   * Mostra una modale di errore con un'icona rossa (error).
   * @param title Titolo della notifica
   * @param message Corpo del messaggio
   */
  error(title: string, message: string): void {
    this.openModal(title, message, 'error');
  }

  /**
   * Metodo privato interno che invoca MatDialog per aprire effettivamente il componente NotificationModal.
   * Passa i dati configurati (titolo, messaggio, livello) al componente che li visualizzerà.
   * 
   * @param title Titolo della modale
   * @param message Messaggio da visualizzare
   * @param level Il livello che determina il colore e l'icona della modale
   */
  private openModal(title: string, message: string, level: NotificationData['level']): void {
    this.dialog.open(NotificationModal, {
      data: { title, message, level },
      width: '400px',
      autoFocus: false,
      panelClass: 'bootstrap-dialog-container'
    });
  }
}
