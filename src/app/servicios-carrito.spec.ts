import { TestBed } from '@angular/core/testing';

import { CarritoService } from './servicios-carrito';

describe('ServiciosCarrito', () => {
  let service: CarritoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarritoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
