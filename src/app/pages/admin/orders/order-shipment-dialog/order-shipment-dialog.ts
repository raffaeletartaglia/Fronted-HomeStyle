import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-order-shipment-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './order-shipment-dialog.html',
  styles: ['.w-100 { width: 100%; } .mt-2 { margin-top: 1rem; }']
})
export class OrderShipmentDialog {
  constructor(
    public dialogRef: MatDialogRef<OrderShipmentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { corriere: string, codiceTracking: string }
  ) {}
}
