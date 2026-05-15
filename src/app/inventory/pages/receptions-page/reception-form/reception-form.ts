import {
  Component,
  inject,
  OnInit,
  signal,
  DestroyRef,
  viewChild,
  effect
} from '@angular/core';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule} from '@angular/forms';
import {ReceptionService} from '../../../services/reception-service';
import {ItemFormGroup, NewReceptionForm} from './common/item-form-group';
import { ReceptionItem } from './reception-item/reception-item';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {CategoryService} from '../../../services/category-service';
import BrandService from '../../../services/brand-service';
import {Category} from '../../../dtos/categories/category-dto';
import {Brand} from '../../../dtos/brands/brand-dto';
import {CreateCategory} from '../../../components/create-category/create-category';
import {CreateEntityEvent} from '../../../interfaces/types/create-entity-event';
import CreateBrand from '../../../components/create-brand/create-brand';
import {BranchContextService} from '../../../../core/auth/branch-context-service';
import {Router} from '@angular/router';
import CreateColor from '../../../components/create-color/create-color';
import {Color} from '../../../dtos/Colors/color';
import {ColorService} from '../../../services/color-service';
import {ReceptionFormBuilders} from './common/reception-form-builder';
import {buildReceptionPayload} from './common/build-payload-reception';
import {NewProductModal} from '../new-product-modal/new-product-modal';
import {ExistingProductModal} from '../existing-product-modal/existing-product-modal';


@Component({
  selector: 'app-reception-form',
  imports: [
    ReactiveFormsModule,
    ReceptionItem,
    DecimalPipe,
    CreateCategory,
    CreateBrand,
    CreateColor,
    NewProductModal,
    ExistingProductModal,
  ],
  templateUrl: './reception-form.html',
  styles: ``,
})
export default class ReceptionForm implements OnInit {

  // ── Dependencies ──────────────────────────────────────────────────────────
   fb = inject(FormBuilder);
  private receptionService = inject(ReceptionService);
  private destroyRef = inject(DestroyRef);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private colorService = inject(ColorService);
  private branchService = inject(BranchContextService)
  private router = inject(Router);

  branchId = signal<GUID>('');

  // ── Estates ────────────────────────────────────────────────────────────────
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  totalCost = signal<number>(0);
  activeModal = signal<CreateEntityEvent | null>(null);
  activateNewProductModal = signal<boolean>(false);
  activateExistingProductModal = signal<boolean>(false);
  editingItem = signal<ItemFormGroup | null>(null);
  editingIndex = signal<number | null>(null);
  //────DATA─────────────────────────────────────────────────────────────────────────────
  categories = signal<Category[]>([])
  brands = signal<Brand[]>([])
  colors = signal<Color[]>([])
  categoryModal = viewChild(CreateCategory);
  brandModal = viewChild(CreateBrand);
  lastFocusedElement: HTMLElement | null = null;
  // ── Form ──────────────────────────────────────────────────────────────────
  form: NewReceptionForm = ReceptionFormBuilders.buildReceptionForm(this.fb);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  constructor() {
    effect(() => {
      const modal = this.activeModal();
      const modalRefCategory = this.categoryModal();
      const modalRefBrand = this.brandModal();

    });
  }
  ngOnInit(): void {
    this.loadCatalogs();
    this.itemsArray.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalculateTotalCost());
  }
  private loadCatalogs(): void {
   this.branchId.set( this.branchService.active()?.branchId ?? '');
    this.categoryService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(x => this.categories.set(x));
    this.brandService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(x => this.brands.set(x));

    this.colorService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(x => this.colors.set(x))
  }

  // ── Totales ───────────────────────────────────────────────────────────────
  private recalculateTotalCost(): void {
    let total = 0;
    for (const itemCtrl of this.itemsArray.controls) {
      for (const varCtrl of itemCtrl.controls.variants.controls) {
        const qty  = varCtrl.controls.quantityReceived.value ?? 0;
        const cost = varCtrl.controls.unitCost.value ?? 0;
        total += qty * cost;
      }
    }
    this.totalCost.set(total);
  }

  // ── Accessors ─────────────────────────────────────────────────────────────
  get notesCtrl(): FormControl {return this.form.controls.notes;}

  get itemsArray(): FormArray<ItemFormGroup> {return this.form.controls.items;}

  // ── Gestión de items ──────────────────────────────────────────────────────
  addItem(mode: 'ex' | 'new'): void {
    this.itemsArray.push(ReceptionFormBuilders.buildItemGroup(this.fb, mode));
  }

  onEditItem(itemForm: ItemFormGroup, index: number): void {
    this.editingIndex.set(index);
    this.editingItem.set(itemForm);
    if (itemForm.controls.mode.value === 'new') {
      this.activateNewProductModal.set(true);
    } else {
      this.activateExistingProductModal.set(true);
    }
  }

  removeItem(i: number): void {this.itemsArray.removeAt(i);}
  // ── Submit ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    this.form.markAllAsTouched();

    const getFormErrors = (formGroup: any) => {
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control.invalid) {
          if (control.controls) getFormErrors(control);
          else console.error(`Campo inválido: ${key}`, control.errors);
        }
      });
      if (formGroup.errors) console.error(`Error en el objeto raíz/grupo:`, formGroup.errors);
    };

    getFormErrors(this.form);

    if (this.form.invalid || this.itemsArray.length === 0) return;

   const payload = buildReceptionPayload(this.form, this.itemsArray,this.branchId());

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.receptionService.create(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['inventory','receptions',])
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.submitError.set('Error al guardar la recepción. Intentá de nuevo.');
        console.error(err);
      },
    });

  }


  //----------------MODALS----------------------------------------------------------
  handleOpenCreation(event: CreateEntityEvent) {
    this.lastFocusedElement = document.activeElement as HTMLElement; // 🔥 guardas foco
    this.activeModal.set(event);
  }
  onCategoryCreated(newCategory: Category)
  {
    const modal = this.activeModal();
    if (!modal) return;

    this.categories.update(list => [...list, newCategory]);

    const item = this.itemsArray.at(modal.itemIndex);
    item.get('newProduct.categoryId')?.setValue(newCategory.id);

    this.activeModal.set(null);
    setTimeout(() => {
      this.focusNextElement(this.lastFocusedElement);
    });
  }
  onBrandCreated(newBrand: Brand)
  {
    const modal = this.activeModal();
    if (!modal) return;

    this.brands.update(list => [...list, newBrand]);

    const item = this.itemsArray.at(modal.itemIndex);
    item.get('newProduct.brandId')?.setValue(newBrand.id);

    this.activeModal.set(null);
    setTimeout(() => {
      this.focusNextElement(this.lastFocusedElement);
    });
  }
  onColorCreated(newColor: Color) {
    const modal = this.activeModal();
    // Verificación de seguridad para los índices
    if (!modal || modal.itemIndex === null || modal.subIndex === null) return;

    // 1. Actualizar la lista de colores
    this.colors.update(list => [...list, newColor]);

    // 2. Obtener el item (producto) del FormArray principal
    const itemGroup = this.form.controls.items.at(modal.itemIndex);

    if (itemGroup) {
      // 3. Obtener el FormArray de variantes dentro de ese producto
      const variantsArray = itemGroup.controls.variants;

      // 4. Obtener la variante específica (subIndex)
      const variantGroup = variantsArray.at(modal.subIndex!);

      if (variantGroup) {
        // 5. IMPORTANTE: En tu VariantFormGroup, colorId está dentro de 'newVariant'
        // Usamos .get() con el path completo
        const colorControl = variantGroup.get('newVariant.colorId');

        if (colorControl) {
          colorControl.setValue(newColor.id);
          colorControl.markAsDirty();
          colorControl.updateValueAndValidity();
        }
      } else {
        console.error(`No se encontró la variante en el subIndex: ${modal.subIndex}`);
      }
    } else {
      console.error(`No se encontró el item en el itemIndex: ${modal.itemIndex}`);
    }

    // Cerrar y restaurar foco
    this.activeModal.set(null);
    setTimeout(() => {
      this.focusNextElement(this.lastFocusedElement);
    });
  }

  handleModalKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault(); // 🔥 bloquea Shift+Tab
    }
  }
  focusNextElement(current: HTMLElement | null) {
    if (!current) return;

    const xd = Array.from(
      document.querySelectorAll<HTMLElement>(
        'input, button, select, textarea, [tabindex]:not([tabindaex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled'));

    const index = xd.indexOf(current);

    if (index >= 0 && index < xd.length - 1) {
      xd[index + 1].focus();
    }
  }

  protected onCancel() {
    this.router.navigate(['inventory','receptions']);
  }

  onNewProductConfirmed($event: ItemFormGroup) {
    const index = this.editingIndex();

    if (index === null) {
      console.log("adding new Product");
      this.itemsArray.push($event);
    } else {
      console.log("updating Product at index", index);
      this.itemsArray.setControl(index, $event);
    }

    this.closeNewProductModal();
    this.recalculateTotalCost();
  }

  closeNewProductModal() {
    this.activateNewProductModal.set(false);
    this.editingItem.set(null);
    this.editingIndex.set(null);
  }

}
