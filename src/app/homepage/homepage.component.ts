import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser"

@Component({
  standalone: true,
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})

export class HomepageComponent {
  indexNovita: number = 0;
  indexOfferte: number = 0;

}