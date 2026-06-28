import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { NgClass, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface NotificationData {
  title: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-notification-modal',
  imports: [NgClass, NgIf, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './notification-modal.html',
  styleUrl: './notification-modal.css',
})
export class NotificationModal {
  constructor(
    public dialogRef: MatDialogRef<NotificationModal>,
    @Inject(MAT_DIALOG_DATA) public data: NotificationData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getIcon(): string {
    switch (this.data.level) {
      case 'info': return 'info';
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }
}
