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

  private mockResi: Reso[] = [
    {
      id: 'r1-1234-5678',
      dettaglioOrdineId: 'do1-abcd',
      dataResoPrevista: '2026-07-01',
      oraRitiroReso: '10:00:00',
      motivo: 'Prodotto difettoso',
      indirizzoId: 'ind1-1234',
      statoReso: 'RICHIESTO'
    },
    {
      id: 'r2-5678-9012',
      dettaglioOrdineId: 'do2-efgh',
      dataResoPrevista: '2026-07-02',
      oraRitiroReso: '14:30:00',
      motivo: 'Taglia errata',
      indirizzoId: 'ind2-5678',
      statoReso: 'PROGRAMMATO'
    },
    {
      id: 'r3-9012-3456',
      dettaglioOrdineId: 'do3-ijkl',
      dataResoPrevista: '2026-06-25',
      oraRitiroReso: '09:00:00',
      motivo: 'Non mi piace più',
      indirizzoId: 'ind3-9012',
      statoReso: 'RITIRATO'
    }
  ];

  constructor(private readonly http: HttpClient) { }

  getTuttiIResi(page: number = 0, size: number = 10): Observable<PaginatedResponse<Reso>> {
    // Dati cablati come richiesto
    const start = page * size;
    const end = start + size;
    const pagedContent = this.mockResi.slice(start, end);

    const mockResponse: PaginatedResponse<Reso> = {
      content: pagedContent,
      totalElements: this.mockResi.length,
      totalPages: Math.ceil(this.mockResi.length / size),
      size: size,
      number: page
    };
    return of(mockResponse);
  }

  getResoPerId(idReso: string): Observable<Reso> {
    const reso = this.mockResi.find(r => r.id === idReso);
    return reso ? of(reso) : this.http.get<Reso>(`${this.apiUrl}/${idReso}`);
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
    const reso = this.mockResi.find(r => r.id === idReso);
    if (reso) {
      reso.statoReso = nuovoStato;
      return of(reso);
    }
    let params = new HttpParams().set('nuovoStato', nuovoStato);
    return this.http.put<Reso>(`${this.apiUrl}/${idReso}/stato`, null, { params });
  }
}

