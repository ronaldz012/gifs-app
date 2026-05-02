import { Component, input, output} from '@angular/core';
import { ProductDetailDto } from '../../../dtos/products/product-detail-dto';
import { CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-product-detail-info',
  imports: [CurrencyPipe],
  template: `
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

      <!-- Header de la card: nombre + acciones -->
      <div class="flex items-start justify-between gap-3 mb-4">
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">{{ product().name }}</p>
          <p class="text-xs font-mono text-gray-400 mt-0.5">{{ product().internalCode }}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button
            (click)="editProduct.emit(product().id)"
            class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm border border-gray-200   // {
                //   path: ':id/stock',
                //   loadComponent: () => import('./inventory/pages/products-page/product-stock/product-stock')
                // },
                // {
                //   path: ':id/movements',
                //   loadComponent: () => import('./inventory/pages/products-page/product-movements/product-movements')
                // },
               rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
            title="Editar"
          >
            <span class="material-icons text-base leading-none">edit</span>
            <span class="hidden sm:inline">Editar</span>
          </button>
          <button
            (click)="deleteProduct.emit(product().id)"
            class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm border border-red-200
               rounded-lg hover:bg-red-50 transition-colors text-red-500"
            title="Eliminar"
          >
            <span class="material-icons text-base leading-none">delete</span>
            <span class="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>

      <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
        Información general
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">

        <div>
          <p class="text-[11px] text-gray-400 mb-0.5">Categoría</p>
          <p class="text-sm font-medium text-gray-800">{{ product().categoryName || '—' }}</p>
        </div>

        <div>
          <p class="text-[11px] text-gray-400 mb-0.5">Marca</p>
          <p class="text-sm font-medium text-gray-800">{{ product().brandName || '—' }}</p>
        </div>

        <div>
          <p class="text-[11px] text-gray-400 mb-0.5">Género</p>
          <p class="text-sm font-medium text-gray-800">{{ product().gender || '—' }}</p>
        </div>

        <div>
          <p class="text-[11px] text-gray-400 mb-0.5">Precio base</p>
          <p class="text-sm font-medium text-gray-800">
            {{ product().basePrice | currency:'BOB':'symbol':'1.2-2' }}
          </p>
        </div>

        <div>
          <p class="text-[11px] text-gray-400 mb-0.5">Stock total</p>
          <p class="text-sm font-medium text-gray-800">{{ product().totalStock }} unidades</p>
        </div>

        @if (product().description) {
          <div class="sm:col-span-2">
            <p class="text-[11px] text-gray-400 mb-0.5">Descripción</p>
            <p class="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
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

  editProduct   = output<number>();
  deleteProduct = output<number>();

}
