import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu'; // <--- IMPORTANTE: Aggiungi il MenuModule
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';


@Component({
  selector: 'my-header',
  standalone: true,
  imports: [
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MenubarModule,
    MenuModule // <--- Aggiungilo qui
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css', '../../styles.css']
})
export class headerComponent implements OnInit {

  items: MenuItem[] | undefined;
  userMenuItems: MenuItem[] | undefined;

  // Variabile di stato. La cambierai a "true" quando Keycloak conferma il login
  isLogged: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Menù di navigazione principale (Home, Prodotti, ecc.)
    this.items = [
      // ... (qui rimetterai le tue voci Home, Prodotti, Ambienti)
    ];

    // Costruisci il menù utente in base allo stato
    this.updateUserMenu();
  }

  updateUserMenu() {
    if (this.isLogged) {
      // VOCI SE L'UTENTE È LOGGATO
      this.userMenuItems = [
        { label: 'Il mio profilo', icon: 'pi pi-user' },
        { label: 'Ordini', icon: 'pi pi-box' },
        { label: 'Effettua un reso', icon: 'pi pi-refresh' },
        { label: 'Aiuti e contatti', icon: 'pi pi-envelope' },
        { separator: true }, // Linea di separazione
        { label: 'Disconnettiti', icon: 'pi pi-sign-out' }
      ];
    } else {
      // VOCI SE L'UTENTE NON È LOGGATO
      this.userMenuItems = [
        {
          label: `<div style="display: block; width: 100%; text-align: center; padding: 0.2rem 0; cursor: pointer;"><strong style="font-size: 1rem; color: #333; text-decoration: underline; text-decoration-color: #d32f2f; text-decoration-thickness: 2px;">ACCEDI</strong></div>`,
          escape: false,
          styleClass: 'center-menu-item',
          command: () => { console.log('Vai alla pagina login'); }
        },
        {
          label: `<div style="padding: 0.2rem 0; cursor: pointer; text-align: center;"><span style="font-size: 0.85rem; color: #666;">se non sei registrato : </span><strong style="font-size: 1rem; color: #d32f2f; text-decoration: underline; text-decoration-color: #d32f2f; text-decoration-thickness: 2px;">REGISTRATI</strong></div>`,
          escape: false,
          command: () => { console.log('Vai alla pagina registrazione'); }
        },
        { separator: true },
        { label: 'Il mio profilo', icon: 'pi pi-user' },
        { label: 'Ordini', icon: 'pi pi-box' },
        { label: 'Effettua un reso', icon: 'pi pi-refresh' },
        { label: 'Aiuto e contatti', icon: 'pi pi-envelope' }
      ];
    }
  }

  goHomepage() {
    this.router.navigate(['']);
  }
}


