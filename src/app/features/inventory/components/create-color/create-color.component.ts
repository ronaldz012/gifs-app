import {
  Component, ElementRef, inject, input, output,
  ViewChild, signal, AfterViewInit
} from '@angular/core';
import { form, FormField, required, minLength } from '@angular/forms/signals';
import { ColorService } from '../../services/color-service';
import { Color } from '../../dtos/colors/color';

@Component({
  selector: 'app-create-color',
  standalone: true,
  imports: [FormField],
  templateUrl: './create-color.html'
})
export default class CreateColor implements AfterViewInit {

  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  private colorService = inject(ColorService);

  // --- Inputs / Outputs ---
  initialName = input.required<string>();
  created     = output<Color>();
  closed      = output<void>();

  // --- Estado ---
  isLoading = signal(false);

  // --- Signal Form (Angular 21) ---
  colorModel = signal({ name: '' });

  colorForm = form(this.colorModel, (path) => {
    required(path.name,   { message: 'El nombre es obligatorio' });
    minLength(path.name, 2, { message: 'Mínimo 2 caracteres' });
  });

  ngAfterViewInit(): void {
    // Setear valor inicial una vez la vista está lista
    this.colorModel.update(m => ({ ...m, name: this.initialName() }));
    this.nameInput?.nativeElement.focus();
  }

  // Shortcut limpio
  get nameState() { return this.colorForm.name(); }

  get showNameError(): boolean {
    return this.nameState.touched() && this.nameState.invalid();
  }

  get nameErrorMessage(): string {
    const errors = this.nameState.errors();
    return errors?.[0]?.message ?? '';
  }

  save(): void {
    const rootState = this.colorForm();
    if (rootState.invalid()) {
      // Forzar touched en todos los campos para mostrar errores
      this.colorModel.update(m => ({ ...m }));
      return;
    }

    this.isLoading.set(true);
    const name = this.nameState.value();

    this.colorService.create({name: name}).subscribe({
      next: (newColor) => {
        this.isLoading.set(false);
        this.created.emit(newColor);
        this.colorModel.set({ name: '' });
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this.colorModel.update(m => m); // trigger re-check
          this._serverError.set('Este nombre ya existe');
        }
      }
    });
  }

  // Para el error 409 del servidor (no existe en Signal Forms un setErrors nativo aún)
  _serverError = signal<string | null>(null);

  clearServerError(): void {
    this._serverError.set(null);
  }
}
