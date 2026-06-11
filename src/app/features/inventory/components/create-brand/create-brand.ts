import {
  Component, ElementRef, inject, input, output,
  ViewChild, signal, AfterViewInit
} from '@angular/core';
import { form, FormField, required, minLength, maxLength, validate } from '@angular/forms/signals';
import { Brand } from '../../dtos/brands/brand-dto';
import { BrandService } from '@features/inventory/services/brand-service';

@Component({
  selector: 'app-create-brand',
  standalone: true,
  imports: [FormField],
  templateUrl: './create-brand.html',
})
export default class CreateBrand implements AfterViewInit {

  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  private brandService = inject(BrandService);

  // --- Inputs / Outputs ---
  initialName = input.required<string>();
  created     = output<Brand>();
  closed      = output<void>();

  // --- Estado ---
  isLoading  = signal(false);
  serverError = signal<string | null>(null);

  // --- Signal Form ---
  brandModel = signal({ name: '', prefix: '', description: '' });

  brandForm = form(this.brandModel, (path) => {
    required(path.name,        { message: 'El nombre es obligatorio' });
    minLength(path.name, 2,    { message: 'Mínimo 2 caracteres' });

    required(path.prefix,      { message: 'El prefijo es requerido' });
    minLength(path.prefix, 3,  { message: 'Debe tener exactamente 3 letras' });
    maxLength(path.prefix, 3,  { message: 'Debe tener exactamente 3 letras' });
    validate(path.prefix, (ctx) => {
      if (/^[A-Za-z]{3}$/.test(ctx.value())) return null;
      return { kind: 'letters_only', message: 'Solo se permiten letras' };
    });
  });

  ngAfterViewInit(): void {
    this.brandModel.update(m => ({ ...m, name: this.initialName() }));
    this.nameInput?.nativeElement.focus();
  }

  // --- Shortcuts de estado ---
  get nameState()        { return this.brandForm.name(); }
  get prefixState()      { return this.brandForm.prefix(); }
  get descriptionState() { return this.brandForm.description(); }

  get nameInvalid():   boolean { return this.nameState.touched()   && this.nameState.invalid(); }
  get prefixInvalid(): boolean { return this.prefixState.touched() && this.prefixState.invalid(); }

  get nameError():   string { return this.nameState.errors()?.[0]?.message   ?? ''; }
  get prefixError(): string { return this.prefixState.errors()?.[0]?.message ?? ''; }

  // --- Prefix: forzar mayúsculas y solo letras ---
  onPrefixInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const clean = el.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
    el.value = clean;
    this.brandModel.update(m => ({ ...m, prefix: clean }));
  }

  clearServerError(): void { this.serverError.set(null); }

  save(): void {
    if (this.brandForm().invalid()) return;

    this.isLoading.set(true);
    const { name, prefix, description } = this.brandModel();

    this.brandService.create({ name, prefix: prefix.toUpperCase(), description }).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.created.emit(data);
        this.brandModel.set({ name: '', prefix: '', description: '' });
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          const detail = err.error?.detail?.toLowerCase() ?? '';
          if (detail.includes('prefix') || detail.includes('prefijo')) {
            this.serverError.set('Este prefijo ya existe');
          } else {
            this.serverError.set('Este nombre ya existe');
          }
        }
      }
    });
  }
}