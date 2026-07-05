import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

import { UtenteService } from '../../services/utente.service';
import { IndirizzoService } from '../../services/indirizzo.service';
import { CartaPagamentoService } from '../../services/cartaPagamento.service';
import { OrdineService } from '../../services/ordine.service';
import { WishListService } from '../../services/wishList.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TabsModule, ButtonModule, CardModule, InputTextModule, TableModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  utente: any = null;
  idUtente: string = '';
  ordini: any[] = [];
  
  // Per i form di aggiunta
  nuovoIndirizzo: any = { citta: '', provincia: '', cap: '', via: '', civico: '', tipo: 'FATTURAZIONE' };
  nuovaCarta: any = { titolareCarta: '', numeroCarta: '', scadenza: '', cvv: '' };

  constructor(
    private utenteService: UtenteService,
    public indirizzoService: IndirizzoService,
    public cartaPagamentoService: CartaPagamentoService,
    private ordineService: OrdineService,
    public wishlistService: WishListService,
    private keycloak: Keycloak,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed?.sub) {
      this.idUtente = this.keycloak.tokenParsed.sub;
      
      this.utenteService.getUserData().subscribe(res => this.utente = res);
      this.indirizzoService.getIndirizziUtente(this.idUtente);
      this.cartaPagamentoService.getCarteUtente(this.idUtente);
      this.wishlistService.getUserWishList(this.idUtente);
      
      this.ordineService.getOrdiniPerUtente(this.idUtente).subscribe(res => {
        this.ordini = res.content || [];
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  aggiungiIndirizzo() {
    this.indirizzoService.aggiungiIndirizzo(this.idUtente, this.nuovoIndirizzo);
    this.nuovoIndirizzo = { citta: '', provincia: '', cap: '', via: '', civico: '', tipo: 'FATTURAZIONE' };
  }

  aggiungiCarta() {
    this.cartaPagamentoService.aggiungiCarta(this.nuovaCarta);
    this.nuovaCarta = { titolareCarta: '', numeroCarta: '', scadenza: '', cvv: '' };
  }
}
