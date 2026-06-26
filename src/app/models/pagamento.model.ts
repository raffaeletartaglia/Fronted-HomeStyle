export type ModalitaPagamento = {
  id: string;
  tipo: string;
};

export interface Pagamento {
  id: string;
  ordineId: string;

  modalitaPagamento: ModalitaPagamento;

  pagamentoEffettuato: boolean;

  numeroRate: number;
  rataCorrente: number;

  importo: number;
  importoRata: number;

  dataPagamento: string;

  fattura: string;

  ultime4CifreCarta?: string;
}