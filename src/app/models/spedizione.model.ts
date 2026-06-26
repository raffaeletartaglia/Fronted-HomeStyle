export type StatoSpedizione =
  'PREPARAZIONE' |
  'SPEDITO' |
  'IN_TRANSITO' |
  'CONSEGNATO' |
  'ANNULLATO';

export interface Spedizione {
  id: string;
  ordineId: string;

  corriere: string;
  codiceTracking: string;

  dataSpedizione: string;
  dataConsegnaEffettiva: string;

  statoSpedizione: StatoSpedizione;
}