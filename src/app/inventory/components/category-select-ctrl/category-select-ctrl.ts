import { Component, computed, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectCtrl } from '../../../core/components/selec-from-list-ctrl';
import {Category} from '../../dtos/categories/category-dto';
import {CreateCategory} from '../create-category/create-category'; // ajusta path

@Component({
  selector: 'app-category-select-ctrl',
  standalone: true,
  imports: [SelectCtrl, CreateCategory],
  template: `
    <div class="relative w-full">
      <app-select-ctrl
        [ctrl]="ctrl()"
        [options]="categoryOptions()"
        [placeholder]="placeholder()"
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

  ctrl        = input.required<FormControl>();
  categories  = input<Category[]>([]);
  placeholder = input<string>('Categoría...');

  categoryCreated = output<Category>();

  showCreate  = signal(false);
  createQuery = signal('');

  categoryOptions = computed(() =>
    this.categories().map(c => ({ id: c.id, name: c.name }))
  );

  openInlineCreate(query: string) {
    this.createQuery.set(query);
    this.showCreate.set(true);
  }

  closeInlineCreate() {
    this.showCreate.set(false);
    this.createQuery.set('');
  }

  onCreated(category: Category) {
    this.ctrl().setValue(category.id);
    this.ctrl().markAsTouched();
    this.closeInlineCreate();
    this.categoryCreated.emit(category);
  }
}
