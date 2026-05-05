import { Component, input, output} from '@angular/core';
import {ProductDetailDto, ProductVariantDto} from '../../../../dtos/products/product-detail-dto';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-product-detail-variant',
  imports: [CurrencyPipe],
  template: `
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

      <!-- Subheader -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Variantes · {{ product().variants.length }}
          {{ product().variants.length === 1 ? 'variante' : 'variantes' }}
        </p>
        <button
          (click)="addVariant.emit()"
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200
             rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
        >
          <span class="material-icons text-base leading-none">add</span>
          Agregar
        </button>
      </div>

      <!-- ── Desktop: tabla ──────────────────────────────────────────────────── -->
      <div class="hidden sm:block">
        <!-- grid: SKU | TALLA | COLOR | PRECIO | STOCK | ACCIONES -->
        <div class="grid grid-cols-[1fr_64px_88px_88px_72px_96px] gap-2
                text-[10px] text-gray-400 tracking-wide
                px-3 py-2 bg-gray-50 rounded-lg mb-1">
          <span>SKU</span>
          <span>TALLA</span>
          <span>COLOR</span>
          <span>PRECIO</span>
          <span>STOCK</span>
          <span></span>
        </div>

        <ul class="flex flex-col divide-y divide-gray-50">
          @for (v of product().variants; track v.id) {
            <li class="grid grid-cols-[1fr_64px_88px_88px_72px_96px] gap-2 items-center
                   px-3 py-3 hover:bg-gray-50/60 transition-colors text-sm">
              <span class="font-mono text-xs text-gray-500 truncate">{{ v.sku }}</span>
              <span class="text-gray-700">{{ v.size }}</span>
              <span class="text-gray-700">{{ v.color }}</span>
              <span class="text-gray-800">{{ v.price | currency:'BOB':'symbol':'1.2-2' }}</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                       bg-green-50 text-green-700 w-fit tabular-nums">
                {{ v.stock }} u
              </span>
              <div class="flex gap-1 justify-end">
                <button
                  (click)="adjustStock.emit(v)"
                  class="w-7 h-7 rounded-lg flex items-center justify-center
                     text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  title="Ajustar stock"
                ><span class="material-icons text-base">inventory</span></button>
                <button
                  (click)="editVariant.emit(v)"
                  class="w-7 h-7 rounded-lg flex items-center justify-center
                     text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Editar variante"
                ><span class="material-icons text-base">edit</span></button>
                <button
                  (click)="deleteVariant.emit(v)"
                  class="w-7 h-7 rounded-lg flex items-center justify-center
                     text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Eliminar variante"
                ><span class="material-icons text-base">delete</span></button>
              </div>
            </li>
          }
        </ul>
      </div>

      <!-- ── Mobile: lista compacta ──────────────────────────────────────────── -->
      <ul class="flex flex-col divide-y divide-gray-100 sm:hidden">
        @for (v of product().variants; track v.id) {
          <li class="flex items-center gap-3 py-3">
            <div class="flex-1 min-w-0">
              <p class="font-mono text-xs text-gray-400 truncate mb-0.5">{{ v.sku }}</p>
              <p class="text-sm font-medium text-gray-800">{{ v.size }} · {{ v.color }}</p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ v.price | currency:'BOB':'symbol':'1.2-2' }}
                · <span class="font-medium text-green-600">{{ v.stock }} u</span>
              </p>
            </div>
            <div class="flex gap-1 shrink-0">
              <button
                (click)="adjustStock.emit(v)"
                class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center
                   text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-colors"
                title="Ajustar stock"
              ><span class="material-icons text-base">inventory</span></button>
              <button
                (click)="editVariant.emit(v)"
                class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center
                   text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
                title="Editar variante"
              ><span class="material-icons text-base">edit</span></button>
              <button
                (click)="deleteVariant.emit(v)"
                class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center
                   text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                title="Eliminar variante"
              ><span class="material-icons text-base">delete</span></button>
            </div>
          </li>
        }
      </ul>

    </div>
  `,
})
export class ProductDetailVariant {
  product = input.required<ProductDetailDto>();

  addVariant   = output<void>();
  editVariant  = output<ProductVariantDto>();
  deleteVariant = output<ProductVariantDto>();
  adjustStock  = output<ProductVariantDto>();
}
