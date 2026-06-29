import { Prodotto } from './prodotto.model';

export interface DettaglioOrdine {
  id: string;
  quantita: number;
  prezzoUnitario: number;

  prodotto: Prodotto;
}
