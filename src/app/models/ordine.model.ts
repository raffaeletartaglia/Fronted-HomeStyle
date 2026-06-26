import { DettaglioOrdine } from './dettaglioOrdine.model';
import { Indirizzo } from './indirizzo.model';

export type StatoOrdine =
  'IN_ELABORAZIONE' |
  'SPEDITO' |
  'CONSEGNATO' |
  'ANNULLATO';

export interface Ordine {
  id: string;
  statoOrdine: StatoOrdine;
  dataOrdine: string;
  dataPrevistaConsegna: string;

  indirizzoSpedizione: Indirizzo;

  prodotti: DettaglioOrdine[];
}