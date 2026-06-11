import {
  Component, computed, ElementRef, HostListener,
  inject, input, output, signal
} from '@angular/core';
import { FieldState } from '@angular/forms/signals';
import { Category } from '../../dtos/categories/category-dto';
import { CategoryService } from '@features/inventory/services/category-service';
import { CreateCategory } from '../create-category/create-category';
import SelectCtrl from '@shared/components/selec-from-list-ctrl';

@Component({
  selector: 'app-category-select-ctrl',
  standalone: true,
  imports: [SelectCtrl, CreateCategory],
  template: `
    <div class="relative w-full">
      <app-select-ctrl
        [fieldState]="fieldId()"
        [options]="categoryOptions()"
        [placeholder]="placeholder()"
        (selected)="categorySelected($event)"
        (createNew)="openInlineCreate($event)"
      />
      @if (showCreate()) {
        <div class="absolute z-110 w-full mt-1">
          <app-create-category
            [initialName]="createQuery()"
            (created)="onCreated($event)"
            (closed)="closeInlineCreate()"
          />
        </div>
      }
    </div>
  `,
})
export class CategorySelectCtrl {

  private categoryService = inject(CategoryService);

  fieldId   = input.required<FieldState<GUID>>();
  fieldName = input.required<FieldState<string>>();
  placeholder = input<string>('Categoría...');

  // Notifica al padre que seleccionó o creó una categoría
  categoryChange = output<Category>();

  categoryOptions = computed(() =>
    this.categoryService.categories().map(c => ({ id: c.id, displayName: c.name }))
  );

  showCreate  = signal(false);
  createQuery = signal('');

  categorySelected(id: GUID): void {
    const found = this.categoryOptions().find(o => o.id === id);
    if (!found) return;
    this.fieldId().value.set(id);
    this.fieldName().value.set(found.displayName);
  }

  openInlineCreate(query: string): void {
    this.createQuery.set(query);
    this.showCreate.set(true);
  }

  closeInlineCreate(): void {
    this.showCreate.set(false);
    this.createQuery.set('');
  }

  onCreated(category: Category): void {
    // 1. Primero agregar al store/signal del servicio
    console.log(category)
    this.categoryService.add(category);


    // 2. Leer las opciones YA actualizadas (computed se recalcula síncronamente)
    const option = this.categoryOptions().find(o => o.id === category.id);

    // 3. Actualizar los FieldState
    this.fieldId().value.set(category.id);
    this.fieldName().value.set(option?.displayName ?? category.name);
    this.fieldId().markAsTouched();
    this.fieldName().markAsTouched();

    // 4. Notificar al padre si lo necesita
    this.categoryChange.emit(category);

    this.closeInlineCreate();
  }
}