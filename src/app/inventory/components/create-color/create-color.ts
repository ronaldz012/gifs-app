import { Component, ElementRef, inject, input, OnInit, output, ViewChild, signal, AfterViewInit} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColorService } from '../../services/color-service';
import { Color } from '../../dtos/Colors/color';

@Component({
  selector: 'app-create-color',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-color.html'
})
export default class CreateColor implements OnInit, AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private colorService = inject(ColorService);

  initialName = input.required<string>();
  created = output<Color>();
  closed = output<void>();

  isLoading = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    code: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)]]
  });

  ngOnInit(): void {
    this.form.controls.name.setValue(this.initialName());
    // Auto-sugerir código basado en el nombre inicial
    if (this.initialName().length >= 3) {
      this.form.controls.code.setValue(this.initialName().substring(0, 3).toUpperCase());
    }
  }
  ngAfterViewInit(): void {
    // Esto asegura el foco cuando el componente se carga
    this.focus();
  }
  onCodeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
    this.form.controls.code.setValue(input.value, { emitEvent: false });
  }
  focus() {
    this.nameInput?.nativeElement.focus();
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { name, code } = this.form.getRawValue();

    this.colorService.create({
      name: name!,
      code: code!.toUpperCase()
    }).subscribe({
      next: (newColor) => {
        this.isLoading.set(false);
        this.created.emit(newColor);
        this.form.reset();
      },
      error: (err) => {
        this.isLoading.set(false);

        // Verificamos el status 409
        if (err.status === 409) {
          // Accedemos a 'detail' que es lo que envía tu API
          const detail = err.error?.detail?.toLowerCase() || '';

          if (detail.includes('código') || detail.includes('code')) {
            this.form.controls.code.setErrors({ codeTaken: true });
            this.form.controls.code.markAsTouched();
          } else if (detail.includes('nombre') || detail.includes('name')) {
            this.form.controls.name.setErrors({ nameTaken: true });
            this.form.controls.name.markAsTouched();
          }
        }
      }
    });
  }

  // Getters para UI
  get nameInvalid() { return this.form.controls.name.invalid && this.form.controls.name.touched; }
  get codeInvalid() { return this.form.controls.code.invalid && this.form.controls.code.touched; }

  get nameErrorMessage() {
    if (this.form.controls.name.hasError('required')) return 'El nombre es obligatorio';
    if (this.form.controls.name.hasError('nameTaken')) return 'Este nombre ya existe';
    return '';
  }

  get codeErrorMessage() {
    const ctrl = this.form.controls.code;
    if (ctrl.hasError('required')) return 'Código requerido';
    if (ctrl.hasError('pattern')) return 'Solo 3 letras (A-Z)';
    if (ctrl.hasError('codeTaken')) return 'Código ocupado (incluso en borrados)';
    return '';
  }
}
