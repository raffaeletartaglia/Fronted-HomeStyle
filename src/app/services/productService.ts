import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prodotto } from '../models/prodotto.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/v1/prodotto';

  constructor(private http: HttpClient) {}

  getAllProdotti(page: number = 0, size: number = 10): Observable<PaginatedResponse<Prodotto>> {
    return this.http.get<PaginatedResponse<Prodotto>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getProdottoById(id: string): Observable<Prodotto> {
    return this.http.get<Prodotto>(`${this.apiUrl}/${id}`);
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
}
