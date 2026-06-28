import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser"
import { NotificationService } from '../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})

export class HomepageComponent {
  indexNovita: number = 0;
  indexOfferte: number = 0;

  constructor(private notificationService: NotificationService) {}

  testInfo() {
    this.notificationService.info('Informazione', 'Questo è un messaggio informativo normale.');
  }

  testSuccess() {
    this.notificationService.success('Operazione Completata', 'Azione andata a buon fine!');
  }

  testWarning() {
    this.notificationService.warning('Attenzione', 'Questa operazione non può essere eseguita.');
  }

  testError() {
    this.notificationService.error('Errore', 'L\'operazione è fallita miseramente.');
  }
}