import { Categoria } from './categoria.model';

export interface Prodotto {
  id: string;
  marca: string;
  nomeProdotto: string;
  colore: string;
  modello: string;
  prezzo: number;
  descrizione: string;
  includeMontaggio: boolean;
  dataProssimaDisponibilita: string; // LocalDate mappato come stringa ISO
  categoria: Categoria;
  immagine?: string;
  giacenza?: number;
}
