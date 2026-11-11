import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import type { Compra } from "../models/producto";
import { CarritoService } from "./servicios-carrito";

@Injectable({
  providedIn: "root",
})
export class CompraService {
  private http = inject(HttpClient);
  private carritoService = inject(CarritoService);
  private apiUrl = "http://localhost/api_proyecto/public"; // URL corregida y unificada

  // Finalizar compra (Checkout)
  finalizarCompra(datosEnvio?: any): Observable<any> {
    const payload = {
      envio: datosEnvio || {},
      items: this.carritoService.items(),
      total: this.carritoService.total()
    };
    return this.http.post(`${this.apiUrl}/compras/finalizar`, payload);
  }

  // Historial de compras del usuario autenticado
  getMisCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(`${this.apiUrl}/compras`);
  }

  // Todas las ventas (Panel Admin)
  getTodasLasVentas(): Observable<Compra[]> {
    return this.http.get<Compra[]>(`${this.apiUrl}/compras/todas`);
  }
}