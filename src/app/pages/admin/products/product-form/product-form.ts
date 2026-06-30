import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../../services/productService';
import { CategoriaService } from '../../../../services/categoria.service';
import { ValidationService } from '../../../../services/validation.service';
import { Categoria } from '../../../../models/categoria.model';
import { NotificationModal } from '../../../../notification-modal/notification-modal';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, 
    MatInputModule, MatButtonModule, MatSelectModule, MatCheckboxModule, 
    MatIconModule
  ],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css']
})
export class ProductForm implements OnInit {
  productForm: FormGroup;
  isEdit: boolean;
  categories: Categoria[] = [];
  selectedImageName: string = '';
  base64Image: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly productService: ProductService,
    private readonly categoriaService: CategoriaService,
    private readonly validationService: ValidationService,
    private readonly dialog: MatDialog,
    public dialogRef: MatDialogRef<ProductForm>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data.isEdit;
    const p = data.product || {};

    this.productForm = this.fb.group({
      marca: [p.marca || '', Validators.required],
      nomeProdotto: [p.nomeProdotto || '', Validators.required],
      categoriaId: [p.categoria?.id || '', Validators.required],
      colore: [p.colore || ''],
      modello: [p.modello || ''],
      prezzo: [p.prezzo || 0, [Validators.required, Validators.min(0)]],
      descrizione: [p.descrizione || ''],
      includeMontaggio: [p.includeMontaggio || false],
      sogliaRiordino: [p.sogliaRiordino || 0, Validators.min(0)],
      quantitaRiordinoStandard: [p.quantitaRiordinoStandard || 0, Validators.min(0)],
      giacenza: [p.giacenza || 0, Validators.min(0)],
      dataProssimaDisponibilita: [p.dataProssimaDisponibilita || null]
    });

    if (p.immagine) {
      this.base64Image = p.immagine;
      this.selectedImageName = 'Immagine presente';
    }
  }

  ngOnInit(): void {
    // We use a large page size to get all categories for the select options
    this.categoriaService.getAllCategorie(0, 1000).subscribe({
      next: (data) => this.categories = data.content,
      error: (err) => console.error('Errore caricamento categorie', err)
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImageName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Estrarre solo la parte base64 (es. data:image/png;base64,iVBORw0...)
        this.base64Image = dataUrl.split(',')[1];
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.productForm.invalid) {
      return;
    }

    const payload = {
      ...this.productForm.value,
      immagine: this.base64Image
    };

    const validationError = this.validationService.validateProduct(payload);
    if (validationError) {
      this.dialog.open(NotificationModal, { data: { title: 'Attenzione', message: validationError, level: 'warning' } });
      return;
    }

    if (this.isEdit) {
      this.productService.updateProdotto(this.data.product.id, payload).subscribe({
        next: () => {
          this.dialog.open(NotificationModal, { data: { title: 'Successo', message: 'Prodotto aggiornato con successo!', level: 'success' } });
          this.dialogRef.close(true);
        },
        error: (err) => this.handleError(err, 'aggiornare')
      });
    } else {
      this.productService.createProdotto(payload).subscribe({
        next: () => {
          this.dialog.open(NotificationModal, { data: { title: 'Successo', message: 'Prodotto creato con successo!', level: 'success' } });
          this.dialogRef.close(true);
        },
        error: (err) => this.handleError(err, 'creare')
      });
    }
  }

  handleError(err: any, azione: string) {
    console.error(`Errore durante ${azione} prodotto`, err);
    
    // Fallback: se il backend risponde con un 400 e fornisce un messaggio specifico (es. ValoreNonValidoException)
    if (err.status === 400 && err.error?.messaggio) {
      this.dialog.open(NotificationModal, { data: { title: 'Errore di Validazione', message: err.error.messaggio, level: 'warning' } });
    } else {
      this.dialog.open(NotificationModal, { data: { title: 'Errore', message: `Non è stato possibile ${azione} il prodotto. Riprova.`, level: 'error' } });
    }
  }
}
