import { Component, signal, OnInit, inject } from '@angular/core';
import { applyEach, applyWhen, form, FormField } from '@angular/forms/signals';
import { ProductVariantOption } from '@features/inventory/components/product-search/product-search-result.component';
import { VariantForm, newVariantSchema, existingVariantSchema,buildExistingVariant, buildNewVariant } from '@features/inventory/models/variant-form.model';
import { Color } from '@features/inventory/dtos/colors/color';
import { NewProductModal } from '@features/inventory/pages/receptions-page/new-product-modal/new-product-modal';
import { BrandService } from '@features/inventory/services/brand-service';
import { CategoryService } from '@features/inventory/services/category-service';
import { ColorService } from '@features/inventory/services/color-service';
import { ProductService } from '@features/inventory/services/product-service';

interface Test {
  name: string | null;
  description: string | null;
  variants: VariantForm[];

}
@Component({
  selector: 'app-dev.component',
  imports: [NewProductModal],
  templateUrl: './dev.component.html',
  styleUrl: './dev.component.css',
})
export default class DevComponent implements OnInit {

brandService = inject(BrandService);
categoryService = inject(CategoryService);
colorService = inject(ColorService);
productService = inject(ProductService);



testModel = signal<Test>({
  name:        null,
  description: null,
  variants:    [buildExistingVariant(),buildNewVariant()],
});

testForm = form(this.testModel, (s) => {
  applyEach(s.variants, (item) => {
    applyWhen(
      item,
      ({ valueOf }) => valueOf(item.mode) === 'ex',
      existingVariantSchema
    );
    applyWhen(
      item,
      ({ valueOf }) => valueOf(item.mode) === 'new',
      newVariantSchema
    );
  });
});

ngOnInit(): void {
  this.brandService.load();
  this.categoryService.load();
  this.colorService.load(); 
}



onCloseModal() {
  console.log('Modal closed');
}

onConfirmModal(event: any) {
  console.log('Modal confirmed', event);
}
}
