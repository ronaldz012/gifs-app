import { Component, input, output } from '@angular/core';
import { ProductVariantDto } from '../../../../dtos/products/product-detail-dto';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-detail-variant',
  imports: [CurrencyPipe],
  template: `
    <!-- ── Desktop Row ──────────────────────────────────────────────────────── -->
    <li class="hidden sm:grid grid-cols-[1fr_64px_88px_88px_72px_128px] gap-2 items-center
               px-3 py-3 hover:bg-bg-muted/60 transition-colors text-sm">
      <span class="font-mono text-xs text-text-muted truncate">{{ variant().sku }}</span>
      <span class="field-value">{{ variant().size }}</span>
      <span class="field-value">{{ variant().color }}</span>
      <span class="field-value">{{ variant().price | currency:'BOB':'symbol':'1.2-2' }}</span>
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                   bg-feedback-success text-feedback-success-text w-fit tabular-nums">
        {{ variant().stock }} u
      </span>
      <div class="flex gap-1 justify-end">
        <button (click)="viewHistory.emit(variant())" class="btn-icon
          hover:text-text-main hover:bg-bg-muted" title="Ver movimientos">
          <span class="material-icons text-base">history</span>
        </button>
        <button (click)="adjustStock.emit(variant())" class="btn-icon
          hover:text-accent-ui hover:bg-feedback-info" title="Ajustar stock">
          <span class="material-icons text-base">inventory</span>
        </button>
        <button (click)="editVariant.emit(variant())" class="btn-icon
          hover:text-text-main hover:bg-bg-muted" title="Editar variante">
          <span class="material-icons text-base">edit</span>
        </button>
        <button (click)="deleteVariant.emit(variant())" class="btn-icon
          hover:text-feedback-error-text hover:bg-feedback-error" title="Eliminar variante">
          <span class="material-icons text-base">delete</span>
        </button>
      </div>
    </li>

    <!-- ── Mobile Card ──────────────────────────────────────────────────────── -->
    <li class="flex sm:hidden items-center gap-3 py-3">
      <div class="flex-1 min-w-0">
        <p class="font-mono text-xs text-text-soft truncate mb-0.5">{{ variant().sku }}</p>
        <p class="text-sm font-medium text-text-main">{{ variant().size }} · {{ variant().color }}</p>
        <p class="text-xs text-text-muted mt-0.5">
          {{ variant().price | currency:'BOB':'symbol':'1.2-2' }}
          · <span class="font-medium text-feedback-success-text">{{ variant().stock }} u</span>
        </p>
      </div>
      <div class="flex gap-1 shrink-0">
        <button (click)="viewHistory.emit(variant())" class="btn-icon-md
          hover:text-text-main hover:border-border-strong" title="Ver movimientos">
          <span class="material-icons text-base">history</span>
        </button>
        <button (click)="adjustStock.emit(variant())" class="btn-icon-md
          hover:text-accent-ui hover:border-feedback-info" title="Ajustar stock">
          <span class="material-icons text-base">inventory</span>
        </button>
        <button (click)="editVariant.emit(variant())" class="btn-icon-md
          hover:text-text-main hover:border-border-strong" title="Editar variante">
          <span class="material-icons text-base">edit</span>
        </button>
        <button (click)="deleteVariant.emit(variant())" class="btn-icon-md
          hover:text-feedback-error-text hover:border-feedback-error-text" title="Eliminar variante">
          <span class="material-icons text-base">delete</span>
        </button>
      </div>
    </li>
  `,
})
export class ProductDetailVariant {
  variant = input.required<ProductVariantDto>();
  submitting = input.required<boolean>();

  editVariant   = output<ProductVariantDto>();
  deleteVariant = output<ProductVariantDto>();
  adjustStock   = output<ProductVariantDto>();
  viewHistory   = output<ProductVariantDto>();
}