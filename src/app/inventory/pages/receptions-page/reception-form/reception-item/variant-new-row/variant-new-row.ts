import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { VariantFormGroup } from '../../common/variant-form-group';

@Component({
  selector: 'app-variant-new-row',
  imports: [ReactiveFormsModule, DecimalPipe],
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
  canSwitchToExisting = input<boolean>(true);

  // ── Outputs ───────────────────────────────────────────────────────────
  remove           = output<void>();
  switchToExisting = output<void>();

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
    nv.get('description')?.setValidators([Validators.required]);
    nv.get('price')?.setValidators([Validators.required, Validators.min(0.5)]);
    nv.get('description')?.updateValueAndValidity();
    nv.get('price')?.updateValueAndValidity();

    this.productVariantIdCtrl.clearValidators();
    this.productVariantIdCtrl.updateValueAndValidity();
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
  get productVariantIdCtrl(): FormControl<number | null> {
    return this.form().controls.productVariantId;
  }

  get newVariantGroup(): FormGroup {
    return this.form().controls.newVariant;
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  onRemove(): void { this.remove.emit(); }

  onSwitchToExisting(): void {
    this.newVariantGroup.reset();
    this.newVariantGroup.get('description')?.clearValidators();
    this.newVariantGroup.get('price')?.clearValidators();
    this.newVariantGroup.get('description')?.updateValueAndValidity();
    this.newVariantGroup.get('price')?.updateValueAndValidity();
    this.productVariantIdCtrl.setValidators([]);
    this.productVariantIdCtrl.updateValueAndValidity();
    this.switchToExisting.emit();
  }

  hasError(ctrl: AbstractControl | null, error = 'required'): boolean {
    if (!ctrl) return false;
    return ctrl.hasError(error) && ctrl.touched;
  }
}
