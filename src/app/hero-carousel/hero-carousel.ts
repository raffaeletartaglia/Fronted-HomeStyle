import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [NgFor],
  templateUrl: './hero-carousel.html',
  styleUrls: ['./hero-carousel.css']
})
export class HeroCarouselComponent implements OnInit, OnDestroy {

  // 1. I DATI: Creiamo un array di "oggetti".
  // Ogni oggetto rappresenta una diapositiva con la sua immagine, un titolo e uno slogan.
  slides = [
    {
      image: 'images/camera1.jpg',
      title: 'Stile da vivere',
      slogan: 'Eleganza, comfort e stile in ogni dettaglio.'
    },
    {
      image: 'images/camera2.jpg',
      title: 'Oltre l\'estetica',
      slogan: 'Dove il design incontra l\'emozione.'
    },
    {
      image: 'images/camera3.jpg',
      title: 'L\'armonia degli spazi',
      slogan: 'L\'arte di abitare prende forma.'
    },
    {
      image: 'images/camera4.jpg',
      title: 'Il design da vivere',
      slogan: 'Trasformiamo gli spazi in esperienze da vivere.'
    }
  ];

  // 2. LO STATO: Questa variabile tiene traccia della foto attuale (parte da 0, la prima foto)
  currentIndex = 0;

  // Questa variabile ci serve per "ricordarci" del timer e poterlo spegnere
  private autoPlayInterval: any;

  constructor() { }

  // 3. IL PILOTA AUTOMATICO
  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    // FONDAMENTALE: Spegniamo il timer quando cambiamo pagina, altrimenti continua a girare all'infinito in sottofondo!
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    // setInterval è una funzione base di JavaScript che ripete un'azione ogni tot millisecondi
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // 5000 millisecondi = 5 secondi
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  // 4. I COMANDI MANUALI (Le Frecce)

  nextSlide(): void {
    // Se siamo all'ultima diapositiva, torna alla numero 0. Altrimenti, vai alla prossima (+1)
    if (this.currentIndex === this.slides.length - 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }
  }

  prevSlide(): void {
    // Se siamo alla prima diapositiva (0), vai all'ultima. Altrimenti, vai alla precedente (-1)
    if (this.currentIndex === 0) {
      this.currentIndex = this.slides.length - 1;
    } else {
      this.currentIndex--;
    }
  }

  // Opzionale ma utilissimo: Se l'utente clicca a mano una freccia, resettiamo il timer!
  // Altrimenti rischia che clicca "Avanti" e mezzo secondo dopo il timer scatta e gli cambia foto di nuovo.
  manualNext(): void {
    this.stopAutoPlay();
    this.nextSlide();
    this.startAutoPlay(); // Fa ripartire il conto alla rovescia dei 5 secondi da zero
  }

  manualPrev(): void {
    this.stopAutoPlay();
    this.prevSlide();
    this.startAutoPlay();
  }
}
