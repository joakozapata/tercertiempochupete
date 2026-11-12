import { Routes } from '@angular/router';
import { InicioComponent } from './paginas/inicio/inicio';
import { ContactoComponent } from './paginas/contacto/contacto';
import { OfertasComponent } from './paginas/ofertas/ofertas';
import { ProductosComponent } from './paginas/productos/productos';
import { LoginComponent } from './Auth/inicio-sesion/inicio-sesion';
import { RegistroComponent } from './Auth/registro/registro';
import { CarritoComponent } from './compartidos/carrito/carrito';
import { FavoritosComponent } from './compartidos/favoritos/favoritos';
import { AdminComponent } from './paginas/admin/admin';
import { CompraComponent } from './paginas/compra/compra';
import { MisComprasComponent } from './paginas/mis-compras/mis-compras';
import { TicketComponent } from './paginas/ticket/ticket';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: InicioComponent },
    { path: 'contacto', component: ContactoComponent },
    { path: 'ofertas', component: OfertasComponent },
    { path: 'productos', component: ProductosComponent },
    { path: 'inicioSesion', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'carrito', component: CarritoComponent },
    { path: 'favoritos', component: FavoritosComponent },
    { path: 'compra', component: CompraComponent },
    { path: 'mis-compras', component: MisComprasComponent },
    { path: 'ticket/:id', component: TicketComponent },
    { path: 'admin', component: AdminComponent },
    { path: '**', redirectTo: 'inicio' }
];