import { Component, input, output} from '@angular/core';
import {ProductDetailDto, ProductVariantDto} from '../../../../dtos/products/product-detail-dto';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-product-detail-variant',
  imports: [CurrencyPipe],
  template: `
    <div class="bg-bg-surface rounded-xl border border-border-strong shadow-sm p-5">

  <!-- Subheader -->
  <div class="flex items-center justify-between mb-4">
    <p class="section-title mb-0">
      Variantes · {{ product().variants.length }}
      {{ product().variants.length === 1 ? 'variante' : 'variantes' }}
    </p>
    <button (click)="addVariant.emit()" class="btn-secondary btn-sm">
      <span class="material-icons text-base leading-none">add</span>
      Agregar
    </button>
  </div>

  <!-- ── Desktop ─────────────────────────────────────────────────────────── -->
  <div class="hidden sm:block">
    <div class="grid grid-cols-[1fr_64px_88px_88px_72px_96px] gap-2
                text-[10px] text-text-soft tracking-wide
                px-3 py-2 bg-bg-muted rounded-lg mb-1">
      <span>SKU</span>
      <span>TALLA</span>
      <span>COLOR</span>
      <span>PRECIO</span>
      <span>STOCK</span>
      <span></span>
    </div>

    <ul class="flex flex-col divide-y divide-border-ui">
      @for (v of product().variants; track v.id) {
        <li class="grid grid-cols-[1fr_64px_88px_88px_72px_96px] gap-2 items-center
                   px-3 py-3 hover:bg-bg-muted/60 transition-colors text-sm">
          <span class="font-mono text-xs text-text-muted truncate">{{ v.sku }}</span>
          <span class="field-value">{{ v.size }}</span>
          <span class="field-value">{{ v.color }}</span>
          <span class="field-value">{{ v.price | currency:'BOB':'symbol':'1.2-2' }}</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                       bg-feedback-success text-feedback-success-text w-fit tabular-nums">
            {{ v.stock }} u
          </span>
          <div class="flex gap-1 justify-end">
            <button (click)="adjustStock.emit(v)" class="btn-icon
              hover:text-accent-ui hover:bg-feedback-info" title="Ajustar stock">
              <span class="material-icons text-base">inventory</span>
            </button>
            <button (click)="editVariant.emit(v)" class="btn-icon
              hover:text-text-main hover:bg-bg-muted" title="Editar variante">
              <span class="material-icons text-base">edit</span>
            </button>
            <button (click)="deleteVariant.emit(v)" class="btn-icon
              hover:text-feedback-error-text hover:bg-feedback-error" title="Eliminar variante">
              <span class="material-icons text-base">delete</span>
            </button>
          </div>
        </li>
      }
    </ul>
  </div>

  <!-- ── Mobile ──────────────────────────────────────────────────────────── -->
  <ul class="flex flex-col divide-y divide-border-ui sm:hidden">
    @for (v of product().variants; track v.id) {
      <li class="flex items-center gap-3 py-3">
        <div class="flex-1 min-w-0">
          <p class="font-mono text-xs text-text-soft truncate mb-0.5">{{ v.sku }}</p>
          <p class="text-sm font-medium text-text-main">{{ v.size }} · {{ v.color }}</p>
          <p class="text-xs text-text-muted mt-0.5">
            {{ v.price | currency:'BOB':'symbol':'1.2-2' }}
            · <span class="font-medium text-feedback-success-text">{{ v.stock }} u</span>
          </p>
        </div>
        <div class="flex gap-1 shrink-0">
          <button (click)="adjustStock.emit(v)" class="btn-icon-md
            hover:text-accent-ui hover:border-feedback-info" title="Ajustar stock">
            <span class="material-icons text-base">inventory</span>
          </button>
          <button (click)="editVariant.emit(v)" class="btn-icon-md
            hover:text-text-main hover:border-border-strong" title="Editar variante">
            <span class="material-icons text-base">edit</span>
          </button>
          <button (click)="deleteVariant.emit(v)" class="btn-icon-md
            hover:text-feedback-error-text hover:border-feedback-error-text" title="Eliminar variante">
            <span class="material-icons text-base">delete</span>
          </button>
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
