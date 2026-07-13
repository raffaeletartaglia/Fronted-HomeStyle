import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { StanzaService } from '../../../../services/stanza.service';
import { Stanza } from '../../../../models/stanza.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './room-form.html',
  styleUrls: ['./room-form.css']
})
export class RoomForm {
  roomForm: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private stanzaService: StanzaService,
    private readonly messageService: MessageService,
    private readonly cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<RoomForm>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data.isEdit;
    
    this.roomForm = this.fb.group({
      tipologia: [data.room.tipologia || '', Validators.required]
    });
  }

  onSubmit() {
    if (this.roomForm.invalid) {
      return;
    }

    const roomData = {
      ...this.data.room,
      ...this.roomForm.value
    };

    if (this.isEdit) {
      this.stanzaService.updateStanza(this.data.room.id, roomData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Stanza modificata con successo!' });
          this.dialogRef.close(true);
        },
        error: (err) => this.handleError(err, 'modificare')
      });
    } else {
      this.stanzaService.createStanza(roomData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Hai aggiunto una nuova stanza con successo!' });
          this.dialogRef.close(true);
        },
        error: (err) => this.handleError(err, 'aggiungere')
      });
    }
  }

  handleError(err: any, azione: string) {
    console.error(`Errore durante l'operazione di ${azione}`, err);
    if (err.error?.codiceErrore === 'STANZA_DUPLICATA' || err.status === 409) {
      this.messageService.add({ severity: 'warn', summary: 'Attenzione', detail: 'La tipologia di stanza inserita è già presente.' });
    } else if (err.status === 500) {
      this.messageService.add({ severity: 'error', summary: 'Errore Server', detail: 'Si è verificato un errore interno del server.' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Errore', detail: `Non è stato possibile ${azione} la stanza.` });
    }
  }

}
