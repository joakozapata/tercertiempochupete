import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";

@Component({
  selector: "app-contacto",
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, CardModule, InputTextModule, TextareaModule],
  templateUrl: "./contacto.html",
  styleUrl: "./contacto.css",
})
export class ContactoComponent {
  private readonly messages = inject(MessageService);
  
  readonly form = new FormGroup({
    nombre: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }),
    mensaje: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
  });

  send() {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    this.messages.add({ severity: "success", summary: "Consulta enviada", detail: "Te responderemos a la brevedad." });
    this.form.reset();
  }
}