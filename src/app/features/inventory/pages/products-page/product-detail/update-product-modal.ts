import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductDetailDto } from '../../../dtos/products/product-detail-dto';
import { CategoryService } from '../../../services/category-service';
import BrandService from '../../../services/brand-service';
import {UpdateProductDto} from '../../../dtos/products/update-product-dto';
import {Gender} from '../../../interfaces/gender';
import { SearchableSelect, SelectOption } from '@shared/components/searchable-select';



const GENDER_LABELS: Record<number, string> = {
  [Gender.Unixes]: 'Unisex',
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
      class="fixed inset-0 bg-black/30 z-40 flex items-end sm:items-center justify-center
             backdrop-blur-[2px]"
      (click)="close.emit()"
    >
      <!-- Sheet / Dialog -->
      <div
        class="modal-enter w-full sm:w-[480px] bg-white
               rounded-t-2xl sm:rounded-2xl shadow-xl z-50
               px-5 pt-5 pb-7 sm:pb-5 max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <!-- Handle (mobile) -->
        <div class="sm:hidden w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5"></div>

        <p class="text-sm font-semibold text-gray-800 mb-1">Editar producto</p>
        <p class="text-xs text-gray-400 mb-5">
          Solo se actualizarán los campos que modifiques.
        </p>

        <div class="flex flex-col gap-4">

          <!-- Nombre -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Nombre</label>
            <input
              type="text"
              [(ngModel)]="form.name"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              placeholder="Nombre del producto"
            />
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea
              [(ngModel)]="form.description"
              rows="3"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none
                     focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              placeholder="Descripción del producto"
            ></textarea>
          </div>

          <!-- Precio base -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Precio base</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">BOB</span>
              <input
                type="number"
                [(ngModel)]="form.basePrice"
                min="0.01"
                step="0.01"
                class="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                       focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- Género -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Género</label>
            <select
              [(ngModel)]="form.gender"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                     focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              <option [ngValue]="null">Sin especificar</option>
              <option [ngValue]="Gender.Unixes">Unisex</option>
              <option [ngValue]="Gender.Hombre">Hombre</option>
              <option [ngValue]="Gender.Mujer">Mujer</option>
            </select>
          </div>

          <!-- Categoría -->
          <app-searchable-select
            label="Categoría"
            placeholder="Seleccionar categoría..."
            [options]="categories()"
            [selectedId]="form.categoryId"
            (selected)="form.categoryId = $event"
          />

          <!-- Marca -->
          <app-searchable-select
            label="Marca"
            placeholder="Seleccionar marca..."
            [options]="brands()"
            [selectedId]="form.brandId"
            (selected)="form.brandId = $event"
          />

        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            (click)="close.emit()"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500
                   text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            (click)="onSave()"
            [disabled]="submitting()"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white
                   text-sm font-medium hover:bg-blue-700 transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
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
  private brandService    = inject(BrandService);

  product    = input.required<ProductDetailDto>();
  submitting = input<boolean>(false);

  save  = output<UpdateProductDto>();
  close = output<void>();

  categories = signal<SelectOption[]>([]);
  brands     = signal<SelectOption[]>([]);

  form: {
    name:        string;
    description: string;
    basePrice:   number | null;
    gender:      Gender | null;
    categoryId:  GUID | null;
    brandId:     GUID | null;
  } = {
    name:        '',
    description: '',
    basePrice:   null,
    gender:      null,
    categoryId:  null,
    brandId:     null,
  };

  ngOnInit(): void {
    const p = this.product();

    this.form.name        = p.name;
    this.form.description = p.description ?? '';
    this.form.basePrice   = p.basePrice;
    this.form.gender      = p.gender ?? null;   // ya viene como número del enum
    this.form.categoryId  = p.categoryId ?? null;
    this.form.brandId     = p.brandId ?? null;

    this.categoryService.getAll().subscribe(list => this.categories.set(list));
    this.brandService.getAll().subscribe(list => this.brands.set(list));
  }

  onSave(): void {
    const dto: UpdateProductDto = {};

    if (this.form.name?.trim())        dto.name        = this.form.name.trim();
    if (this.form.description?.trim()) dto.description = this.form.description.trim();
    if (this.form.basePrice != null)   dto.basePrice   = this.form.basePrice;
    if (this.form.gender != null)      dto.gender      = this.form.gender;
    if (this.form.categoryId != null)  dto.categoryId  = this.form.categoryId;
    if (this.form.brandId != null)     dto.brandId     = this.form.brandId;

    this.save.emit(dto);
  }
}
