import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  ElementRef
} from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidatorFn, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, CommonModule } from '@angular/common';
import { VariantFormGroup } from '../common/variant-form-group';
import { Color } from '../../../../dtos/Colors/color';
import { ProductVariantOption } from '../../../../components/product-search/product-search-result';
import { ColorSelectCtrl } from '../../../../components/color-select-ctrl/color-select-ctrl';

@Component({
  selector: 'app-variant-new-row',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe, ColorSelectCtrl],
  templateUrl: './variant-new-row.html',
  styles: ``
})
export default class VariantNewRow implements OnInit {
  private destroyRef = inject(DestroyRef);
  private el = inject(ElementRef);

  // Inputs Originales
  form             = input.required<VariantFormGroup>();
  index            = input<number>(0);
  colors           = input<Color[]>([]);
  existingVariants = input<ProductVariantOption[]>([]);
  itemIndex        = input.required<number>();

  // Outputs
  remove = output<void>();

  // Signals para Subtotal
  private qtySignal   = signal(0);
  private costSignal  = signal(0);
  private priceSignal = signal(0);

  subtotal = computed(() => this.qtySignal() * this.costSignal());
  priceSubtotal = computed(() => this.qtySignal() * this.priceSignal());

  ngOnInit(): void {
    this.syncSubtotalSignals();
    this.newVariantGroup.setValidators([this.uniqueVariantValidator()]);
  }

  private syncSubtotalSignals(): void {
    const { quantityReceived, unitCost } = this.form().controls;
    const { price } = this.newVariantGroup.controls;

    this.qtySignal.set(quantityReceived.value ?? 0);
    this.costSignal.set(unitCost.value ?? 0);
    this.priceSignal.set(price.value ?? 0);

    quantityReceived.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => this.qtySignal.set(val ?? 0));

    unitCost.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => this.costSignal.set(val ?? 0));

    price.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => this.priceSignal.set(val ?? 0));
  }

  private uniqueVariantValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as VariantFormGroup['controls']['newVariant'];
      const size = group.controls.size.value?.toString().trim().toUpperCase();
      const colorId = group.controls.colorId.value;
      if (!size || !colorId) return null;

      const alreadyExists = this.existingVariants().some(v =>
        v.size.trim().toUpperCase() === size && v.colorId === colorId
      );
      return alreadyExists ? { duplicateVariant: true } : null;
    };
  }

  // Accessors
  get newVariantGroup() { return this.form().controls.newVariant; }
  get colorIdCtrl()    { return this.newVariantGroup.controls.colorId; }
  get sizeCtrl()       { return this.newVariantGroup.controls.size; }
  get qtyCtrl()        { return this.form().controls.quantityReceived; }
  get costCtrl()       { return this.form().controls.unitCost; }
  get priceCtrl()      { return this.newVariantGroup.controls.price; }
  get descCtrl()       { return this.newVariantGroup.controls.description; }

  getError(ctrl: AbstractControl | null): string | null {
    if (!ctrl || ctrl.valid || !ctrl.touched) return null;
    if (ctrl.hasError('required'))  return 'Obligatorio';
    if (ctrl.hasError('min'))       return `Mín: ${ctrl.getError('min').min}`;
    if (ctrl.hasError('minlength')) return `Mín: ${ctrl.getError('minlength').requiredLength} carac.`;
    return 'Inválido';
  }

  // Acciones
  onRemove(): void { this.remove.emit(); }
  handleCreateColor(event: any) {}

  focusFirst(): void {
    const el = this.el.nativeElement.querySelector('app-color-select-ctrl input') as HTMLElement;
    if (el) {
      el.focus();
    } else {
      const sizeInput = this.el.nativeElement.querySelector('input[formcontrolname="size"]') as HTMLElement;
      if (sizeInput) sizeInput.focus();
    }
  }
}
