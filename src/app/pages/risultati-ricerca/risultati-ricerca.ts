import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/productService';
import { Prodotto } from '../../models/prodotto.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-risultati-ricerca',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './risultati-ricerca.html',
  styleUrls: ['./risultati-ricerca.css']
})
export class RisultatiRicerca implements OnInit {
  prodotti: Prodotto[] = [];
  
  // Paginazione
  totalElements: number = 0;
  pageSize: number = 12;
  pageIndex: number = 0;
  
  // Filtri attivi
  currentStanzaId?: string;
  currentCategoriaId?: string;
  currentQuery?: string;
  
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Sottoscriviti ai query params per aggiornare i risultati ogni volta che l'URL cambia
    this.route.queryParams.subscribe(params => {
      this.currentStanzaId = params['stanzaId'];
      this.currentCategoriaId = params['categoriaId'];
      this.currentQuery = params['query'];
      
      // Quando cambia un parametro di ricerca, torniamo alla pagina 0
      this.pageIndex = 0;
      this.fetchProdotti();
    });
  }

  fetchProdotti() {
    this.isLoading = true;
    this.productService.getProdottiFiltrati(
      this.currentStanzaId,
      this.currentCategoriaId,
      this.currentQuery,
      this.pageIndex,
      this.pageSize
    ).subscribe({
      next: (response) => {
        // @ts-ignore
        const prods = response.content || [];
        
        // Se non troviamo prodotti e stiamo usando dei filtri (non è una ricerca vuota globale)
        if (prods.length === 0 && (this.currentQuery || this.currentStanzaId || this.currentCategoriaId)) {
          
          this.messageService.add({
            severity: 'warn', 
            summary: 'Nessun risultato', 
            detail: 'Nessun prodotto correlato trovato. Ti mostriamo l\'intero catalogo.'
          });
          
          // Resettiamo i filtri e rifacciamo la chiamata globale
          this.currentQuery = undefined;
          this.currentStanzaId = undefined;
          this.currentCategoriaId = undefined;
          this.pageIndex = 0;
          this.fetchProdotti();
          return;
        }

        this.prodotti = prods;
        // @ts-ignore
        this.totalElements = response.totalElements || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Errore durante il recupero dei prodotti:", err);
        this.prodotti = [];
        this.totalElements = 0;
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchProdotti();
    // Scrolla in alto quando si cambia pagina
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToDetail(prodottoId: string) {
    if(prodottoId) {
      this.router.navigate(['/product', prodottoId]);
    }
  }
}
