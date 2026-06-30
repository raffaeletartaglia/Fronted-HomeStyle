import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CategoriaService } from '../../../../services/categoria.service';
import { StanzaService } from '../../../../services/stanza.service';
import { NotificationModal } from '../../../../notification-modal/notification-modal';
import { Stanza } from '../../../../models/stanza.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './category-form.html',
  styleUrls: ['./category-form.css']
})
export class CategoryForm implements OnInit {
  categoryForm: FormGroup;
  isEdit: boolean;
  stanzeOptions: Stanza[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoriaService: CategoriaService,
    private readonly stanzaService: StanzaService,
    private readonly dialog: MatDialog,
    public dialogRef: MatDialogRef<CategoryForm>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data.isEdit;
    
    const preselectedStanze = data.category.stanze ? data.category.stanze.map((s: any) => s.tipologia) : [];
    
    this.categoryForm = this.fb.group({
      nomeCategoria: [data.category.nomeCategoria || '', Validators.required],
      descrizione: [data.category.descrizione || ''],
      stanze: [preselectedStanze]
    });
  }

  ngOnInit(): void {
    // We use a large page size to get all stanze for the options
    this.stanzaService.getAllStanze(0, 1000).subscribe({
      next: (data) => {
        this.stanzeOptions = data.content;
      },
      error: (err) => console.error('Errore caricamento stanze', err)
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }

    const formValues = this.categoryForm.value;
    const stanzePayload = formValues.stanze ? formValues.stanze.map((t: string) => ({ tipologia: t })) : [];

    const categoryData = {
      ...this.data.category,
      ...formValues,
      stanze: stanzePayload
    };

    if (this.isEdit) {
      this.categoriaService.updateCategoria(this.data.category.id, categoryData).subscribe({
        next: () => {
          this.dialog.open(NotificationModal, { data: { title: 'Successo', message: 'Categoria modificata con successo!', level: 'success' } });
          this.dialogRef.close(true);
        },
        error: (err) => this.handleError(err, 'modificare')
      });
    } else {
      this.categoriaService.createCategoria(categoryData).subscribe({
        next: () => {
          this.dialog.open(NotificationModal, { data: { title: 'Successo', message: 'Hai aggiunto una nuova categoria con successo!', level: 'success' } });
          this.dialogRef.close(true);
        },
        error: (err) => this.handleError(err, 'aggiungere')
      });
    }
  }

  handleError(err: any, azione: string) {
    console.error(`Errore durante l'operazione di ${azione}`, err);
    if (err.error?.codiceErrore === 'CATEGORIA_DUPLICATA' || err.status === 409) {
      this.dialog.open(NotificationModal, { data: { title: 'Attenzione', message: 'Una categoria con questo nome esiste già.', level: 'warning' } });
    } else if (err.error?.codiceErrore === 'ERRORE_INTERNO' || err.status >= 500) {
      this.dialog.open(NotificationModal, { data: { title: 'Errore Server', message: 'Si è verificato un errore interno del server.', level: 'error' } });
    } else {
      this.dialog.open(NotificationModal, { data: { title: 'Errore', message: `Non è stato possibile ${azione} la categoria.`, level: 'error' } });
    }
  }

  formatRoomType(type: string): string {
    return type ? type.replaceAll('_', ' ') : '';
  }
}
