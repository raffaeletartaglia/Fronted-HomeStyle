import { Component } from '@angular/core';
import { FooterComponent } from "./components/footer/footer.component";
import { headerComponent } from "../header/header.component";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-layout-page.component',
  imports: [headerComponent, FooterComponent, RouterOutlet],
  standalone: true,
  templateUrl: './layout-page.component.html',
  styleUrl: './layout-page.component.css',
})
export class LayoutPageComponent { }
