import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisultatiRicerca } from './risultati-ricerca';

describe('RisultatiRicerca', () => {
  let component: RisultatiRicerca;
  let fixture: ComponentFixture<RisultatiRicerca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisultatiRicerca],
    }).compileComponents();

    fixture = TestBed.createComponent(RisultatiRicerca);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
