import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product-service';
import {
  BranchStockDto,
  ProductDetailDto,
  ProductVariantDto,
} from '../../../dtos/products/product-detail-dto';
import { BranchContextService } from '@core/services/branch-context-service';

import { UpdateProductVariantStockDto } from '../../../dtos/products/update-product-variant-stock-dto';
import { ProductDetailVariant } from './product-detail-variant/product-detail-variant';
import { UpdateVariantModal } from './product-detail-variant/update-variant-modal';
import { AdjustStockModal } from './product-detail-variant/adjust-stock-modal';
import AddVariantModal from './product-detail-variant/add-variant-modal';
import { ConfirmActionModal } from '../../transfer-page/confirm-action-modal/confirm-action-modal';
import { UpdateProductModal } from './update-product-modal';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';
import { UpdateProductDto } from '../../../dtos/products/update-product-dto';
import { UpdateProductVariantDto } from '../../../dtos/products/update-product-variant-dto';
import { CreateProductVariantDto } from '../../../dtos/products/create-product-variant-dto';
import { ToastService } from '@core/services/toast-service';

@Component({
  selector: 'app-product-detail',
  imports: [
    ProductDetailVariant,
    UpdateProductModal,
    UpdateVariantModal,
    AdjustStockModal,
    AddVariantModal,
    ConfirmActionModal,
    RouterLink,
    SkeletonList,
  ],
  template: `
    <div class="max-w-6xl mx-auto fade-up">
      @if (loading()) {
        <app-skeleton-list [rows]="3" [columns]="2" />
      } @else if (!loading() && product(); as p) {
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <a routerLink="/inventory/products" class="btn-icon">
              <span class="material-icons text-base">arrow_back</span>
            </a>
            <h1 class="text-lg font-black text-text-main">Detalle del Producto</h1>
          </div>

          <!-- ── Información del Producto ─────────────────────────────────────── -->
          <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-text-main truncate">{{ p.name }}</p>
                  <span
                    class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold shrink-0"
                    [class]="
                      p.isActive
                        ? 'bg-feedback-success text-feedback-success-text'
                        : 'bg-feedback-warning text-feedback-warning-text'
                    "
                  >
                    {{ p.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <p class="text-xs font-mono text-text-muted mt-0.5">{{ p.internalCode }}</p>
              </div>
              <div class="flex gap-2 shrink-0">
                <button
                  (click)="showToggleStatus.set(true)"
                  class="btn-secondary"
                  [title]="p.isActive ? 'Desactivar producto' : 'Activar producto'"
                >
                  <span class="material-icons text-base leading-none">toggle_on</span>
                  <span class="hidden sm:inline">{{ p.isActive ? 'Desactivar' : 'Activar' }}</span>
                </button>
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
                <p class="field-value">{{ p.totalAvailable }} unidades</p>
              </div>
              @if (p.description) {
                <div class="sm:col-span-2">
                  <p class="field-label">Descripción</p>
                  <p
                    class="text-sm text-text-muted bg-bg-muted rounded-lg px-3 py-2 leading-relaxed"
                  >
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
                Tallas/Colores · {{ p.variants.length }}
                {{ p.variants.length === 1 ? 'talla/color' : 'tallas/colores' }}
              </p>
              <button (click)="onAddVariant()" class="btn-secondary btn-sm">
                <span class="material-icons text-base leading-none">add</span>
                Agregar
              </button>
            </div>

            <!-- ── Desktop ─────────────────────────────────────────────────────── -->
            <div class="hidden sm:block">
              <div
                class="grid gap-2 text-[10px] text-text-soft tracking-wide
                        px-3 py-2 bg-bg-muted rounded-lg mb-1"
                [style.grid-template-columns]="gridColumnsStyle"
              >
                <span>SKU</span>
                <span>TALLA</span>
                <span>COLOR</span>
                <span>PRECIO</span>
                @for (branchId of branchKeys; track branchId) {
                  <span class="truncate">{{ branchMap[branchId] }}</span>
                }
                <span>TOTAL VISIBLE</span>
                <span></span>
              </div>

              <ul class="flex flex-col divide-y divide-border-ui">
                @for (v of p.variants; track v.id) {
                  <app-product-detail-variant
                    [variant]="v"
                    [submitting]="submitting()"
                    [branchMap]="branchMap"
                    [branchKeys]="branchKeys"
                    [gridColumnsStyle]="gridColumnsStyle"
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
                  [branchMap]="branchMap"
                  [branchKeys]="branchKeys"
                  [gridColumnsStyle]="gridColumnsStyle"
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
    </div>

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
        description="Esta acción eliminará el producto y todas sus tallas/colores. No se puede deshacer."
        confirmLabel="Sí, eliminar"
        submittingLabel="Eliminando..."
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        [submitting]="submitting()"
        (confirm)="onDeleteProduct()"
        (close)="showDeleteProduct.set(false)"
      />
    }

    <!-- Cambiar estado (activo/inactivo) -->
    @if (showToggleStatus() && product()) {
      <app-confirm-action-modal
        [title]="product()!.isActive ? '¿Desactivar producto?' : '¿Activar producto?'"
        [description]="
          product()!.isActive
            ? 'El producto dejará de aparecer en búsquedas, recepciones, traspasos y ventas.'
            : 'El producto volverá a estar disponible para búsquedas, recepciones, traspasos y ventas.'
        "
        [confirmLabel]="product()!.isActive ? 'Sí, desactivar' : 'Sí, activar'"
        submittingLabel="Guardando..."
        [submitting]="submitting()"
        (confirm)="onToggleStatus()"
        (close)="showToggleStatus.set(false)"
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
        title="¿Eliminar talla/color?"
        [description]="
          'Se eliminará la talla/color ' + deletingVariant()!.sku + '. No se puede deshacer.'
        "
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

    <!-- Agregar talla/color -->
    @if (showAddVariant() && product()) {
      <app-add-variant-modal
        [existingVariants]="product()!.variants"
        [submitting]="submitting()"
        (save)="onAddVariantSave($event)"
        (close)="showAddVariant.set(false)"
      />
    }
  `,
  styles: `
    @keyframes fade-up {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .fade-up {
      animation: fade-up 240ms ease both;
    }
  `,
})
export default class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private branchContext = inject(BranchContextService);
  private toastService = inject(ToastService);

  branchMap: Record<string, string> = {};
  branchKeys: string[] = [];
  gridColumnsStyle = '';

  // ── Data ────────────────────────────────────────────────────────────────
  product = signal<ProductDetailDto | null>(null);
  loading = signal(true);
  submitting = signal(false);

  // ── Modal visibility ────────────────────────────────────────────────────
  showUpdateProduct = signal(false);
  showDeleteProduct = signal(false);
  showToggleStatus = signal(false);

  /** Variante actualmente en edición — null = modal cerrado */
  editingVariant = signal<ProductVariantDto | null>(null);
  /** Variante pendiente de borrar — null = modal cerrado */
  deletingVariant = signal<ProductVariantDto | null>(null);
  /** Variante cuyo stock se está ajustando — null = modal cerrado */
  adjustingStockVariant = signal<ProductVariantDto | null>(null);
  /** Modal de agregar talla/color abierto o no */
  showAddVariant = signal(false);

  // ── Lifecycle ───────────────────────────────────────────────────────────
  ngOnInit(): void {
    for (const b of this.branchContext.available()) {
      this.branchMap[b.branchId] = b.branchName;
    }
    this.branchKeys = Object.keys(this.branchMap);
    const branchCols = this.branchKeys.map(() => '96px').join(' ');
    this.gridColumnsStyle = `7.5rem 64px 88px 88px ${branchCols} 80px 128px`;

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
    this.submitting.set(true);
    this.productService.canDeleteVariant(v.id).subscribe({
      next: (check) => {
        this.submitting.set(false);
        if (!check.canDelete) {
          this.toastService.error(
            check.reason === 'HAS_MOVEMENTS'
              ? 'Esta variante tiene movimientos de stock asociados y no se puede eliminar.'
              : check.reason === 'HAS_TRANSFER'
                ? 'Esta variante está referenciada en una transferencia y no se puede eliminar.'
                : 'No se puede eliminar esta variante.',
          );
          return;
        }
        this.deletingVariant.set(v);
      },
      error: () => {
        this.submitting.set(false);
        this.toastService.error('No se pudo verificar la variante. Intente de nuevo.');
      },
    });
  }

  onAdjustStock(v: ProductVariantDto): void {
    this.adjustingStockVariant.set(v);
  }

  onAddVariant(): void {
    this.showAddVariant.set(true);
  }

  onAddVariantSave(dto: CreateProductVariantDto): void {
    this.submitting.set(true);
    this.productService.createVariants(this.productId, { variants: [dto] }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showAddVariant.set(false);
        this.toastService.success('Talla/color agregada');
        this.loadProduct(this.productId);
      },
      error: () => {
        this.submitting.set(false);
        this.toastService.error('Error al agregar la talla/color.');
      },
    });
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

  onToggleStatus(): void {
    const p = this.product();
    if (!p) return;
    this.submitting.set(true);
    this.productService.updateStatus(p.id, !p.isActive).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showToggleStatus.set(false);
        this.toastService.success(p.isActive ? 'Producto desactivado' : 'Producto activado');
        this.loadProduct(p.id);
      },
      error: () => {
        this.submitting.set(false);
        this.toastService.error('Error al cambiar el estado del producto.');
      },
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
        this.toastService.success('Talla/color eliminada');
        this.loadProduct(this.productId);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 409) {
          this.toastService.error(
            'Esta variante está asociada a movimientos o transferencias y no se puede eliminar.',
          );
          this.deletingVariant.set(null);
          return;
        }
        this.toastService.error('Error al eliminar la talla/color.');
      },
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
    this.router.navigate(['inventory', 'products', pv.id, 'movements']);
  }
}
