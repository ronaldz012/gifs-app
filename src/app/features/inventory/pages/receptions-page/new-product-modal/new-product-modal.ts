import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ProductService } from '@features/inventory/services/product-service';
import { CreateProductVariantDto } from '@features/inventory/dtos/products/create-product-variant-dto';
import { CurrencyPipe } from '@angular/common';
import { NewProductModelForm } from '@features/inventory/models/new-product.model';
import { applyEach, FieldTree, form, FormField, required, validateTree } from '@angular/forms/signals';
import { buildNewVariant, ItemForm, newVariantSchema, VariantForm } from '@features/inventory/models/variant-form.model';
import { BrandSelectCtrl } from "@features/inventory/components/brand-select-crtl/brand-select-crtl.component";
import { CategorySelectCtrl } from "@features/inventory/components/category-select-ctrl/category-select-ctrl.component";
import { Gender } from '@features/inventory/interfaces/gender';
import { ColorSelectCtrl } from '@features/inventory/components/color-select-ctrl/color-select-ctrl.component';

@Component({
  selector: 'app-new-product-modal',
  imports: [FormField, CurrencyPipe, BrandSelectCtrl, CategorySelectCtrl, ColorSelectCtrl],
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
  confirm = output<ItemForm>();

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
      applyEach(s.variants, newVariantSchema);

validateTree(s.variants, ({ value, fieldTree }) => {
  const variants = value() || [];
  const seen = new Map<string, number[]>();

  variants.forEach((v, i) => {
    // Si no hay talla (es null, undefined o ''), ignoramos esta variante por completo
    if (v.size === null || v.size === undefined || v.size === '') {
      return; 
    }

    // Si también quieres asegurar que tenga color para validar duplicados:
    // if (!v.colorId || !v.size) return;

    const key = `${v.colorId ?? ''}__${v.size}`;
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(i);
  });

  const errors: { kind: string; message: string; fieldTree: typeof fieldTree[number] }[] = [];

  for (const [key, indices] of seen.entries()) {
    // Ya no necesitas la validación compleja de strings aquí porque filtramos arriba
    if (indices.length > 1) {
      for (const i of indices) {
        errors.push({
          kind: 'duplicateVariant',
          message: 'La combinación de color y talla ya existe',
          fieldTree: fieldTree[i]
        });
      }
    }
  }

  return errors.length > 0 ? errors : null;
});

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
  this.newProductForm().markAsDirty();
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
      size:        v.size,
      colorId:     v.colorId,
      price:       v.price,
    } as CreateProductVariantDto)),
  }).subscribe({
    next: (created) => {
      const group: ItemForm = {
        product: {
          id:           created.id,
          productName:  created.name,
          internalCode: created.internalCode,
          brandName:    created.brandName,
          categoryName: created.categoryName,
          genderName:   '',
          description:  '',
        },
        variants: created.variants.map((cv, i) => ({
          mode:             'ex' as const,
          id:               cv.productVariantId,
          sku:              cv.sku,
          size:             cv.size,
          colorId:          variants[i].colorId,
          colorCode:        variants[i].colorCode,
          colorName:        cv.colorName,
          price:            variants[i].price,
          quantityReceived: variants[i].quantityReceived,
          unitCost:         variants[i].unitCost,
          description:      '',
          selected:         false,
        } as VariantForm)),
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

applyMassivePrice(value: string) {
  const price = parseFloat(value);
    const cleanPrice = isNaN(price) ? null : price;

    // Actualizamos la señal del modelo de formulario
    this.newProduct.update(current => ({
      ...current,
      variants: current.variants.map(variant => ({
        ...variant,
        price: cleanPrice 
      }))
    }));
  }
applyMassiveCost(value: string): void {
  const price = parseFloat(value);
  const cleanPrice = isNaN(price) ? null : price;

  // Actualizamos la señal del modelo de formulario
  this.newProduct.update(current => ({
    ...current,
    variants: current.variants.map(variant => ({
      ...variant,
      // Actualizamos el precio de venta (price) manteniendo todo lo demás intacto
      unitCost: cleanPrice 
    }))
  }));
}

  onClose(): void { this.close.emit(); }
  onGenderChange(event: Event): void {
  const value = Number((event.target as HTMLSelectElement).value);
  this.newProduct.update(m => ({
    ...m,
    newProduct: { ...m.newProduct, gender: value }
  }));
}

onFocus(event: FocusEvent) {
  const el = event.target as HTMLElement;
  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
}
}