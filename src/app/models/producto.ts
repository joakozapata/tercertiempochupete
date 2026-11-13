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
  talle?: string;
  talles?: VarianteProducto[];
  categoria?: string;
  imagen?: string;
}

export interface VarianteProducto {
  id_producto: number;
  talle: string;
  stock: number;
}

export type ProductoInput = Partial<Omit<Producto, "talles">> & {
  talles?: Array<Pick<VarianteProducto, "talle" | "stock">>;
};

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
  talle?: string;
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