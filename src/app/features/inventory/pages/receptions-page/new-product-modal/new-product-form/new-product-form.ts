import { Component, input, inject } from "@angular/core";
import { FormField, FieldTree } from "@angular/forms/signals";
import { BrandSelectCtrl } from "@features/inventory/components/brand-select-crtl/brand-select-crtl";
import { CategorySelectCtrl } from "@features/inventory/components/category-select-ctrl/category-select-ctrl";
import { Brand } from "@features/inventory/dtos/brands/brand-dto";
import { Category } from "@features/inventory/dtos/categories/category-dto";
import { Gender } from "@features/inventory/interfaces/gender";
import { newProductDataModel, NewProductModelForm } from "@features/inventory/models/new-product.model";
import { BrandService } from "@features/inventory/services/brand-service";
import { CategoryService } from "@features/inventory/services/category-service";

@Component({
  selector: 'app-new-product-form',
  imports: [FormField, CategorySelectCtrl, BrandSelectCtrl],
  templateUrl: './new-product-form.html',
})
export class NewProductForm {
  form          = input.required<FieldTree<newProductDataModel>>();
  categoryStore = inject(CategoryService);
  brandStore    = inject(BrandService);

  readonly genderOptions = [
    { label: 'UNISEX', value: Gender.Unisex },
    { label: 'HOMBRE', value: Gender.Hombre },
    { label: 'MUJER',  value: Gender.Mujer  },
  ];

  constructor() {
    this.categoryStore.load();
    this.brandStore.load();
  }

  handleCreatedCategory(category: Category): void {
    this.categoryStore.add(category);
    this.form().categoryId().value.set(category.id);
    this.form().categoryName().value.set(category.name);
  }

  handleCreatedBrand(brand: Brand): void {
    this.brandStore.add(brand);
    this.form().brandId().value.set(brand.id);
    this.form().brandName().value.set(brand.name);
  }
}