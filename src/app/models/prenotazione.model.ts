export interface Prenotazione {
  id: string;

  utenteId: string;
  prodottoId: string;

  quantita: number;

  dataPrenotazione: string;

  stato: 'ATTIVA' | 'ESEGUITA' | 'ANNULLATA';

  dataPrevistaDisponibilita: string;
}
