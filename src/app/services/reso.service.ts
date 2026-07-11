import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Reso } from '../models/reso.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class ResoService {

  private readonly apiUrl = 'http://localhost:8080/api/v1/resi';

  constructor(private readonly http: HttpClient) { }

  getTuttiIResi(page: number = 0, size: number = 10): Observable<PaginatedResponse<Reso>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<Reso>>(this.apiUrl, { params });
  }

  getResoPerId(idReso: string): Observable<Reso> {
    return this.http.get<Reso>(`${this.apiUrl}/${idReso}`);
  }

  creaReso(idDettaglioOrdine: string, idIndirizzoReso: string, dataResoPrevista: string, oraRitiroReso: string, motivo: string): Observable<Reso> {
    const params = new HttpParams()
      .set('idIndirizzoReso', idIndirizzoReso)
      .set('dataResoPrevista', dataResoPrevista)
      .set('oraRitiroReso', oraRitiroReso)
      .set('motivo', motivo);
    return this.http.post<Reso>(`${this.apiUrl}/dettaglio-ordine/${idDettaglioOrdine}`, null, { params });
  }

  modificaStatoReso(idReso: string, nuovoStato: string): Observable<Reso> {
    let params = new HttpParams().set('nuovoStato', nuovoStato);
    return this.http.put<Reso>(`${this.apiUrl}/${idReso}/stato`, null, { params });
  }
}

