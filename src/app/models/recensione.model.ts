export interface Recensione {
  id: string;

  dettaglioOrdineId: string;
  utenteId: string;

  valutazioneProdotto: number;
  valutazioneConsegna: number;
  valutazioneMontaggio: number;

  commento: string;

  dataRecensione: string;
}