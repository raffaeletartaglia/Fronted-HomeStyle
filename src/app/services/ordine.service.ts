import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ordine } from '../models/ordine.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class OrdineService {

  private readonly apiUrl = 'http://localhost:8080/api/v1/ordini';

  constructor(private readonly http: HttpClient) { }

  /**
   * Recupera tutti gli ordini presenti nel sistema.
   * Accessibile solo dagli ADMIN.
   */
  getAllOrdini(page: number = 0, size: number = 10): Observable<PaginatedResponse<Ordine>> {
    return this.http.get<PaginatedResponse<Ordine>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  /**
   * Modifica lo stato di un ordine.
   * Accessibile dagli ADMIN.
   */
  updateStatoOrdine(idOrdine: string, nuovoStato: string): Observable<Ordine> {
    return this.http.put<Ordine>(`${this.apiUrl}/${idOrdine}/stato?nuovoStato=${nuovoStato}`, {});
  }

  /**
   * Crea un nuovo ordine per un utente, partendo dal suo carrello attivo.
   */
  creaOrdine(idUtente: string, idIndirizzoSpedizione: string): Observable<Ordine> {
    return this.http.post<Ordine>(`${this.apiUrl}/utente/${idUtente}?idIndirizzoSpedizione=${idIndirizzoSpedizione}`, {});
  }

  /**
   * Recupera lo storico ordini di un utente specifico.
   */
  getOrdiniPerUtente(idUtente: string, page: number = 0, size: number = 5): Observable<PaginatedResponse<Ordine>> {
    return this.http.get<PaginatedResponse<Ordine>>(`${this.apiUrl}/utente/${idUtente}?page=${page}&size=${size}`);
  }

  /**
   * Crea un nuovo ordine per un singolo prodotto.
   */
  creaOrdineSingolo(idUtente: string, idIndirizzoSpedizione: string, idProdotto: string, quantita: number): Observable<Ordine> {
    return this.http.post<Ordine>(`${this.apiUrl}/utente/${idUtente}/singolo?idIndirizzoSpedizione=${idIndirizzoSpedizione}&idProdotto=${idProdotto}&quantita=${quantita}`, {});
  }
}
