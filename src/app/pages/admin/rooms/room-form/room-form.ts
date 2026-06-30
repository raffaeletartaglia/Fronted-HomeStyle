import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { StanzaService } from '../../../../services/stanza.service';
import { AreaCasa } from '../../../../models/stanza.model';
import { NotificationModal } from '../../../../notification-modal/notification-modal';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './room-form.html',
  styleUrls: ['./room-form.css']
})
export class RoomForm {
  roomForm: FormGroup;
  isEdit: boolean;
  areaCasaOptions = Object.values(AreaCasa);

  constructor(
    private fb: FormBuilder,
    private stanzaService: StanzaService,
    private dialog: MatDialog,
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
          this.dialog.open(NotificationModal, { data: { title: 'Successo', message: 'Stanza modificata con successo!', level: 'success' } });
          this.dialogRef.close(true);
        },
        error: (err) => this.handleError(err, 'modificare')
      });
    } else {
      this.stanzaService.createStanza(roomData).subscribe({
        next: () => {
          this.dialog.open(NotificationModal, { data: { title: 'Successo', message: 'Hai aggiunto una nuova stanza con successo!', level: 'success' } });
          this.dialogRef.close(true);
        },
        error: (err) => this.handleError(err, 'aggiungere')
      });
    }
  }

  handleError(err: any, azione: string) {
    console.error(`Errore durante l'operazione di ${azione}`, err);
    if (err.error?.codiceErrore === 'STANZA_DUPLICATA' || err.status === 409) {
      this.dialog.open(NotificationModal, { data: { title: 'Attenzione', message: 'La tipologia di stanza inserita è già presente.', level: 'warning' } });
    } else if (err.error?.codiceErrore === 'ERRORE_INTERNO' || err.status >= 500) {
      this.dialog.open(NotificationModal, { data: { title: 'Errore Server', message: 'Si è verificato un errore interno del server.', level: 'error' } });
    } else {
      this.dialog.open(NotificationModal, { data: { title: 'Errore', message: `Non è stato possibile ${azione} la stanza.`, level: 'error' } });
    }
  }

  formatRoomType(type: string): string {
    return type ? type.replaceAll('_', ' ') : '';
  }
}
