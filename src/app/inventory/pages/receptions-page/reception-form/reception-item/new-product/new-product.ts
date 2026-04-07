import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NewProductFormGroup } from '../../common/item-form-group';
import { Category } from '../../../../../interfaces/Dtos/category-dto';
import { Brand } from '../../../../../interfaces/Dtos/brand-dto';
import { CategoryService } from '../../../../../services/category-service';
import { BrandService } from '../../../../../services/brand-service';
import {CreateCategory} from '../../../../../components/create-category/create-category';
import {CreateBrand} from '../../../../../components/create-brand/create-brand';
import {CreateCategoryDto} from '../../../../../dtos/create-category-dto';
import {CreateBrandDto} from '../../../../../dtos/create-brand-dto';

@Component({
  selector: 'app-new-product',
  imports: [ReactiveFormsModule, CreateCategory, CreateBrand],
  templateUrl: './new-product.html',
  styles: [`:host { display: contents; }`],
})
export default class NewProduct {
  private destroyRef   = inject(DestroyRef);
  private categoryService = inject(CategoryService);
  private brandService    = inject(BrandService);

  form       = input.required<NewProductFormGroup>();
  categories = input.required<Category[]>();
  brands     = input.required<Brand[]>();

  switchMode = output<void>();
  remove     = output<void>();

  // Notifica al padre solo para que actualice sus listas locales
  categoryCreated = output<Category>();
  brandCreatedshowModal    = output<Brand>();

    showModal = signal<'category' | 'brand' | null>(null);

  readonly genderOptions = [
    { label: 'Unisex', value: 0 },
    { label: 'Hombre', value: 1 },
    { label: 'Mujer', value: 2 }
  ];
  private brandCreated: any;

  onBrandChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value === '+ CREAR NUEVA MARCA') {
      this.showModal.set('brand');
      //this.form().patchValue({ brandName: '' });
      return;
    }
    const brand = this.brands().find(b => b.name.toLowerCase() === value.toLowerCase());
    this.form().patchValue({ brandId: brand?.id ?? null });
  }

  onCategoryChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value === '+ CREAR NUEVA CATEGORÍA') {
      console.log('category change:', value); // ← esto aparece?
      this.showModal.set('category');
      console.log(this.showModal());
      //this.form().patchValue({ categoryName: '' });
      return;
    }
    const category = this.categories().find(c => c.name === value);
    if (category) {
      this.form().patchValue({ categoryId: category.id });
    } else {
      this.form().get('categoryName')?.setErrors({ invalid: true });
    }
  }

  onCategoryCreated(newCategory: CreateCategoryDto) {
    this.categoryService.create(newCategory).subscribe({
      next: (newCat) => {
        this.form().patchValue({
          categoryId : newCat.id,
        });
        this.categoryCreated.emit(newCat);
        this.showModal.set(null);
      }
    });
  }

  onBrandCreated(newCategory : CreateBrandDto) {
    this.brandService.create(newCategory).subscribe({
      next: (newBrand) => {
        this.form().patchValue(
          {
            brandId : newBrand.id
          })
        this.brandCreated.emit(newBrand);
        this.showModal.set(null);
      }
    });
  }
}
