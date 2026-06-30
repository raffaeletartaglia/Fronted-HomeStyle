
import { CarrelloProdotto } from './carrelloProdotto.model';

export type StatoCarrello = 'ATTIVO' | 'CONVERTITO' | 'ABBANDONATO';

export interface Carrello {
  id: string;
  utenteId: string;
  dataCreazione: string;
  stato: StatoCarrello;

  prodotti: CarrelloProdotto[];
}
