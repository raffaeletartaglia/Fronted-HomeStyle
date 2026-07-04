import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageReal } from './homepage-real';

describe('HomepageReal', () => {
  let component: HomepageReal;
  let fixture: ComponentFixture<HomepageReal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepageReal],
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageReal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
