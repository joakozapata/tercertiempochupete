import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import type { Producto } from '../../models/producto';
import { ProductService } from '../../servicios/product-service';
import { CarritoService } from '../../servicios/servicios-carrito';

import { OfertasComponent } from './ofertas';

describe('OfertasComponent', () => {
  let component: OfertasComponent;
  let fixture: ComponentFixture<OfertasComponent>;
  let addedVariantId: number | undefined;

  const products: Producto[] = [
    {
      id: 1,
      nombre: 'Camiseta Oficial Rugby',
      precio: 45999,
      talles: [
        { id_producto: 10, talle: 'S', stock: 0 },
        { id_producto: 11, talle: 'M', stock: 3 },
      ],
    },
    { id: 2, nombre: 'Short Deportivo Training', precio: 29999, stock: 2 },
    { id: 3, nombre: 'Otro producto', precio: 12000, stock: 1 },
  ];

  beforeEach(async () => {
    addedVariantId = undefined;
    await TestBed.configureTestingModule({
      imports: [OfertasComponent],
      providers: [
        { provide: ProductService, useValue: { listar: () => of(products) } },
        {
          provide: CarritoService,
          useValue: {
            add: (_product: Producto, variantId: number) => {
              addedVariantId = variantId;
              return of({});
            },
          },
        },
        { provide: MessageService, useValue: { add: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OfertasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the rugby kit products before other catalog items', () => {
    expect(component.recommendedProducts().map((product) => product.nombre)).toEqual([
      'Camiseta Oficial Rugby',
      'Short Deportivo Training',
    ]);
  });

  it('adds the selected in-stock size to the cart', () => {
    component.addToCart(component.recommendedProducts()[0]);

    expect(addedVariantId).toBe(11);
  });
});
