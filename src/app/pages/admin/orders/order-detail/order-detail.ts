import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Ordine } from '../../../../models/ordine.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.css']
})
export class OrderDetailModal {
  constructor(
    public dialogRef: MatDialogRef<OrderDetailModal>,
    @Inject(MAT_DIALOG_DATA) public data: { order: Ordine }
  ) {}
}
