import { DettaglioOrdine } from './dettaglioOrdine.model';
import { Indirizzo } from './indirizzo.model';
import { Utente } from './utente.model';

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
  prezzoTotale: number;

  utente: Utente;
  indirizzoSpedizione: Indirizzo;

  prodotti: DettaglioOrdine[];
}
