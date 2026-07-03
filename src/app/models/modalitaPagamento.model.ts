

export type TipoPagamento = 'FISICO' | 'ONLINE';

export interface ModalitaPagamento {
  id: string;
  tipo: TipoPagamento;
  descrizione: string;
}
