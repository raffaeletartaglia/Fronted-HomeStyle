export interface Wishlist {
  id: string;

  utenteId: string;
  prodottoId: string;

  dataAggiunta: string;

  priorita: 'BASSA' | 'MEDIA' | 'ALTA';
}