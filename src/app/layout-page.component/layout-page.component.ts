import { Component } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { App } from "../app";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-layout-page.component',
  imports: [FooterComponent, App, RouterOutlet],
  templateUrl: './layout-page.component.html',
  styleUrl: './layout-page.component.css',
})
export class LayoutPageComponent {}
