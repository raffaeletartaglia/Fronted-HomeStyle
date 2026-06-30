export interface InventoryMovement {
  id: string;
  prodottoId: string;
  tipoMovimento: string; // PRODUZIONE, SCARICO_VENDITA, RESO_CLIENTE, ecc.
  quantita: number;
  dataMovimento: string;
  ordineId?: string;
  resoId?: string;
  note?: string;
}
