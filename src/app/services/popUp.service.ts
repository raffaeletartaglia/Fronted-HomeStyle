import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BehaviorSubject } from "rxjs";
import { WarningMessageComponent } from "../warning-message/warning-message.component";
import { MessageService } from "primeng/api";

import { AllPopup } from "../all-popup/all-popup";

@Injectable({
  providedIn: 'root',
})
export class PopupService {

  isAdd: boolean = false;

  aStringa: string = "Motivo del ban"

  isAvviso: boolean = true;

  isLogin: boolean = true;

  isOther: boolean = true;

  descrizione: string = '';

  wichComponent: number = 0;

  operazione!: number;

  private stringaSource = new BehaviorSubject<string>('');

  currentStringa = this.stringaSource.asObservable();

  constructor(private dialog: MatDialog, private messageService: MessageService) {
  }


  updateStringa(value: string) {
    this.stringaSource.next(value);
  }

  toggleLoginR(event: Event) {
    event.preventDefault()
    this.isLogin = !this.isLogin;
  }

  toggleLogin(event: Event) {
    event.preventDefault()
    this.isLogin = !this.isLogin;
  }


  openPopups(num: number, avviso: boolean, customSeverity?: string) {
    switch (num) {
      case 0:
        this.dialog.open(AllPopup);
        this.wichComponent = 0;
        this.isOther = true;
        this.isAdd = false;
        break;
      case 1:
      case 2:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
      case 16:
        this.dialog.open(AllPopup);
        this.wichComponent = num;
        this.isOther = false;
        this.isAdd = true;
        break;

      default:
        this.isAvviso = avviso;
        if (customSeverity) {
          let summary = customSeverity === 'warn' ? 'Avviso' : (customSeverity === 'error' ? 'Errore' : 'Informazione');
          this.messageService.add({ severity: customSeverity, summary: summary, detail: this.stringaSource.getValue() });
        } else if (avviso) {
          this.messageService.add({ severity: 'error', summary: 'Attenzione', detail: this.stringaSource.getValue() });
        } else {
          this.messageService.add({ severity: 'success', summary: 'Successo', detail: this.stringaSource.getValue() });
        }
        break;
    }
  }


  closePopup() {
    this.dialog.closeAll()
  }

}
