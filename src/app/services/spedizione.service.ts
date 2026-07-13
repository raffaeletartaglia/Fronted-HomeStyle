import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Spedizione, StatoSpedizione } from '../models/spedizione.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class SpedizioneService {

  private readonly apiUrl = 'http://localhost:8080/api/v1/spedizioni';

  constructor(private readonly http: HttpClient) { }

  getTutteSpedizioni(page: number = 0, size: number = 10): Observable<PaginatedResponse<Spedizione>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<Spedizione>>(this.apiUrl, { params });
  }

  getSpedizionePerId(idSpedizione: string): Observable<Spedizione> {
    return this.http.get<Spedizione>(`${this.apiUrl}/${idSpedizione}`);
  }

  creaSpedizione(idOrdine: string, corriere: string, codiceTracking?: string): Observable<Spedizione> {
    let params = new HttpParams().set('corriere', corriere);
    if (codiceTracking) {
      params = params.set('codiceTracking', codiceTracking);
    }
    return this.http.post<Spedizione>(`${this.apiUrl}/ordine/${idOrdine}`, null, { params });
  }

  aggiornaStatoSpedizione(idSpedizione: string, nuovoStato: StatoSpedizione): Observable<Spedizione> {
    let params = new HttpParams().set('nuovoStato', nuovoStato);
    return this.http.put<Spedizione>(`${this.apiUrl}/${idSpedizione}/stato`, null, { params });
  }

  aggiornaDettagliSpedizione(idSpedizione: string, corriere?: string, codiceTracking?: string): Observable<Spedizione> {
    let params = new HttpParams();
    if (corriere) {
      params = params.set('corriere', corriere);
    }
    if (codiceTracking) {
      params = params.set('codiceTracking', codiceTracking);
    }
    return this.http.put<Spedizione>(`${this.apiUrl}/${idSpedizione}/dettagli`, null, { params });
  }
}
