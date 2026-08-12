import {
  Component,
  ElementRef,
  inject,
  input,
  output,
  ViewChild,
  signal,
  AfterViewInit,
} from '@angular/core';
import { form, FormField, required, minLength } from '@angular/forms/signals';
import { SizeService } from '../../services/size-service';
import { Size } from '../../dtos/sizes/size';

@Component({
  selector: 'app-create-size',
  standalone: true,
  imports: [FormField],
  templateUrl: './create-size.html',
})
export default class CreateSize implements AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  private sizeService = inject(SizeService);

  // --- Inputs / Outputs ---
  initialName = input.required<string>();
  created = output<Size>();
  closed = output<void>();

  // --- Estado ---
  isLoading = signal(false);

  // --- Signal Form (Angular 21) ---
  sizeModel = signal({ name: '' });

  sizeForm = form(this.sizeModel, (path) => {
    required(path.name, { message: 'El nombre es obligatorio' });
    minLength(path.name, 1, { message: 'Mínimo 1 carácter' });
  });

  ngAfterViewInit(): void {
    this.sizeModel.update((m) => ({ ...m, name: this.initialName() }));
    this.nameInput?.nativeElement.focus();
  }

  get nameState() {
    return this.sizeForm.name();
  }

  get showNameError(): boolean {
    return this.nameState.touched() && this.nameState.invalid();
  }

  get nameErrorMessage(): string {
    const errors = this.nameState.errors();
    return errors?.[0]?.message ?? '';
  }

  save(): void {
    const rootState = this.sizeForm();
    if (rootState.invalid()) return;

    this.isLoading.set(true);
    const name = this.nameState.value();

    this.sizeService.create({ name, sortOrder: 0 }).subscribe({
      next: (newSize) => {
        this.isLoading.set(false);
        this.created.emit(newSize);
        this.sizeModel.set({ name: '' });
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this._serverError.set('Este nombre ya existe');
        }
      },
    });
  }

  _serverError = signal<string | null>(null);

  clearServerError(): void {
    this._serverError.set(null);
  }
}
