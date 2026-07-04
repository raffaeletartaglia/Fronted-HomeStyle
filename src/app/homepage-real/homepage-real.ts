import { Component, OnInit } from '@angular/core';
import {HeroCarouselComponent} from '../hero-carousel/hero-carousel';
import {DomSanitizer} from "@angular/platform-browser";


@Component({
  selector: 'app-homepage-real',
  standalone: true,
  imports: [
    HeroCarouselComponent],
  templateUrl: './homepage-real.html',
  styleUrl: './homepage-real.css',
})
export class HomepageReal implements OnInit {

  ngOnInit(): void {}

}
