import { CurrencyPipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import type { Producto, ProductoInput, Usuario } from "../../models/producto";
import { AuthService } from "../../servicios/auth-servicio";
import { AdminService } from "../../servicios/admin-service";
import { ProductService } from "../../servicios/product-service";

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, ButtonModule, DialogModule, InputNumberModule, InputTextModule, TableModule],
  templateUrl: "./admin.html",
  styleUrl: "./admin.css",
})
export class AdminComponent implements OnInit {
  private readonly messages = inject(MessageService);
  private readonly productService = inject(ProductService);
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  
  // Señales reactivas para almacenar los datos que muestra el panel
  readonly products = signal<Producto[]>([]);
  readonly users = signal<Usuario[]>([]);
  readonly loading = signal(true);
  readonly loadingUsers = signal(true);
  readonly saving = signal(false);
  readonly savingUser = signal(false);
  readonly deleting = signal(false);
  readonly deletingUserRequest = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly deletingProduct = signal<Producto | null>(null);
  readonly editingUser = signal<Usuario | null>(null);
  readonly pendingUserRemoval = signal<Usuario | null>(null);
  readonly activeSection = signal<"products" | "users">("products");
  productDialog = false;
  deleteDialog = false;
  userDialog = false;
  userDeleteDialog = false;

  private createSizeForm(talle = "", stock: number | null = 0) {
    return new FormGroup({
      talle: new FormControl(talle, { nonNullable: true, validators: [Validators.required] }),
      stock: new FormControl<number | null>(stock, [Validators.required, Validators.min(0)]),
    });
  }

  get sizeControls() {
    return this.form.controls.talles.controls;
  }

  readonly form = new FormGroup({
    nombre: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl("", { nonNullable: true }),
    precio: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    imagen: new FormControl("", { nonNullable: true }),
    talles: new FormArray([this.createSizeForm()]),
  });

  readonly userForm = new FormGroup({
    nombre: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    email: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(100)] }),
    rol: new FormControl<"admin" | "user">("user", { nonNullable: true }),
  });

  ngOnInit() { 
    this.loadDashboard();
    this.loadUsers();
  }

  loadDashboard() {
    this.loading.set(true);
    this.productService.listar().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error("No se pudieron cargar los productos:", error);
        this.loading.set(false);
        this.messages.add({
          severity: "error",
          summary: "Error al cargar",
          detail: "No se pudieron cargar los productos."
        });
      }
    });
  }

  loadUsers() {
    this.loadingUsers.set(true);
    this.adminService.listarUsuarios().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loadingUsers.set(false);
      },
      error: (error) => {
        console.error("No se pudieron cargar los usuarios:", error);
        this.loadingUsers.set(false);
        this.messages.add({
          severity: "error",
          summary: "Error al cargar usuarios",
          detail: this.apiError(error, "No se pudieron cargar los usuarios.")
        });
      }
    });
  }

  // Abre el diálogo para dar de alta un producto nuevo
  newProduct() { 
    this.editingId.set(null); 
    this.form.reset({ nombre: "", descripcion: "", precio: null, imagen: "" }); 
    this.form.setControl("talles", new FormArray([this.createSizeForm()]));
    this.productDialog = true; 
  }

  closeProductDialog() {
    if (!this.saving()) {
      this.productDialog = false;
    }
  }

  // Abre el diálogo cargando los datos del producto seleccionado para editarlo
  edit(product: Producto) {
    this.editingId.set(product.id_producto ?? product.id ?? null);
    const talles = product.talles ?? [{
      id_producto: product.id_producto ?? product.id,
      talle: product.talle ?? "Único",
      stock: Number(product.stock ?? 0),
    }];
    this.form.reset({
      nombre: product.nombre, 
      descripcion: product.descripcion ?? "", 
      precio: Number(product.precio), 
      imagen: product.imagen ?? "" 
    });
    this.form.setControl("talles", new FormArray(
      talles.map((variante) => this.createSizeForm(variante.talle, Number(variante.stock)))
    ));
    this.productDialog = true;
  }

  addSize() {
    this.form.controls.talles.push(this.createSizeForm());
  }

  removeSize(index: number) {
    if (this.sizeControls.length > 1) {
      this.form.controls.talles.removeAt(index);
    }
  }

  save() {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.saving.set(true);
    const id = this.editingId();
    const formValue = this.form.getRawValue();
    const producto: ProductoInput = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      precio: formValue.precio!,
      imagen: formValue.imagen,
      talles: formValue.talles.map((variante) => ({
        talle: variante.talle.trim(),
        stock: variante.stock!,
      })),
    };
    const request = id === null
      ? this.productService.crear(producto)
      : this.productService.editar(id, producto);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.productDialog = false;
        this.form.reset({ nombre: "", descripcion: "", precio: null, imagen: "" });
        this.form.setControl("talles", new FormArray([this.createSizeForm()]));
        this.messages.add({
          severity: "success",
          summary: id === null ? "Producto creado" : "Producto actualizado",
          detail: formValue.nombre
        });
        this.loadDashboard();
      },
      error: (error) => {
        console.error("No se pudo guardar el producto:", error);
        this.saving.set(false);
        this.messages.add({
          severity: "error",
          summary: "No se pudo guardar",
          detail: this.apiError(error, "Revisá los datos, la conexión y tus permisos de administrador.")
        });
      }
    });
  }

  remove(product: Producto) {
    this.deletingProduct.set(product);
    this.deleteDialog = true;
  }

  cancelDelete() {
    if (!this.deleting()) {
      this.deleteDialog = false;
      this.deletingProduct.set(null);
    }
  }

  confirmDelete() {
    const product = this.deletingProduct();
    if (!product || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.productService.eliminar(product.id_producto ?? product.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteDialog = false;
        this.deletingProduct.set(null);
        this.messages.add({
          severity: "success",
          summary: "Producto eliminado",
          detail: product.nombre
        });
        this.loadDashboard();
      },
      error: (error) => {
        console.error("No se pudo eliminar el producto:", error);
        this.deleting.set(false);
        this.messages.add({
          severity: "error",
          summary: "No se pudo eliminar",
          detail: "Revisá la conexión y tus permisos de administrador."
        });
      }
    });
  }

  editUser(user: Usuario) {
    this.editingUser.set(user);
    this.userForm.controls.rol.enable();
    this.userForm.reset({ nombre: user.nombre, email: user.email, rol: user.rol });
    if (this.isCurrentUser(user)) {
      this.userForm.controls.rol.disable();
    }
    this.userDialog = true;
  }

  closeUserDialog() {
    if (!this.savingUser()) {
      this.userDialog = false;
      this.editingUser.set(null);
    }
  }

  isCurrentUser(user: Usuario): boolean {
    return user.id === this.authService.user()?.id;
  }

  isEditingCurrentUser(): boolean {
    const user = this.editingUser();
    return user !== null && this.isCurrentUser(user);
  }

  saveUser() {
    const user = this.editingUser();
    if (!user || this.userForm.invalid || this.savingUser()) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.savingUser.set(true);
    const values = this.userForm.getRawValue();
    this.adminService.editarUsuario(user.id, {
      nombre: values.nombre.trim(),
      email: values.email.trim().toLowerCase(),
      rol: values.rol,
    }).subscribe({
      next: () => {
        this.savingUser.set(false);
        this.userDialog = false;
        this.editingUser.set(null);
        this.messages.add({
          severity: "success",
          summary: "Usuario actualizado",
          detail: values.nombre.trim()
        });
        this.loadUsers();
      },
      error: (error) => {
        console.error("No se pudo actualizar el usuario:", error);
        this.savingUser.set(false);
        this.messages.add({
          severity: "error",
          summary: "No se pudo actualizar",
          detail: this.apiError(error, "Revisá los datos y tus permisos de administrador.")
        });
      }
    });
  }

  removeUser(user: Usuario) {
    this.pendingUserRemoval.set(user);
    this.userDeleteDialog = true;
  }

  cancelDeleteUser() {
    if (!this.deletingUserRequest()) {
      this.userDeleteDialog = false;
      this.pendingUserRemoval.set(null);
    }
  }

  confirmDeleteUser() {
    const user = this.pendingUserRemoval();
    if (!user || this.deletingUserRequest()) {
      return;
    }

    this.deletingUserRequest.set(true);
    this.adminService.eliminarUsuario(user.id).subscribe({
      next: () => {
        this.deletingUserRequest.set(false);
        this.userDeleteDialog = false;
        this.pendingUserRemoval.set(null);
        this.messages.add({
          severity: "success",
          summary: "Usuario eliminado",
          detail: user.nombre
        });
        this.loadUsers();
      },
      error: (error) => {
        console.error("No se pudo eliminar el usuario:", error);
        this.deletingUserRequest.set(false);
        this.messages.add({
          severity: "error",
          summary: "No se pudo eliminar",
          detail: this.apiError(error, "Revisá las restricciones de la cuenta y tus permisos de administrador.")
        });
      }
    });
  }

  private apiError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.error === "string") {
      return error.error.error;
    }
    return fallback;
  }
}