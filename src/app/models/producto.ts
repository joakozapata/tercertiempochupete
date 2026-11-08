export interface ApiEnvelope<T> {
  data?: T;
  mensaje?: string;
  error?: string;
}

export interface Producto {
  id: number;
  id_producto?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock?: number;
  categoria?: string;
  imagen?: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "user";
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface ItemCarrito {
  id: number;          // ID del item en el carrito o del producto
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  producto?: Producto;
  nombre?: string;
  imagen?: string;
}

export interface Carrito {
  id?: number;
  items: ItemCarrito[];
  total?: number;
}

export interface Compra {
  id: number;
  id_compra?: number;
  fecha?: string;
  total: number;
  estado?: string;
  detalles?: ItemCarrito[];
}

export interface Ticket {
  id_compra: number;
  archivo?: string;
  url?: string;
  generado_en?: string;
}