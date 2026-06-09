import { Component, input, output, signal, OnInit, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductDetailDto } from '../../../dtos/products/product-detail-dto';
import { CategoryService } from '../../../services/category-service';
import {UpdateProductDto} from '../../../dtos/products/update-product-dto';
import {Gender} from '../../../interfaces/gender';
import { SearchableSelect } from '@shared/components/searchable-select';
import { SelectOption } from '@shared/models/select-option.model';
import { BrandService } from '@features/inventory/services/brand-service';



const GENDER_LABELS: Record<number, string> = {
  [Gender.Unisex]: 'Unisex',
  [Gender.Hombre]: 'Hombre',
  [Gender.Mujer]:  'Mujer',
};

/**
 * Modal for updating a product's general info.
 *
 * Usage:
 *   @if (showUpdateModal()) {
 *     <app-update-product-modal
 *       [product]="product()"
 *       [submitting]="submitting()"
 *       (save)="onUpdateProduct($event)"
 *       (close)="showUpdateModal.set(false)"
 *     />
 *   }
 */
@Component({
  selector: 'app-update-product-modal',
  imports: [FormsModule, SearchableSelect],
  template: `
  <!-- Overlay -->
<div
  class="fixed inset-0 bg-overlay z-40 flex items-end sm:items-center justify-center backdrop-blur-[2px]"
  (click)="close.emit()"
>
  <!-- Sheet / Dialog -->
  <div
    class="modal-enter w-full sm:w-[480px] bg-bg-surface
           rounded-t-2xl sm:rounded-2xl shadow-lg z-50
           px-5 pt-5 pb-7 sm:pb-5 max-h-[90vh] overflow-y-auto"
    (click)="$event.stopPropagation()"
  >
    <!-- Handle (mobile) -->
    <div class="sm:hidden w-10 h-1 rounded-full bg-bg-muted mx-auto mb-5"></div>

    <p class="text-sm font-semibold text-text-main mb-1">Editar producto</p>
    <p class="text-xs text-text-soft mb-5">Solo se actualizarán los campos que modifiques.</p>

    <div class="flex flex-col gap-4">

          <app-searchable-select
        label="Categoría"
        placeholder="Seleccionar categoría..."
        [options]="categoryOptions()"
        [selectedId]="form.categoryId"
        (selected)="form.categoryId = $event"
      />

      <!-- Nombre -->
      <div>
        <label class="field-label block">Nombre</label>
        <input
          type="text"
          [(ngModel)]="form.name"
          class="w-full px-3 py-2 text-sm text-text-main bg-bg-surface border border-border rounded-lg
                 focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-ring-focus-ring"
          placeholder="Nombre del producto"
        />
      </div>

      <!-- Descripción -->
      <div>
        <label class="field-label block">Descripción</label>
        <textarea
          [(ngModel)]="form.description"
          rows="3"
          class="w-full px-3 py-2 text-sm text-text-main bg-bg-surface border border-border rounded-lg resize-none
                 focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-ring-focus-ring"
          placeholder="Descripción del producto"
        ></textarea>
      </div>

      <!-- Género -->
      <div>
        <label class="field-label block">Género</label>
        <select
          [(ngModel)]="form.gender"
          class="w-full px-3 py-2 text-sm text-text-main bg-bg-surface border border-border rounded-lg
                 focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-ring-focus-ring">
          <option [ngValue]="Gender.Unisex">Unisex</option>
          <option [ngValue]="Gender.Hombre">Hombre</option>
          <option [ngValue]="Gender.Mujer">Mujer</option>
        </select>
      </div>

      <!-- Categoría -->


    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-3 mt-6">
      <button (click)="close.emit()" class="btn-secondary flex-1 py-2.5 rounded-xl">
        Cancelar
      </button>
      <button
        (click)="onSave()"
        [disabled]="submitting()"
        class="btn-primary flex-1 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
      >
        @if (submitting()) {
          <span class="opacity-70">Guardando...</span>
        } @else {
          Guardar cambios
        }
      </button>
    </div>
  </div>
</div>
  `,
  styles: `
    @keyframes modal-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .modal-enter {
      animation: modal-in 180ms ease both;
    }
  `,
})
export class UpdateProductModal implements OnInit {
  protected readonly Gender = Gender;

  private categoryService = inject(CategoryService);


categoryOptions = computed(() => 
  this.categoryService.categories().map(cat => ({
    id: cat.id,
    displayName: cat.name
  }))
);
  product    = input.required<ProductDetailDto>();
  submitting = input<boolean>(false);

  save  = output<UpdateProductDto>();
  close = output<void>();


  form: {
    name:        string;
    description: string;
    gender:      Gender | null;
    categoryId:  GUID | null;
  } = {
    name:        '',
    description: '',
    gender:      null,
    categoryId:  null,
  };

  ngOnInit(): void {
    const p = this.product();

    this.form.name        = p.name;
    this.form.description = p.description ?? '';
    this.form.gender      = p.gender ?? null;   // ya viene como número del enum
    this.form.categoryId  = p.categoryId ?? null;

    // this.categoryService.getAll().subscribe(list => this.categories.set(list));
    // this.brandService.getAll().subscribe(list => this.brands.set(list));
  }

  onSave(): void {
    const dto: UpdateProductDto = {};

    if (this.form.name?.trim())        dto.name        = this.form.name.trim();
    if (this.form.description?.trim()) dto.description = this.form.description.trim();
    if (this.form.gender != null)      dto.gender      = this.form.gender;
    if (this.form.categoryId != null)  dto.categoryId  = this.form.categoryId;

    this.save.emit(dto);
  }
}
