export interface Utente {
    id: string;
    nome: string;
    cognome: string;
    email: string;
    numeroTelefono: string;
    ruolo: 'USER' | 'ADMIN';
    dataCreazione: string;
}
