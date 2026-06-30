import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPopup } from './all-popup';

describe('AllPopup', () => {
  let component: AllPopup;
  let fixture: ComponentFixture<AllPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPopup],
    }).compileComponents();

    fixture = TestBed.createComponent(AllPopup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
