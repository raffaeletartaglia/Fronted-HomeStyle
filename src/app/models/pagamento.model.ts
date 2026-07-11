// pagamento.model.ts

export interface Pagamento {
  id: string;
  ordineId: string;

  pagamentoOnline: boolean;
  pagamentoEffettuato: boolean;
  numeroRate: number;
  rataCorrente: number;
  importo: number;
  importoRata: number;
  dataPagamento: string;
  fattura: string;
  ultime4CifreCarta?: string;
}
