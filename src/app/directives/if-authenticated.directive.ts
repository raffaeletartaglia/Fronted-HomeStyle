import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

@Directive({
  selector: '[ifAuthenticated]',
  standalone: true
})
export class IfAuthenticatedDirective implements OnInit {
  // Iniettiamo Keycloak per sapere se l'utente è loggato
  private keycloak = inject(Keycloak);
  
  // TemplateRef rappresenta il contenuto HTML su cui applichiamo la direttiva (es. il <div> o <button>)
  private templateRef = inject(TemplateRef<any>);
  
  // ViewContainerRef è il contenitore nel DOM dove decideremo se inserire o meno il template
  private viewContainer = inject(ViewContainerRef);

  // Questo input permette di decidere se vogliamo mostrare l'elemento 
  // agli utenti loggati (true) o ai non loggati (false)
  @Input() set ifAuthenticated(condition: boolean) {
    this.updateView(condition);
  }

  ngOnInit() {
    // L'inizializzazione viene gestita automaticamente dal setter dell'Input
  }

  private updateView(condition: any) {
    const isLoggedIn = this.keycloak.authenticated ?? false;
    
    // Assicuriamoci che la condizione sia valutata sempre come booleano
    // (nel caso in cui da HTML arrivi la stringa "true" o "false")
    const isConditionTrue = (condition === true || condition === 'true');
    
    console.log(`[IfAuthenticatedDirective] Utente loggato: ${isLoggedIn}, Condizione richiesta: ${isConditionTrue}`);

    // Puliamo il contenitore per sicurezza
    this.viewContainer.clear();

    // Se lo stato dell'utente corrisponde a quello richiesto
    if (isLoggedIn === isConditionTrue) {
      // Inseriamo l'elemento HTML nel DOM
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
