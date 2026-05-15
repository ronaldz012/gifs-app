import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  signal,
  ViewChild
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category-service';
import { Category } from '../../dtos/categories/category-dto';

@Component({
  selector: 'app-create-category',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-category.html',
})
export class CreateCategory implements OnInit, AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  private fb              = inject(FormBuilder);
  categoryService         = inject(CategoryService);

  initialName = input.required<string>();
  created     = output<Category>();
  closed      = output<void>();

  isLoading = signal(false);
  private elRef = inject(ElementRef);
  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  ngOnInit(): void {
    this.form.controls.name.setValue(this.initialName());
  }

  ngAfterViewInit(): void {
    // Pequeño timeout para que el @if termine de renderizar el DOM
    setTimeout(() => this.nameInput?.nativeElement.focus(), 0);
  }

  @HostListener('keydown.escape')
  onEscape() {
    this.closed.emit();
  }
  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement;
    // Si el foco se va a otro elemento fuera de este componente → cerrar
    if (!this.elRef.nativeElement.contains(next)) {
      this.closed.emit();
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const body = this.form.getRawValue();
    this.categoryService.create({ name: body.name!, description: body.description! }).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.created.emit(data);
        this.form.reset();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  get nameInvalid() {
    const ctrl = this.form.get('name')!;
    return ctrl.invalid && ctrl.touched;
  }
}
