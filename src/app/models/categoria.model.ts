import { Stanza } from './stanza.model';
import { Prodotto } from './prodotto.model';

export interface Categoria {
    id?: string;
    nomeCategoria: string;
    descrizione?: string;
    stanze?: Stanza[];
    prodotti?: Prodotto[];
}
