import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisComprasComponent } from './mis-compras';

describe('MisCompras', () => {
  let component: MisComprasComponent;
  let fixture: ComponentFixture<MisComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisComprasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MisComprasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
