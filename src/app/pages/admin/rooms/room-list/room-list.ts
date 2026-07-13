import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StanzaService } from '../../../../services/stanza.service';
import { Stanza } from '../../../../models/stanza.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RoomForm } from '../room-form/room-form';
import { NotificationModal } from '../../../../notification-modal/notification-modal';
import { ConfirmModal } from '../../../../confirm-modal/confirm-modal';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatProgressSpinnerModule, MatPaginatorModule],
  templateUrl: './room-list.html',
  styleUrls: ['./room-list.css']
})
export class RoomList implements OnInit {
  rooms: Stanza[] = [];
  displayedColumns: string[] = ['tipologia', 'azioni'];
  isLoading = signal(true);

  // Pagination variables
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(private stanzaService: StanzaService, private dialog: MatDialog, private readonly cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms() {
    this.isLoading.set(true);
    this.stanzaService.getAllStanze(this.pageIndex, this.pageSize).subscribe({
      next: (data) => {
        this.rooms = data.content;
        this.totalElements = data.totalElements;
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel caricamento stanze', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRooms();
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(RoomForm, {
      width: '400px',
      data: { isEdit: false, room: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRooms();
      }
    });
  }

  openEditDialog(room: Stanza) {
    const dialogRef = this.dialog.open(RoomForm, {
      width: '400px',
      data: { isEdit: true, room: { ...room } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRooms();
      }
    });
  }

  deleteRoom(id: string) {
    const dialogRef = this.dialog.open(ConfirmModal, {
      width: '400px',
      data: { title: 'Conferma Eliminazione', message: 'Sei sicuro di voler eliminare questa stanza?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.stanzaService.deleteStanza(id).subscribe({
          next: () => {
            this.dialog.open(NotificationModal, { data: { title: 'Successo', message: 'Stanza eliminata con successo!', level: 'success' } });
            this.loadRooms();
          },
          error: (err) => {
            console.error('Errore durante eliminazione stanza', err);
            this.dialog.open(NotificationModal, { data: { title: 'Errore', message: 'Non è stato possibile eliminare la stanza.', level: 'error' } });
          }
        });
      }
    });
  }

  formatRoomType(type: string): string {
    return type ? type.replace(/_/g, ' ') : '';
  }
}
