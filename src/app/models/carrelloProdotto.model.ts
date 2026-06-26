import { Prodotto } from './prodotto.model';

export interface CarrelloProdotto {
  id: string;
  quantita: number;
  dataAggiunta: string;

  prodotto: Prodotto;
}