import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prodotto } from '../models/prodotto.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:8080/api/v1/prodotto';

  constructor(private readonly http: HttpClient) {}

  getAllProdotti(page: number = 0, size: number = 10): Observable<PaginatedResponse<Prodotto>> {
    return this.http.get<PaginatedResponse<Prodotto>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getProdottoById(id: string): Observable<Prodotto> {
    return this.http.get<Prodotto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Filtra i prodotti per stanza, categoria e/o testo di ricerca.
   * Tutti i parametri sono opzionali e combinabili.
   * Mappa: GET /api/v1/prodotto/filtra
   */
  getProdottiFiltrati(
    stanzaId?: string,
    categoriaId?: string,
    query?: string,
    page: number = 0,
    size: number = 12
  ): Observable<PaginatedResponse<Prodotto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (stanzaId)    params = params.set('stanzaId', stanzaId);
    if (categoriaId) params = params.set('categoriaId', categoriaId);
    if (query)       params = params.set('query', query);

    return this.http.get<PaginatedResponse<Prodotto>>(`${this.apiUrl}/filtra`, { params });
  }

  createProdotto(prodotto: any): Observable<Prodotto> {
    return this.http.post<Prodotto>(this.apiUrl, prodotto);
  }

  updateProdotto(id: string, prodotto: any): Observable<Prodotto> {
    return this.http.put<Prodotto>(`${this.apiUrl}/${id}`, prodotto);
  }

  deleteProdotto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  ricercaSuggerimenti(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ricerca-suggerimenti`, { params: { query } });
  }
}
