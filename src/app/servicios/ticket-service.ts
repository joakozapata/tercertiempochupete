import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TicketService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/API_TercerTiempo/public'; // URL unificada con /public y el nombre correcto

  // Obtener ticket existente por ID de compra
  getTicket(id_compra: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tickets/${id_compra}`);
  }

  // Generar ticket PDF nuevo
  generarTicket(id_compra: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/generar/${id_compra}`, {});
  }
}