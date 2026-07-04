import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-aiuto-contatti',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatExpansionModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './aiuto-contatti.html',
  styleUrls: ['./aiuto-contatti.css']
})
export class AiutoContattiComponent {

  contactForm = {
    nome: '',
    email: '',
    messaggio: ''
  };

  constructor(private messageService: MessageService) {}

  inviaMessaggio() {
    if (this.contactForm.nome && this.contactForm.email && this.contactForm.messaggio) {
      // Simula invio email
      this.messageService.add({
        severity: 'success', 
        summary: 'Messaggio Inviato', 
        detail: 'Grazie per averci contattato, ' + this.contactForm.nome + '. Ti risponderemo presto!'
      });
      // Reset form
      this.contactForm = { nome: '', email: '', messaggio: '' };
    } else {
      this.messageService.add({
        severity: 'error', 
        summary: 'Errore', 
        detail: 'Per favore, compila tutti i campi prima di inviare.'
      });
    }
  }
}
