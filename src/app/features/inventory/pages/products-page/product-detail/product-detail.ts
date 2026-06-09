import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product-service';
import { ProductDetailDto, ProductVariantDto } from '../../../dtos/products/product-detail-dto';

import { UpdateProductVariantStockDto } from '../../../dtos/products/update-product-variant-stock-dto';
import {ProductDetailVariant} from './product-detail-variant/product-detail-variant';
import {UpdateVariantModal} from './product-detail-variant/update-variant-modal';
import {AdjustStockModal} from './product-detail-variant/adjust-stock-modal';
import {ConfirmActionModal} from '../../transfer-page/confirm-action-modal/confirm-action-modal';
import {UpdateProductModal} from './update-product-modal';
import {UpdateProductDto} from '../../../dtos/products/update-product-dto';
import {UpdateProductVariantDto} from '../../../dtos/products/update-product-variant-dto';


@Component({
  selector: 'app-product-detail',
  imports: [
    ProductDetailVariant,
    UpdateProductModal,
    UpdateVariantModal,
    AdjustStockModal,
    ConfirmActionModal,
  ],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-20 text-gray-400 text-sm">
        Cargando...
      </div>
    }

    @if (!loading() && product(); as p) {
      <div class="flex flex-col gap-4">

        <!-- ── Información del Producto ─────────────────────────────────────── -->
        <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-text-main truncate">{{ p.name }}</p>
              <p class="text-xs font-mono text-text-muted mt-0.5">{{ p.internalCode }}</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button (click)="showUpdateProduct.set(true)" class="btn-primary" title="Editar">
                <span class="material-icons text-base leading-none">edit</span>
                <span class="hidden sm:inline">Editar</span>
              </button>
              <button (click)="showDeleteProduct.set(true)" class="btn-danger" title="Eliminar">
                <span class="material-icons text-base leading-none">delete</span>
                <span class="hidden sm:inline">Eliminar</span>
              </button>
            </div>
          </div>

          <p class="section-title">Información general</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p class="field-label">Categoría</p>
              <p class="field-value">{{ p.categoryName || '—' }}</p>
            </div>
            <div>
              <p class="field-label">Marca</p>
              <p class="field-value">{{ p.brandName || '—' }}</p>
            </div>
            <div>
              <p class="field-label">Género</p>
              <p class="field-value">{{ p.gender || '—' }}</p>
            </div>
            <div>
              <p class="field-label">Stock total</p>
              <p class="field-value">{{ p.totalStock }} unidades</p>
            </div>
            @if (p.description) {
              <div class="sm:col-span-2">
                <p class="field-label">Descripción</p>
                <p class="text-sm text-text-muted bg-bg-muted rounded-lg px-3 py-2 leading-relaxed">
                  {{ p.description }}
                </p>
              </div>
            }
          </div>
        </div>

        <!-- ── Variantes ────────────────────────────────────────────────────── -->
        <div class="bg-bg-surface rounded-xl border border-border-strong shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <p class="section-title mb-0">
              Variantes · {{ p.variants.length }}
              {{ p.variants.length === 1 ? 'variante' : 'variantes' }}
            </p>
            <button (click)="onAddVariant()" class="btn-secondary btn-sm">
              <span class="material-icons text-base leading-none">add</span>
              Agregar
            </button>
          </div>

          <!-- ── Desktop ─────────────────────────────────────────────────────── -->
          <div class="hidden sm:block">
            <div class="grid grid-cols-[1fr_64px_88px_88px_72px_128px] gap-2
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
              @for (v of p.variants; track v.id) {
                <app-product-detail-variant
                  [variant]="v"
                  [submitting]="submitting()"
                  (editVariant)="onEditVariant($event)"
                  (deleteVariant)="onDeleteVariant($event)"
                  (adjustStock)="onAdjustStock($event)"
                  (viewHistory)="onViewHistory($event)"
                />
              }
            </ul>
          </div>

          <!-- ── Mobile ──────────────────────────────────────────────────────── -->
          <ul class="flex flex-col divide-y divide-border-ui sm:hidden">
            @for (v of p.variants; track v.id) {
              <app-product-detail-variant
                [variant]="v"
                [submitting]="submitting()"
                (editVariant)="onEditVariant($event)"
                (deleteVariant)="onDeleteVariant($event)"
                (adjustStock)="onAdjustStock($event)"
                (viewHistory)="onViewHistory($event)"
              />
            }
          </ul>
        </div>

      </div>
    }

    <!-- ── Modales ─────────────────────────────────────────────────────────── -->

    <!-- Editar producto -->
    @if (showUpdateProduct() && product()) {
      <app-update-product-modal
        [product]="product()!"
        [submitting]="submitting()"
        (save)="onUpdateProduct($event)"
        (close)="showUpdateProduct.set(false)"
      />
    }

    <!-- Eliminar producto -->
    @if (showDeleteProduct()) {
      <app-confirm-action-modal
        title="¿Eliminar producto?"
        description="Esta acción eliminará el producto y todas sus variantes. No se puede deshacer."
        confirmLabel="Sí, eliminar"
        submittingLabel="Eliminando..."
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        [submitting]="submitting()"
        (confirm)="onDeleteProduct()"
        (close)="showDeleteProduct.set(false)"
      />
    }

    <!-- Editar variante -->
    @if (editingVariant()) {
      <app-update-variant-modal
        [variant]="editingVariant()!"
        [submitting]="submitting()"
        (save)="onUpdateVariant($event)"
        (close)="editingVariant.set(null)"
      />
    }

    <!-- Eliminar variante -->
    @if (deletingVariant()) {
      <app-confirm-action-modal
        title="¿Eliminar variante?"
        [description]="'Se eliminará la variante ' + deletingVariant()!.sku + '. No se puede deshacer.'"
        confirmLabel="Sí, eliminar"
        submittingLabel="Eliminando..."
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        [submitting]="submitting()"
        (confirm)="DeleteVariant()"
        (close)="deletingVariant.set(null)"
      />
    }

    <!-- Ajustar stock -->
    @if (adjustingStockVariant()) {
      <app-adjust-stock-modal
        [variant]="adjustingStockVariant()!"
        [submitting]="submitting()"
        (save)="onSaveStockAdjust($event)"
        (close)="adjustingStockVariant.set(null)"
      />
    }
  `,
  styles: ``,
})
export default class ProductDetail implements OnInit {

  private route          = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  // ── Data ────────────────────────────────────────────────────────────────
  product   = signal<ProductDetailDto | null>(null);
  loading   = signal(true);
  submitting = signal(false);

  // ── Modal visibility ────────────────────────────────────────────────────
  showUpdateProduct = signal(false);
  showDeleteProduct = signal(false);

  /** Variante actualmente en edición — null = modal cerrado */
  editingVariant        = signal<ProductVariantDto | null>(null);
  /** Variante pendiente de borrar — null = modal cerrado */
  deletingVariant       = signal<ProductVariantDto | null>(null);
  /** Variante cuyo stock se está ajustando — null = modal cerrado */
  adjustingStockVariant = signal<ProductVariantDto | null>(null);

  // ── Lifecycle ───────────────────────────────────────────────────────────
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadProduct(idParam);
    }
  }

  private loadProduct(id: GUID): void {
    this.loading.set(true);
    this.productService.getById(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private get productId(): GUID {
    return this.product()!.id;
  }

  // ── Child output handlers ───────────────────────────────────────────────
  onEditVariant(v: ProductVariantDto): void {
    this.editingVariant.set(v);
  }

  onDeleteVariant(v: ProductVariantDto): void {
    this.deletingVariant.set(v);
  }

  onAdjustStock(v: ProductVariantDto): void {
    this.adjustingStockVariant.set(v);
  }

  onAddVariant(): void {
    // TODO: open add-variant modal when implemented
  }

  // ── API calls ────────────────────────────────────────────────────────────
  onUpdateProduct(dto: UpdateProductDto): void {
    this.submitting.set(true);
    this.productService.update(this.productId, dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showUpdateProduct.set(false);
        this.loadProduct(this.productId);
      },
      error: () => this.submitting.set(false),
    });
  }

  onDeleteProduct(): void {
    this.submitting.set(true);
    this.productService.delete(this.productId).subscribe({
      next: () => {
        this.submitting.set(false);
        // TODO: navigate back to product list after deletion
      },
      error: () => this.submitting.set(false),
    });
  }

  onUpdateVariant(dto: UpdateProductVariantDto): void {
    const variantId = this.editingVariant()!.id;
    this.submitting.set(true);
    this.productService.updateVariant(this.productId, variantId, dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.editingVariant.set(null);
        this.loadProduct(this.productId);
      },
      error: () => this.submitting.set(false),
    });
  }

  DeleteVariant(): void {
    const variantId = this.deletingVariant()!.id;
    this.submitting.set(true);
    this.productService.deleteVariant(this.productId, variantId).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deletingVariant.set(null);
        this.loadProduct(this.productId);
      },
      error: () => this.submitting.set(false),
    });
  }

  onSaveStockAdjust(dto: UpdateProductVariantStockDto): void {
    const variantId = this.adjustingStockVariant()!.id;
    this.submitting.set(true);
    this.productService.adjustVariantStock(this.productId, variantId, dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.adjustingStockVariant.set(null);
        this.loadProduct(this.productId);
      },
      error: () => this.submitting.set(false),
    });
  }

  onViewHistory(pv: ProductVariantDto) {
    this.router.navigate(['inventory','products', pv.id, 'movements']);
  }
}
