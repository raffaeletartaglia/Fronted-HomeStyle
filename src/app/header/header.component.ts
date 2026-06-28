import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {Event, Router} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {MatIconButton} from "@angular/material/button";
import {MatList, MatListItem} from "@angular/material/list";
import {MatBadge} from "@angular/material/badge";
import {count, Subscription} from "rxjs";
import {FormsModule} from "@angular/forms";
import { KeyCloakService } from '../services/keyCloack.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    MatIcon,
    MatMenuTrigger,
    MatMenu,
    MatIconButton,
    NgForOf,
    MatList,
    MatListItem,
    MatBadge,
    DatePipe,
    NgOptimizedImage,
    FormsModule,
    IconFieldModule,
     InputIconModule,
      InputTextModule,
      MenubarModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css', '../../styles.css']
})

export class headerComponent implements OnInit {

   items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Home',
                icon: 'pi pi-home'
            },
            {
                label: 'Features',
                icon: 'pi pi-star'
            },
            {
                label: 'Projects',
                icon: 'pi pi-search',
                items: [
                    {
                        label: 'Components',
                        icon: 'pi pi-bolt'
                    },
                    {
                        label: 'Blocks',
                        icon: 'pi pi-server'
                    },
                    {
                        label: 'UI Kit',
                        icon: 'pi pi-pencil'
                    },
                    {
                        label: 'Templates',
                        icon: 'pi pi-palette',
                        items: [
                            {
                                label: 'Apollo',
                                icon: 'pi pi-palette'
                            },
                            {
                                label: 'Ultima',
                                icon: 'pi pi-palette'
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Contact',
                icon: 'pi pi-envelope'
            }
        ];
    }

}


