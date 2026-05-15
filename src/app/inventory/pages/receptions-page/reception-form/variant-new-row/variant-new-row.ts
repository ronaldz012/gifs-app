import {
  Component,
  computed,
  DestroyRef,
  inject, Input,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { VariantFormGroup } from '../../common/variant-form-group';
import {Color} from '../../../../../dtos/Colors/color';
import {CreateEntityEvent} from '../../../../../interfaces/types/create-entity-event';
import {SelectCtrl} from '../../../../../../core/components/selec-from-list-ctrl';
import {ProductVariantOption} from '../../../../../components/product-search/product-search-result';

@Component({
  selector: 'app-variant-new-row',
  imports: [ReactiveFormsModule, DecimalPipe, SelectCtrl],
  templateUrl: './variant-new-row.html',
  styles: [`
    :host {
      display: contents; /* Esto es vital para que no rompa el CSS Grid del padre */
    }
  `]
})
export default class VariantNewRow implements OnInit {
  // ── Dependencies ──────────────────────────────────────────────────────
  private destroyRef = inject(DestroyRef);

  // ── Inputs ────────────────────────────────────────────────────────────
  form                = input.required<VariantFormGroup>();

  index               = input<number>(0);
  colors = input<Color[]>([]);
  existingVariants = input<ProductVariantOption[]>([]);
  itemIndex = input.required<number>();

  // ── Outputs ───────────────────────────────────────────────────────────
  remove           = output<void>();
  openCreation = output<CreateEntityEvent>();

  // ── Puentes reactivos ─────────────────────────────────────────────────
  private qtySignal  = signal(0);
  private costSignal = signal(0);

  // ── Computados ────────────────────────────────────────────────────────
  subtotal = computed(() => this.qtySignal() * this.costSignal());

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.activateValidators();
    this.syncSubtotalSignals();
  }

  private activateValidators(): void {
    const nv = this.newVariantGroup;

    nv.setValidators([
      Validators.required,
      this.uniqueVariantValidator()
    ]);
    nv.get('description')?.setValidators([Validators.required]);
    nv.get('price')?.setValidators([Validators.required, Validators.min(0.5)]);
    nv.get('colorId')?.setValidators([Validators.required]);

    nv.get('description')?.updateValueAndValidity();
    nv.get('price')?.updateValueAndValidity();
    nv.get('colorId')?.updateValueAndValidity();


    this.productVariantIdCtrl.clearValidators();
    this.productVariantIdCtrl.updateValueAndValidity();
  }
  private uniqueVariantValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const size = control.get('size')?.value?.toString().trim().toUpperCase();
      const colorId = control.get('colorId')?.value;

      if (!size || !colorId) return null;

      // Buscamos si ya existe esa combinación en el producto actual
      const alreadyExists = this.existingVariants().some(v =>
        v.size.trim().toUpperCase() === size &&
        v.colorId === colorId
      );

      return alreadyExists ? { duplicateVariant: true } : null;
    };
  }

  private syncSubtotalSignals(): void {
    const { quantityReceived, unitCost } = this.form().controls;
    this.qtySignal.set(quantityReceived.value ?? 0);
    this.costSignal.set(unitCost.value ?? 0);

    quantityReceived.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => this.qtySignal.set(val ?? 0));

    unitCost.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => this.costSignal.set(val ?? 0));
  }

  // ── Accessors ─────────────────────────────────────────────────────────
  get productVariantIdCtrl(): FormControl<GUID | null> {
    return this.form().controls.productVariantId;
  }

  get newVariantGroup() {
    return this.form().controls.newVariant;
  }
  get colorIdCtrl() {
    return this.newVariantGroup.get('colorId') as FormControl;
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  onRemove(): void { this.remove.emit(); }

  hasError(ctrl: AbstractControl | null, error = 'required'): boolean {
    if (!ctrl) return false;
    return ctrl.hasError(error) && ctrl.touched;
  }

  handleCreateColor(text:string){
    console.log('mandando desde new ROW: ',text);
    this.openCreation.emit({type: 'color', query: text, itemIndex: this.itemIndex(), subIndex: this.index()});
  }

}
