import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ReceptionGroup } from '@features/inventory/models/reception-model';
import { ProductService } from '@features/inventory/services/product-service';
import VariantNewRow from '../reception-form/variant-new-row/variant-new-row';
import { mapCreatedVariantToReceptionVariant } from '../reception-form/common/mapper';
import { CreateProductVariantDto } from '@features/inventory/dtos/products/create-product-variant-dto';
import { CurrencyPipe } from '@angular/common';
import { NewProductModelForm } from '@features/inventory/models/new-product.model';
import { applyEach, form, FormField, required } from '@angular/forms/signals';
import { buildNewVariant, newVariantSchema } from '@features/inventory/models/variant-form.model';
import { Category } from '@features/inventory/dtos/categories/category-dto';
import { Brand } from '@features/inventory/dtos/brands/brand-dto';
import { Color } from '@features/inventory/dtos/Colors/color';
import { BrandSelectCtrl } from "@features/inventory/components/brand-select-crtl/brand-select-crtl";
import { CategorySelectCtrl } from "@features/inventory/components/category-select-ctrl/category-select-ctrl";
import { Gender } from '@features/inventory/interfaces/gender';

@Component({
  selector: 'app-new-product-modal',
  imports: [VariantNewRow, CurrencyPipe, BrandSelectCtrl, CategorySelectCtrl,FormField],
  templateUrl: './new-product-modal.html',
})
export class NewProductModal {

  
    readonly genderOptions = [
      { label: 'UNISEX', value: Gender.Unisex },
      { label: 'HOMBRE', value: Gender.Hombre },
      { label: 'MUJER',  value: Gender.Mujer  },
    ];

  private productService = inject(ProductService);
  close   = output<void>();
  confirm = output<ReceptionGroup>();

  // ── Form ──────────────────────────────────────────────────────────────
  newProduct = signal<NewProductModelForm>({
    newProduct:{  
    name:         '',
    description:  '',
    categoryId:   '',
    categoryName: '',
    brandId:      '',
    brandName:    '',
    gender:       null,
   
  },
   variants:     []
  });

  newProductForm = form(this.newProduct, (s) => {
    required(s.newProduct.name,       { message: 'Requerido' });
    required(s.newProduct.brandId,    { message: 'Requerido' });
    required(s.newProduct.categoryId, { message: 'Requerido' });
    required(s.newProduct.gender,     { message: 'Requerido' });
    applyEach(s.variants,newVariantSchema);
  });

  isConfirming = signal(false);
  error        = signal<string | null>(null);

  // ── Variantes ─────────────────────────────────────────────────────────
  addVariant(): void {
    this.newProduct.update(current => ({
      ...current,
      variants: [...current.variants, buildNewVariant()],
    }));
  }

  removeVariant(index: number): void {
    this.newProduct.update(current => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== index),
    }));
  }
  summary = computed(() => {
  const variants = this.newProduct().variants;
  let units = 0, cost = 0, sales = 0;

  for (const v of variants) {
    const q = v.quantityReceived ?? 0;
    const u = v.unitCost        ?? 0;
    const p = v.price           ?? 0;
    units += q;
    cost  += q * u;
    sales += q * p;
  }

  return { units, cost, sales, margin: sales - cost };
});

  // ── Confirm ───────────────────────────────────────────────────────────
  onConfirm(): void {
    this.newProductForm().markAsTouched();
    if (this.newProductForm().invalid() || !this.newProduct().variants.length) return;

    const val      = this.newProduct();
    const variants = val.variants;

    this.isConfirming.set(true);
    this.error.set(null);

    this.productService.createProductWithVariants({
      name:        val.newProduct.name,
      description: val.newProduct.description,
      categoryId:  val.newProduct.categoryId,
      brandId:     val.newProduct.brandId,
      gender:      val.newProduct.gender ?? 0,
      variants:    variants.map(v => ({
        description: v.description,
        size:        v.size,
        colorId:     v.colorId,
        price:       v.price,
      } as CreateProductVariantDto)),
    }).subscribe({
      next: (created) => {
        const group: ReceptionGroup = {
          productId:    created.id,
          productName:  created.name,
          internalCode: created.internalCode,
          brandName:    created.brandName,
          categoryName: created.categoryName,
          variants:     created.variants.map((cv, i) =>
            mapCreatedVariantToReceptionVariant(cv, variants[i])
          ),
        };
        this.isConfirming.set(false);
        this.confirm.emit(group);
        this.close.emit();
      },
      error: (err) => {
        this.isConfirming.set(false);
        this.error.set('Error al crear el producto. Intentá de nuevo.');
        console.error(err);
      }
    });
  }

  onClose(): void { this.close.emit(); }
  onGenderChange(event: Event): void {
  const value = Number((event.target as HTMLSelectElement).value);
  this.newProduct.update(m => ({
    ...m,
    newProduct: { ...m.newProduct, gender: value }
  }));
}
}