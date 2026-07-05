import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import Keycloak from 'keycloak-js';
import { NotificationService } from '../../../services/notification.service';
import { UtenteService } from '../../../services/utente.service';
import { CartaPagamentoService } from '../../../services/cartaPagamento.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  profileForm: FormGroup;
  
  // Flag per mostrare il caricamento
  isLoading = false;

  // Il costruttore duplicato e ngOnInit precedente sono stati rimossi.

  onSubmit() {
    if (this.profileForm.invalid) {
      this.notification.warning('Attenzione', 'Compila tutti i campi correttamente.');
      return;
    }

    this.isLoading = true;
    const formValues = this.profileForm.value;

    // Chiamata al backend per persistere i dati nel nostro DB
    this.utenteService.aggiornaProfilo(formValues.firstName, formValues.lastName, formValues.numeroTelefono)
      .subscribe({
        next: (response) => {
          this.notification.success('Successo', 'Profilo aggiornato con successo!');
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.notification.error('Errore', 'Impossibile salvare il profilo nel database.');
          this.isLoading = false;
        }
      });
  }

  constructor(
    private fb: FormBuilder,
    private keycloak: Keycloak,
    private notification: NotificationService,
    private utenteService: UtenteService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      numeroTelefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]]
    });
  }

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.isLoading = true;
      
      // Carica Dati Utente
      this.utenteService.getUserData().subscribe({
        next: (dati) => {
          this.profileForm.patchValue({
            firstName: dati.nome,
            lastName: dati.cognome,
            email: dati.email,
            numeroTelefono: dati.numeroTelefono
          });
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Errore nel recupero del profilo dal DB:", err);
          this.isLoading = false;
        }
      });
    }
  }
}
