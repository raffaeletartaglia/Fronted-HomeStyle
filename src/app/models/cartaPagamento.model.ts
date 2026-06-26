export type tipo = 'VISA' | 'MASTERCARD' | 'MAESTRO';

export interface CartaPagamento {
  id: string;
  utenteId: string;
  intestatario: string;
  tipoCarta: tipo;
  ultime4Cifre: string;
  scadenza: string;
}