import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stanza } from '../models/stanza.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class StanzaService {
  private apiUrl = 'http://localhost:8080/api/v1/stanza';

  constructor(private http: HttpClient) {}

  getAllStanze(page: number = 0, size: number = 10): Observable<PaginatedResponse<Stanza>> {
    return this.http.get<PaginatedResponse<Stanza>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getStanzaById(id: string): Observable<Stanza> {
    return this.http.get<Stanza>(`${this.apiUrl}/${id}`);
  }

  createStanza(stanza: Stanza): Observable<Stanza> {
    return this.http.post<Stanza>(this.apiUrl, stanza);
  }

  updateStanza(id: string, stanza: Stanza): Observable<Stanza> {
    return this.http.put<Stanza>(`${this.apiUrl}/${id}`, stanza);
  }

  deleteStanza(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
