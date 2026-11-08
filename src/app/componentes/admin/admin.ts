import { CurrencyPipe, DatePipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { TabsModule } from "primeng/tabs";
import { TagModule } from "primeng/tag";
import type { Producto, Usuario, Compra } from "../../models/producto";

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, ButtonModule, DialogModule, InputNumberModule, InputTextModule, TableModule, TabsModule, TagModule],
  templateUrl: "./admin.html",
  styleUrl: "./admin.css",
})
export class AdminComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  
  // Señales reactivas para almacenar los datos que muestra el panel
  readonly products = signal<Producto[]>([]);
  readonly users = signal<Usuario[]>([]);
  readonly sales = signal<Compra[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);
  productDialog = false;

  // Formulario reactivo para administrar los campos del producto
  readonly form = new FormGroup({
    nombre: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl("", { nonNullable: true }),
    precio: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    stock: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    categoria: new FormControl("", { nonNullable: true }),
    imagen: new FormControl("", { nonNullable: true }),
  });

  ngOnInit() { 
    this.loadDashboard(); 
  }

  // Carga simulada local para el panel de administración
  loadDashboard() {
    this.loading.set(true);
    setTimeout(() => {
      this.users.set([
        { id: 1, nombre: "Joaquín Figueroa", email: "joakofigueroa07@gmail.com", rol: "admin" }
      ]);
      this.sales.set([]);
      this.loading.set(false);
    }, 300);
  }

  // Abre el diálogo para dar de alta un producto nuevo
  newProduct() { 
    this.editingId.set(null); 
    this.form.reset({ nombre: "", descripcion: "", precio: null, stock: null, categoria: "", imagen: "" }); 
    this.productDialog = true; 
  }

  // Abre el diálogo cargando los datos del producto seleccionado para editarlo
  edit(product: Producto) {
    this.editingId.set(product.id_producto ?? product.id ?? null);
    this.form.reset({ 
      nombre: product.nombre, 
      descripcion: product.descripcion ?? "", 
      precio: Number(product.precio), 
      stock: product.stock ?? 0, 
      categoria: product.categoria ?? "", 
      imagen: product.imagen ?? "" 
    });
    this.productDialog = true;
  }

  // Guarda los cambios (crea o edita localmente)
  save() {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.saving.set(true);
    const id = this.editingId();
    const formValue = this.form.getRawValue();

    setTimeout(() => {
      const currentProducts = this.products();

      if (id !== null) {
        // Editamos el producto existente mapeando de forma segura
        this.products.set(
          currentProducts.map(p => {
            const pId = p.id_producto ?? p.id;
            if (pId === id) {
              return {
                ...p,
                nombre: formValue.nombre,
                descripcion: formValue.descripcion,
                precio: formValue.precio!,
                stock: formValue.stock!,
                categoria: formValue.categoria,
                imagen: formValue.imagen
              };
            }
            return p;
          })
        );
        this.messages.add({ severity: "success", summary: "Producto actualizado", detail: formValue.nombre });
      } else {
        // Creamos un producto nuevo simulando un ID único
        const newProd: Producto = {
          id: Date.now(),
          id_producto: Date.now(),
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          precio: formValue.precio!,
          stock: formValue.stock!,
          categoria: formValue.categoria,
          imagen: formValue.imagen
        };
        this.products.set([...currentProducts, newProd]);
        this.messages.add({ severity: "success", summary: "Producto creado", detail: formValue.nombre });
      }

      this.saving.set(false);
      this.productDialog = false;
      this.form.reset();
    }, 400);
  }

  // Pide confirmación y elimina un producto del sistema localmente
  remove(product: Producto) {
    const id = product.id_producto ?? product.id;
    this.confirmation.confirm({
      header: "Eliminar producto",
      message: `¿Eliminar ${product.nombre}?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      accept: () => {
        this.products.set(this.products().filter(p => (p.id_producto ?? p.id) !== id));
        this.messages.add({ severity: "success", summary: "Producto eliminado", detail: product.nombre });
      },
    });
  }

  purchaseId(purchase: Compra) { 
    return purchase.id_compra ?? purchase.id; 
  }
}