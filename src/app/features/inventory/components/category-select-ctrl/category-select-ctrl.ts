import { Component, computed, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import {Category} from '../../dtos/categories/category-dto';
import {CreateCategory} from '../create-category/create-category'; // ajusta path
import SelectCtrl from '@shared/components/selec-from-list-ctrl';
import { FieldState, FieldTree } from '@angular/forms/signals';
import { CategoryService } from '@features/inventory/services/category-service';

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

  private elRef = inject(ElementRef);
  categoryService= inject(CategoryService);


  fieldId        = input.required<FieldState<GUID>>();
  fieldName        = input.required<FieldState<string>>();
  categories  = this.categoryService.categories;
  placeholder = input<string>('Categoría...');


  showCreate  = signal(false);
  createQuery = signal('');

  categoryOptions = computed(() =>
    this.categories().map(c => ({ id: c.id, displayName: c.name }))
  );
  categorySelected(id: GUID) {
  const category = this.categories().find(c => c.id === id);
  this.fieldName().setControlValue(category?.name ?? '');
  }

  openInlineCreate(query: string) {
    this.createQuery.set(query);
    this.showCreate.set(true);
  }

  closeInlineCreate() {
    this.showCreate.set(false);
    this.createQuery.set('');
  }

  onCreated(category: Category) {
    this.categoryService.add(category)
    this.fieldId().setControlValue(category.id);
    this.fieldName().setControlValue(category.name);
    this.fieldId().markAsTouched();
    this.closeInlineCreate();
  }
}
