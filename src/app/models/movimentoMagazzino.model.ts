export interface MovimentoMagazzino {
  id: string;
  prodottoId: string;

  tipoMovimento:
    | 'PRODUZIONE'
    | 'SCARICO_VENDITA'
    | 'RESO_CLIENTE'
    | 'ANNULLAMENTO_ORDINE'
    | 'RETTIFICA_INVENTARIO';

  quantita: number;

  dataMovimento: string;

  ordineId?: string;
  resoId?: string;

  note?: string;
}
