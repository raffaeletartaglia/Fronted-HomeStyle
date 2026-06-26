export type TipoIndirizzo = 'RESIDENZA' | 'SPEDIZIONE' | 'FATTURAZIONE';

export interface Indirizzo{
    id: string;
    nazione: string;
    via: string;
    numeroCivico: string;
    provincia: string;
    citta: string;
    cap: string;
    tipo: TipoIndirizzo;
}