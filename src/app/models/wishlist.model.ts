export interface Wishlist {
  id: string;

  utenteId: string;
  prodotto: any;

  dataAggiunta: string;

  priorita: 'BASSA' | 'MEDIA' | 'ALTA';
}
