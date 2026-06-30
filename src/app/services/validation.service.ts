import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /**
   * Valida un oggetto prodotto prima di inviarlo al backend.
   * Ritorna una stringa con il messaggio di errore se c'è un problema, oppure null se è tutto ok.
   */
  validateProduct(product: any): string | null {
    if (!product) return "Dati prodotto mancanti.";

    // Validazione Prezzo
    if (product.prezzo !== null && product.prezzo !== undefined && product.prezzo < 0) {
      return "Il prezzo del prodotto non può essere negativo.";
    }

    // Validazione Giacenza
    if (product.giacenza !== null && product.giacenza !== undefined && product.giacenza < 0) {
      return "La giacenza in magazzino non può essere negativa.";
    }

    // Validazione Soglia Riordino
    if (product.sogliaRiordino !== null && product.sogliaRiordino !== undefined && product.sogliaRiordino < 0) {
      return "La soglia di riordino non può essere negativa.";
    }

    // Validazione Quantità Riordino Standard
    if (product.quantitaRiordinoStandard !== null && product.quantitaRiordinoStandard !== undefined && product.quantitaRiordinoStandard < 0) {
      return "La quantità di riordino standard non può essere negativa.";
    }

    // Validazione Data Prossima Disponibilità
    if (product.dataProssimaDisponibilita) {
      const selectedDate = new Date(product.dataProssimaDisponibilita);
      // Imposta l'orario a mezzanotte per fare un confronto corretto con 'oggi'
      selectedDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return "La data di prossima disponibilità non può essere nel passato.";
      }
    }

    // Altre logiche custom possono essere aggiunte qui

    return null; // Nessun errore
  }

}
