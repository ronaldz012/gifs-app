import {Component, inject, input, output, signal} from '@angular/core';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ReceptionService} from '../../../services/reception-service';
import {ItemFormGroup} from './common/item-form-group';
import {VariantFormGroup} from './common/variant-form-group';
import createReceptionDto from '../../../interfaces/Dtos/Receptions/create-reception-dto';
import ReceptionItem from './reception-item/reception-item';

@Component({
  selector: 'app-reception-form',
  imports: [
    ReactiveFormsModule,
    ReceptionItem
  ],
  templateUrl: './reception-form.html',
  styles: ``,
})
export default class ReceptionForm {
  // ── Dependencies ──────────────────────────────────────────────────────────
  private fb = inject(FormBuilder);
  private receptionService = inject(ReceptionService);

  // ── Inputs ────────────────────────────────────────────────────────────────
  branchId = input<number>(1); // TODO: recibir del padre cuando esté listo

  // ── Outputs ───────────────────────────────────────────────────────────────
  saved = output<void>();
  cancelled = output<void>();

  // ── Estado ────────────────────────────────────────────────────────────────
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  // ── Form ──────────────────────────────────────────────────────────────────
  form = this.fb.group({
    notes: this.fb.control('', { nonNullable: true }),
    items: this.fb.array<ItemFormGroup>([]),
  });

  // ── Accessors ─────────────────────────────────────────────────────────────
  get notesCtrl(): FormControl {
    return this.form.controls.notes;
  }

  get itemsArray(): FormArray<ItemFormGroup> {
    return this.form.controls.items;
  }

  // ── Gestión de items ──────────────────────────────────────────────────────
  addItem(): void {
    this.itemsArray.push(this.buildItemGroup());
  }

  removeItem(i: number): void {
    if (this.itemsArray.length === 1) return; // Al menos un item
    this.itemsArray.removeAt(i);
  }

  private buildItemGroup(): ItemFormGroup {
    return this.fb.group({
      productId: this.fb.control<number | null>(null, Validators.required),
      newProduct: this.fb.group({
        name: this.fb.control('', { nonNullable: true }),
        description: this.fb.control('', { nonNullable: true }),
        categoryId: this.fb.control<number | null>(null),
        brandId: this.fb.control<number | null>(null),
        unitMeasurementSin: this.fb.control<number | null>(null),
        economicActivity: this.fb.control('', { nonNullable: true }),
        productCodeSin: this.fb.control<number | null>(null),
      }),
      variants: this.fb.array<VariantFormGroup>([this.buildVariantGroup()]),
    }) as ItemFormGroup;
  }

  private buildVariantGroup(): VariantFormGroup {
    return this.fb.group({
      productVariantId: this.fb.control<number | null>(null),
      newVariant: this.fb.group({
        description: this.fb.control('', { nonNullable: true }),
        size: this.fb.control('', { nonNullable: true }),
        color: this.fb.control('', { nonNullable: true }),
        price: this.fb.control<number | null>(null),
      }),
      quantityReceived: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(1),
      ]),
      unitCost: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(0.01),
      ]),
    }) as VariantFormGroup;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.itemsArray.length === 0) return;

    const payload = this.buildPayload();
    console.log('Payload a enviar:', payload);

    // TODO: descomentar cuando el endpoint esté listo
    // this.isSubmitting.set(true);
    // this.submitError.set(null);
    // this.receptionService.create(payload).subscribe({
    //   next: () => {
    //     this.isSubmitting.set(false);
    //     this.saved.emit();
    //   },
    //   error: (err) => {
    //     this.isSubmitting.set(false);
    //     this.submitError.set('Error al guardar la recepción. Intentá de nuevo.');
    //     console.error(err);
    //   },
    // });
  }

  private buildPayload(): createReceptionDto {
    const raw = this.form.getRawValue();

    return {
      branchId: this.branchId(),
      notes: raw.notes,
      items: this.itemsArray.controls.map((itemCtrl) => {
        const item = itemCtrl.getRawValue();
        const isNewProduct = !item.productId;

        return {
          productId: isNewProduct ? undefined : item.productId ?? undefined,
          newProduct: isNewProduct ? {
            name: item.newProduct.name,
            description: item.newProduct.description,
            categoryId: item.newProduct.categoryId!,
            brandId: item.newProduct.brandId!,
            unitMeasurementSin: item.newProduct.unitMeasurementSin!,
            economicActivity: item.newProduct.economicActivity,
            productCodeSin: item.newProduct.productCodeSin!,
          } : undefined,
          variants: itemCtrl.controls.variants.controls.map((varCtrl) => {
            const variant = varCtrl.getRawValue();
            const isNewVariant = !variant.productVariantId;

            return {
              productVariantId: isNewVariant ? undefined : variant.productVariantId ?? undefined,
              newVariant: isNewVariant ? {
                description: variant.newVariant.description,
                size: variant.newVariant.size,
                color: variant.newVariant.color,
                price: variant.newVariant.price!,
              } : undefined,
              quantityReceived: variant.quantityReceived!,
              unitCost: variant.unitCost!,
            };
          }),
        };
      }),
    };
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}

