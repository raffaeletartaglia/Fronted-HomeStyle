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

  /**
   * Valida il tipo di carta in base al numero.
   * Ritorna 'VISA', 'MASTERCARD', 'MAESTRO' se valido.
   * Se la stringa è vuota o il formato non corrisponde a queste, lancia un errore o ritorna null.
   */
  validateCardType(numeroCarta: string): 'VISA' | 'MASTERCARD' | 'MAESTRO' | null {
    if (!numeroCarta) return null;
    
    // Rimuoviamo gli spazi vuoti
    const numero = numeroCarta.replace(/\s+/g, '');

    // VISA: Inizia con 4, lunghezza 13 o 16
    const visaRegex = /^4\d{12}(?:\d{3})?$/;
    
    // MASTERCARD: Inizia con 51-55 o 2221-2720, lunghezza 16
    const mastercardRegex = /^(?:5[1-5]\d{2}|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12}$/;
    
    // MAESTRO: Inizia con prefissi specifici (5018, 5020, 5038, 5893, 6304, 6759, 6761, 6762, 6763), lunghezza 12-19
    const maestroRegex = /^(5018|5020|5038|5893|6304|6759|676[1-3])\d{8,15}$/;

    if (visaRegex.test(numero)) {
      return 'VISA';
    } else if (mastercardRegex.test(numero)) {
      return 'MASTERCARD';
    } else if (maestroRegex.test(numero)) {
      return 'MAESTRO';
    }
    
    return null;
  }
}
