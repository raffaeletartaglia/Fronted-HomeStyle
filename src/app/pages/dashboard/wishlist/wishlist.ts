import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { WishListService } from '../../../services/wishList.service';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { PopupService } from '../../../services/popUp.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.css']
})
export class Wishlist implements OnInit {
  idUtente: string = '';
  public wishlistService = inject(WishListService);
  private categoriaService = inject(CategoriaService);
  private keycloak = inject(Keycloak);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private popupService = inject(PopupService);

  // Dialogs
  mostraDialogEliminaTutto = false;
  mostraDialogEliminaSingolo = false;
  prodottoDaEliminareId = '';

  // Filtri
  mostraDropdownCategoria = false;
  filterCategoria = 'TUTTE';
  categorie: Categoria[] = [];

  // Ricerca
  ricercaTesto: string = '';
  suggerimenti: any[] = [];
  isSearchDropdownOpen = false;

  constructor() {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      this.wishlistService.wishlistUpdated$.subscribe(() => {
        this.cdr.detectChanges();
      });
      this.caricaWishlist();
      this.caricaFiltri();
    }
  }

  caricaFiltri() {
    this.categoriaService.getAllCategorie(0, 100).subscribe(res => {
      // @ts-ignore
      this.categorie = res.content || res || [];
    });
  }

  get prodottiFiltrati(): any[] {
    return this.wishlistService.prodottiWishlist || [];
  }

  eseguiRicercaBackend() {
    const query = typeof this.ricercaTesto === 'string' ? this.ricercaTesto.trim() : this.ricercaTesto?.['nomeProdotto'] || '';
    this.wishlistService.ricercaProdottiWishlist(this.idUtente, query, this.filterCategoria).subscribe({
      next: (response) => {
        if (response && response.length === 0 && (query || this.filterCategoria !== 'TUTTE')) {
          this.popupService.updateStringa("La ricerca non ha prodotto risultati. Ritorno alla wishlist completa.");
          this.popupService.openPopups(999, true);
          this.ricercaTesto = '';
          this.filterCategoria = 'TUTTE';
          this.wishlistService.prodottiWishlist = [...(this.wishlistService.wishlist?.prodotti || [])];
        } else {
          this.wishlistService.prodottiWishlist = [...(response || [])];
        }
        this.wishlistService.wishlistUpdated$.next();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nella ricerca della wishlist", err);
        this.popupService.updateStringa("Errore durante la ricerca nella wishlist.");
        this.popupService.openPopups(999, true);
      }
    });
  }

  onSearchEnter() {
    this.isSearchDropdownOpen = false;
    this.eseguiRicercaBackend();
  }

  onSearchFocus() {
    if (this.ricercaTesto.length >= 2) {
      this.isSearchDropdownOpen = true;
    }
  }

  cercaSuggerimentiCustom(event: any) {
    const query = event.target.value.trim();
    if (query.length >= 2) {
      this.wishlistService.ricercaSuggerimentiWishlist(this.idUtente, query, this.filterCategoria).subscribe({
        next: (data) => {
          this.suggerimenti = data;
          this.isSearchDropdownOpen = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Errore nel recupero suggerimenti wishlist', err);
        }
      });
    } else {
      this.suggerimenti = [];
      this.isSearchDropdownOpen = false;
      if (query.length === 0) {
        this.eseguiRicercaBackend();
      }
    }
  }

  onProdottoSelezionatoCustom(prod: any) {
    this.ricercaTesto = prod.nomeProdotto;
    this.isSearchDropdownOpen = false;
    this.eseguiRicercaBackend();
  }

  toggleDropdownCategoria(event: Event) {
    event.stopPropagation();
    this.mostraDropdownCategoria = !this.mostraDropdownCategoria;
    this.isSearchDropdownOpen = false;
  }

  selezionaCategoria(catId: string) {
    this.filterCategoria = catId;
    this.mostraDropdownCategoria = false;
    this.eseguiRicercaBackend();
  }

  getNomeCategoria(catId: string): string {
    if (catId === 'TUTTE') return 'Tutte Categorie';
    const cat = this.categorie.find(c => c.id === catId);
    return cat ? this.formattaNome(cat.nomeCategoria) : 'Seleziona Categoria';
  }

  formattaNome(nome: string): string {
    if (!nome) return '';
    return nome.replaceAll('_', ' ');
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.mostraDropdownCategoria = false;
    this.isSearchDropdownOpen = false;
  }

  caricaWishlist() {
    this.wishlistService.getUserWishList(this.idUtente);
  }

  goToDetail(idProdotto: string) {
    this.router.navigate(['/product', idProdotto]);
  }

  confermaRimuoviDaWishlist(idProdotto: string) {
    this.prodottoDaEliminareId = idProdotto;
    this.mostraDialogEliminaSingolo = true;
  }

  eseguiRimuoviDaWishlist() {
    if (this.prodottoDaEliminareId) {
      this.wishlistService.rimuoviDaWishlist(this.idUtente, this.prodottoDaEliminareId);
    }
    this.mostraDialogEliminaSingolo = false;
    this.prodottoDaEliminareId = '';
  }

  confermaSvuotaWishlist() {
    this.mostraDialogEliminaTutto = true;
  }

  eseguiSvuotaWishlist() {
    this.wishlistService.svuotaWishlistUtente(this.idUtente);
    this.mostraDialogEliminaTutto = false;
  }
}
