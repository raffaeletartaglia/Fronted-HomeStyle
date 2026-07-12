import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { WishListService } from '../../../services/wishList.service';
import { CategoriaService } from '../../../services/categoria.service';
import { StanzaService } from '../../../services/stanza.service';
import { Categoria } from '../../../models/categoria.model';
import { Stanza } from '../../../models/stanza.model';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

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
  private stanzaService = inject(StanzaService);
  private keycloak = inject(Keycloak);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Dialogs
  mostraDialogEliminaTutto = false;
  mostraDialogEliminaSingolo = false;
  prodottoDaEliminareId = '';

  // Filtri
  mostraDropdownCategoria = false;
  mostraDropdownStanza = false;
  filterCategoria = 'TUTTE';
  filterStanza = 'TUTTE';
  categorie: Categoria[] = [];
  stanze: Stanza[] = [];

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
    this.stanzaService.getAllStanze(0, 100).subscribe(res => {
      // @ts-ignore
      this.stanze = res.content || res || [];
    });
  }

  get prodottiFiltrati(): any[] {
    let prodotti = this.wishlistService.prodottiWishlist || [];
    
    if (this.filterCategoria !== 'TUTTE') {
      prodotti = prodotti.filter(p => p.categoria?.id === this.filterCategoria);
    }
    
    if (this.filterStanza !== 'TUTTE') {
      prodotti = prodotti.filter(p => 
        p.stanze?.some((s: any) => s.id === this.filterStanza)
      );
    }
    
    return prodotti;
  }

  toggleDropdownCategoria(event: Event) {
    event.stopPropagation();
    this.mostraDropdownCategoria = !this.mostraDropdownCategoria;
    this.mostraDropdownStanza = false;
  }

  selezionaCategoria(catId: string) {
    this.filterCategoria = catId;
    this.mostraDropdownCategoria = false;
  }

  getNomeCategoria(catId: string): string {
    if (catId === 'TUTTE') return 'Tutte Categorie';
    const cat = this.categorie.find(c => c.id === catId);
    return cat ? cat.nomeCategoria : 'Seleziona Categoria';
  }

  toggleDropdownStanza(event: Event) {
    event.stopPropagation();
    this.mostraDropdownStanza = !this.mostraDropdownStanza;
    this.mostraDropdownCategoria = false;
  }

  selezionaStanza(stanzaId: string) {
    this.filterStanza = stanzaId;
    this.mostraDropdownStanza = false;
  }

  getNomeStanza(stanzaId: string): string {
    if (stanzaId === 'TUTTE') return 'Tutte Stanze';
    const st = this.stanze.find(s => s.id === stanzaId);
    return st ? st.tipologia : 'Seleziona Stanza';
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.mostraDropdownCategoria = false;
    this.mostraDropdownStanza = false;
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
