import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/pagination.model';
import { InventoryMovement } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly apiUrl = 'http://localhost:8080/api/v1/movimento-magazzino';

  constructor(private readonly http: HttpClient) {}

  getAllMovements(page: number = 0, size: number = 10): Observable<PaginatedResponse<InventoryMovement>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<InventoryMovement>>(this.apiUrl, { params });
  }

  addManualRestock(prodottoId: string, quantita: number, note?: string): Observable<InventoryMovement> {
    let params = new HttpParams()
      .set('prodottoId', prodottoId)
      .set('quantita', quantita.toString());
    
    if (note) {
      params = params.set('note', note);
    }

    return this.http.post<InventoryMovement>(`${this.apiUrl}/rifornimento`, null, { params });
  }
}
