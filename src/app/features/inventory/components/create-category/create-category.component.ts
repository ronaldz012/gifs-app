import {
  Component, ElementRef, HostListener, inject,
  input, output, signal, ViewChild, AfterViewInit
} from '@angular/core';
import { form, FormField, required, minLength } from '@angular/forms/signals';
import { CategoryService } from '../../services/category-service';
import { ToastService } from '@core/services/toast-service';
import { Category } from '../../dtos/categories/category-dto';

@Component({
  selector: 'app-create-category',
  standalone: true,
  imports: [FormField],
  templateUrl: './create-category.html',
})
export class CreateCategory implements AfterViewInit {

  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private elRef           = inject(ElementRef);

  // --- Inputs / Outputs ---
  initialName = input.required<string>();
  created     = output<Category>();
  closed      = output<void>();

  // --- Estado ---
  isLoading   = signal(false);
  serverError = signal<string | null>(null);

  // --- Signal Form ---
  categoryModel = signal({ name: '', description: '' });

  categoryForm = form(this.categoryModel, (path) => {
    required(path.name,     { message: 'El nombre es obligatorio' });
    minLength(path.name, 2, { message: 'Mínimo 2 caracteres' });
  });

  ngAfterViewInit(): void {
    this.categoryModel.update(m => ({ ...m, name: this.initialName() }));
    setTimeout(() => this.nameInput?.nativeElement.focus(), 0);
  }

  @HostListener('keydown.escape')
  onEscape(): void { this.closed.emit(); }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as HTMLElement;
    if (this.isLoading()) return;
    if (!this.elRef.nativeElement.contains(next)) this.closed.emit();
  }

  // --- Shortcuts ---
  get nameState() { return this.categoryForm.name(); }

  get nameInvalid(): boolean {
    return this.nameState.touched() && this.nameState.invalid();
  }

  get nameError(): string {
    return this.nameState.errors()?.[0]?.message ?? '';
  }

  clearServerError(): void { this.serverError.set(null); }

save(): void {
  if (this.categoryForm().invalid()) return;

  this.isLoading.set(true);
  const { name, description } = this.categoryModel();

  this.categoryService.create({ name, description }).subscribe({
    next: (data) => {
      this.isLoading.set(false);
      this.categoryModel.set({ name: '', description: '' });
      this.created.emit(data);
    },
    error: (err) => {
      this.isLoading.set(false);
      if (err.status === 409) this.serverError.set('Esta categoría ya existe');
      else {
        const msg = err?.error?.detail || err?.error?.title || err?.message || 'Error al crear la categoría.';
        this.toast.error(msg);
      }
    }
  });
}
}
