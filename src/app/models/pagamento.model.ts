// pagamento.model.ts
import { ModalitaPagamento } from './modalitaPagamento.model';

export interface Pagamento {
  id: string;
  ordineId: string;

  modalitaPagamento: ModalitaPagamento; // Ora userà quello importato!

  pagamentoEffettuato: boolean;
  numeroRate: number;
  rataCorrente: number;
  importo: number;
  importoRata: number;
  dataPagamento: string;
  fattura: string;
  ultime4CifreCarta?: string;
}
