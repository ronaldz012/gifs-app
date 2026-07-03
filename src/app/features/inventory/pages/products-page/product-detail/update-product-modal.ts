import { Component, input, output, OnInit, inject, signal } from '@angular/core';
import { ProductDetailDto } from '../../../dtos/products/product-detail-dto';
import { UpdateProductDto } from '../../../dtos/products/update-product-dto';
import { Gender } from '../../../interfaces/gender';
import { CategoryService } from '../../../services/category-service';
import { CategorySelectCtrl } from "@features/inventory/components/category-select-ctrl/category-select-ctrl.component";
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-update-product-modal',
  imports: [CategorySelectCtrl, FormField],
  template: `
<div
  class="fixed inset-0 bg-overlay z-40 flex items-end sm:items-center justify-center backdrop-blur-[2px]"
  (click)="close.emit()"
>
  <div
    class="modal-enter w-full sm:w-[480px] bg-bg-surface
           rounded-t-2xl sm:rounded-2xl shadow-lg z-50
           px-5 pt-5 pb-7 sm:pb-5 max-h-[90vh] overflow-y-auto"
    (click)="$event.stopPropagation()"
  >
    <div class="sm:hidden w-10 h-1 rounded-full bg-bg-muted mx-auto mb-5"></div>

    <p class="text-sm font-semibold text-text-main mb-1">Editar producto</p>
    <p class="text-xs text-text-soft mb-5">Solo se actualizarán los campos que modifiques.</p>

    <div class="flex flex-col gap-4">

      <div class="flex flex-col gap-1">
        <label class="field-label block">Categoría</label>
        <app-category-select-ctrl
          [fieldId]="productForm.categoryId()"
          [fieldName]="productForm.categoryName()" />
      </div>

      <div>
        <label class="field-label block">Nombre</label>
        <input
          type="text"
          [formField]="productForm.name"
          class="w-full px-3 py-2 text-sm text-text-main bg-bg-surface border border-border rounded-lg
                 focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-ring-focus-ring"
          placeholder="Nombre del producto"
        />
      </div>

      <div>
        <label class="field-label block">Descripción</label>
        <textarea
          [formField]="productForm.description"
          rows="3"
          class="w-full px-3 py-2 text-sm text-text-main bg-bg-surface border border-border rounded-lg resize-none
                 focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-ring-focus-ring"
          placeholder="Descripción del producto"
        ></textarea>
      </div>

      <div>
        <label class="field-label block">Género</label>
        <select
          (change)="onGenderChange($event)"
          [value]="formData().gender ?? ''"
          class="w-full px-3 py-2 text-sm text-text-main bg-bg-surface border border-border rounded-lg
                 focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-ring-focus-ring">
          <option value="" disabled>Seleccione</option>
          @for (g of genderOptions; track g.value) {
            <option [value]="g.value">{{ g.label }}</option>
          }
        </select>
      </div>

    </div>

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

  product    = input.required<ProductDetailDto>();
  submitting = input<boolean>(false);

  save  = output<UpdateProductDto>();
  close = output<void>();

  readonly genderOptions = [
    { label: 'Unisex', value: Gender.Unisex },
    { label: 'Hombre', value: Gender.Hombre },
    { label: 'Mujer',  value: Gender.Mujer  },
  ];

  formData = signal<{
    name:        string;
    description: string;
    gender:      Gender | null;
    categoryId:  GUID;
    categoryName: string;
  }>({
    name:         '',
    description: '',
    gender:       null,
    categoryId:   '',
    categoryName: '',
  });

  productForm = form(this.formData, () => {});

  ngOnInit(): void {
    this.categoryService.load();
    const p = this.product();
    this.formData.set({
      name:         p.name,
      description:  p.description ?? '',
      gender:       p.gender ?? null,
      categoryId:   p.categoryId ?? '',
      categoryName: p.categoryName ?? '',
    });
  }

  onGenderChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.formData.update(m => ({ ...m, gender: isNaN(value) ? null : value }));
  }

  onSave(): void {
    const f = this.formData();
    const dto: UpdateProductDto = {};

    if (f.name?.trim())        dto.name        = f.name.trim();
    if (f.description?.trim()) dto.description = f.description.trim();
    if (f.gender != null)      dto.gender      = f.gender;
    if (f.categoryId)          dto.categoryId  = f.categoryId;

    this.save.emit(dto);
  }
}
