import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product-service';
import { ProductDetailDto, ProductVariantDto } from '../../../dtos/products/product-detail-dto';

import { UpdateProductVariantStockDto } from '../../../dtos/products/update-product-variant-stock-dto';
import { ProductDetailInfo } from './product-detail-info';
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
    ProductDetailInfo,
    ProductDetailVariant,
    UpdateProductModal,
    UpdateVariantModal,
    AdjustStockModal,
    ConfirmActionModal,
    UpdateProductModal,
  ],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-20 text-gray-400 text-sm">
        Cargando...
      </div>
    }

    @if (!loading() && product(); as p) {
      <div class="flex flex-col gap-4">

        <app-product-detail-info
          [product]="p"
          (editProduct)="showUpdateProduct.set(true)"
          (deleteProduct)="showDeleteProduct.set(true)"
        />

        <app-product-detail-variant
          [product]="p"
          (editVariant)="onEditVariant($event)"
          (deleteVariant)="onDeleteVariant($event)"
          (adjustStock)="onAdjustStock($event)"
          (addVariant)="onAddVariant()"
        />

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
      this.loadProduct(Number(idParam));
    }
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.productService.getById(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private get productId(): number {
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
}
