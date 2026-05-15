import { Component, input, OnInit} from '@angular/core';
import {Brand} from '../../../../dtos/brands/brand-dto';
import {Category} from '../../../../dtos/categories/category-dto';
import {NewProductFormGroup} from '../../reception-form/common/item-form-group';
import {Gender} from '../../../../interfaces/gender';
import {AbstractControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { CategorySelectCtrl } from '@features/inventory/components/category-select-ctrl/category-select-ctrl';
import { BrandSelectCtrl } from '@features/inventory/components/brand-select-crtl/brand-select-crtl';

@Component({
  selector: 'app-new-product-form',
  imports: [
    ReactiveFormsModule,
    
    CategorySelectCtrl,
    BrandSelectCtrl
  ],
  templateUrl: './new-product-form.html',
  styles: ``,
})
export class NewProductForm {

  form       = input.required<NewProductFormGroup>();
  categories = input<Category[]>([]);
  brands     = input<Brand[]>([]);

  readonly genderOptions = [
    { label: 'UNISEX', value: Gender.Unixes },
    { label: 'HOMBRE', value: Gender.Hombre },
    { label: 'MUJER', value: Gender.Mujer }
  ];
  getError(ctrl: AbstractControl): string | null {
    if (ctrl.valid || !ctrl.touched) return null;
    if (ctrl.hasError('required'))   return 'Este campo es obligatorio';
    if (ctrl.hasError('minlength'))  return `Mínimo ${ctrl.getError('minlength').requiredLength} caracteres`;
    if (ctrl.hasError('maxlength'))  return `Máximo ${ctrl.getError('maxlength').requiredLength} caracteres`;
    return 'Valor inválido';
  }
  // Handlers de creación rápida — por ahora solo log; el padre los conectará
  handleCreateCategory(name: Category): void {
    console.log('[NewProductForm] crear categoría:', name);
  }

  handleCreateBrand(name: Brand): void {
    console.log('[NewProductForm] crear marca:', name);
  }

}
