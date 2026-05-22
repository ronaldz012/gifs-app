import { Component, input, output} from '@angular/core';
import { ProductDetailDto } from '../../../dtos/products/product-detail-dto';
import { CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-product-detail-info',
  imports: [CurrencyPipe],
  template: `
<div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
  <div class="flex items-start justify-between gap-3 mb-4">
    <div class="min-w-0">
      <p class="text-sm font-semibold text-text-main truncate">{{ product().name }}</p>
      <p class="text-xs font-mono text-text-muted mt-0.5">{{ product().internalCode }}</p>
    </div>
    <div class="flex gap-2 shrink-0">
      <button (click)="editProduct.emit(product().id)" class="btn-primary" title="Editar">
        <span class="material-icons text-base leading-none">edit</span>
        <span class="hidden sm:inline">Editar</span>
      </button>
      <button (click)="deleteProduct.emit(product().id)" class="btn-danger" title="Eliminar">
        <span class="material-icons text-base leading-none">delete</span>
        <span class="hidden sm:inline">Eliminar</span>
      </button>
    </div>
  </div>

  <p class="section-title">Información general</p>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
    <div>
      <p class="field-label">Categoría</p>
      <p class="field-value">{{ product().categoryName || '—' }}</p>
    </div>
    <div>
      <p class="field-label">Marca</p>
      <p class="field-value">{{ product().brandName || '—' }}</p>
    </div>
    <div>
      <p class="field-label">Género</p>
      <p class="field-value">{{ product().gender || '—' }}</p>
    </div>
    <div>
      <p class="field-label">Precio base</p>
      <p class="field-value">{{ product().basePrice | currency:'BOB':'symbol':'1.2-2' }}</p>
    </div>
    <div>
      <p class="field-label">Stock total</p>
      <p class="field-value">{{ product().totalStock }} unidades</p>
    </div>
    @if (product().description) {
      <div class="sm:col-span-2">
        <p class="field-label">Descripción</p>
        <p class="text-sm text-text-muted bg-bg-muted rounded-lg px-3 py-2 leading-relaxed">
          {{ product().description }}
        </p>
      </div>
    }
  </div>
</div>
`,
  styles: ``,
})
export class ProductDetailInfo {
  product = input.required<ProductDetailDto>();

  editProduct   = output<GUID>();
  deleteProduct = output<GUID>();

}
