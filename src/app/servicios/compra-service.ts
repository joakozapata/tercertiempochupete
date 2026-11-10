import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import type { Compra } from "../models/producto";

@Injectable({
  providedIn: "root",
})
export class CompraService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost/api-proyecto";

  // Finalizar compra (Checkout)
  finalizarCompra(datosEnvio?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/compras/finalizar`, datosEnvio || {});
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