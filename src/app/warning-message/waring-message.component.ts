import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {NgIf} from "@angular/common";
import { PopupService } from '../services/popUp.service';






@Component({
  selector: 'app-warning-message',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './warning-message.component.html',
  styleUrls: ['./warning-message.component.css', '../../styles.css']
})

export class WarningMessageComponent implements OnInit{

}