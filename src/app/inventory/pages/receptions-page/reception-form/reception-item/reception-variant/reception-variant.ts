import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductVariantOption } from '../../../../../models/products/product-search-result';
import { VariantFormGroup } from '../../common/variant-form-group';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-reception-variant',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
  ],
  templateUrl: './reception-variant.html',
  styles: ``,
})
export default class ReceptionVariant implements OnInit {
  // DEPENDENCIES
  private fb = inject(FormBuilder);

  // INPUTS
  form = input.required<VariantFormGroup>();
  availableVariants = input<ProductVariantOption[]>([]);
  index = input<number>(0);
  forceNew = input.required<boolean>();
  usedVariantIds = input<number[]>([]);

  // OUTPUTS
  remove = output<void>();

  // STATE
  isNewVariant = signal(false);
  variantSearch = signal('');
  showDropdown = signal(false);

  /** Signal puente para el ID de variante (necesario para reactividad en computed) */
  private selectedVariantId = signal<number | null>(null);

  /** Signals manuales para el subtotal (evitan errores de inicialización de inputs) */
  private qtySignal = signal(0);
  private costSignal = signal(0);

  // ── Señales computadas ───────────────────────────────────────────────

  /** Variante actualmente seleccionada (objeto completo). */
  private selectedVariant = computed<ProductVariantOption | undefined>(() => {
    const id = this.selectedVariantId();
    if (!id) return undefined;
    return this.availableVariants().find(v => v.id === id);
  });

  selectedVariantSize = computed(() => this.selectedVariant()?.size ?? '');
  selectedVariantColor = computed(() => this.selectedVariant()?.color ?? '');
  selectedVariantPrice = computed(() => this.selectedVariant()?.price ?? null);

  /** Subtotal reactivo basado en las señales manuales */
  subtotal = computed(() => this.qtySignal() * this.costSignal());

  // ── Lifecycle ─────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.restoreModeFromValidators();

    // 1. Inicializar ID seleccionado si ya existe en el form
    const initialId = this.productVariantIdCtrl.value;
    if (initialId) {
      this.selectedVariantId.set(initialId);
      const found = this.availableVariants().find(v => v.id === initialId);
      if (found) this.variantSearch.set(this.formatDropdownLabel(found));
    }

    // 2. Sincronizar Subtotal (Valores iniciales)
    this.qtySignal.set(this.form().controls.quantityReceived.value ?? 0);
    this.costSignal.set(this.form().controls.unitCost.value ?? 0);

    // 3. Escuchar cambios en el formulario para actualizar las señales del subtotal
    this.form().controls.quantityReceived.valueChanges.subscribe(val => {
      this.qtySignal.set(val ?? 0);
    });
    this.form().controls.unitCost.valueChanges.subscribe(val => {
      this.costSignal.set(val ?? 0);
    });
  }

  // ── Dropdown / búsqueda ───────────────────────────────────────────────

  filteredVariants = computed(() => {
    const q = this.variantSearch().toLowerCase().trim();
    const allVariants = this.availableVariants();
    const usedIds = this.usedVariantIds();
    const currentId = this.selectedVariantId();

    // 1. Filtramos las que ya están usadas en OTRAS filas
    // (Permitimos la actual para que no desaparezca de su propio buscador)
    let available = allVariants.filter(v =>
      !usedIds.includes(v.id) || v.id === currentId
    );

    if (!q) return available;

    // 2. Filtro de búsqueda normal sobre las disponibles
    return available.filter(v =>
      v.description.toLowerCase().includes(q) ||
      v.size?.toLowerCase().includes(q) ||
      v.color?.toLowerCase().includes(q)
    );
  });

  openDropdown(): void { this.showDropdown.set(true); }
  closeDropdown(): void { setTimeout(() => this.showDropdown.set(false), 150); }

  selectVariant(variant: ProductVariantOption): void {
    this.productVariantIdCtrl.setValue(variant.id);
    this.selectedVariantId.set(variant.id); // Notifica a los computed
    this.productVariantIdCtrl.markAsTouched();
    this.variantSearch.set(this.formatVariantLabel(variant));
    this.showDropdown.set(false);
  }
  formatVariantLabel(v: ProductVariantOption): string {
    return v.description;
  }
  formatDropdownLabel(v: ProductVariantOption): string {
    const parts = [v.description];
    if (v.size) parts.push(`Talle ${v.size}`);
    if (v.color) parts.push(v.color);
    return parts.join(' · ');
  }
  onSearchInput(value: string): void {
    this.variantSearch.set(value);

    // LÓGICA DE SEGURIDAD:
    // Si el texto actual es diferente al label de la variante que estaba seleccionada,
    // significa que el usuario está editando manualmente -> Limpiamos el ID.
    const selected = this.selectedVariant();
    if (selected && value !== this.formatDropdownLabel(selected)) {
      this.productVariantIdCtrl.setValue(null);
      this.selectedVariantId.set(null); // Esto vaciará automáticamente Talle/Color/Precio
    }

    this.openDropdown();
  }

  // ── Modo Ex / New ─────────────────────────────────────────────────────

  switchToNew(): void {
    this.isNewVariant.set(true);
    this.selectedVariantId.set(null);
    this.activateNewVariantMode();
  }

  switchToExisting(): void {
    if (this.forceNew()) return;
    this.isNewVariant.set(false);
    this.deactivateNewVariantMode();
    this.selectedVariantId.set(null);
    this.variantSearch.set('');
  }

  private activateNewVariantMode(): void {
    this.productVariantIdCtrl.setValue(null);
    this.productVariantIdCtrl.clearValidators();
    this.productVariantIdCtrl.updateValueAndValidity();

    const nv = this.newVariantGroup;
    nv.get('description')?.setValidators([Validators.required]);
    nv.get('price')?.setValidators([Validators.required, Validators.min(0.5)]);
    nv.get('description')?.updateValueAndValidity();
    nv.get('price')?.updateValueAndValidity();
  }

  private deactivateNewVariantMode(): void {
    this.productVariantIdCtrl.setValidators([Validators.required]);
    this.productVariantIdCtrl.updateValueAndValidity();

    const nv = this.newVariantGroup;
    nv.reset();
    nv.get('description')?.clearValidators();
    nv.get('price')?.clearValidators();
    nv.get('description')?.updateValueAndValidity();
    nv.get('price')?.updateValueAndValidity();
  }

  private restoreModeFromValidators(): void {
    if (this.forceNew()) {
      this.isNewVariant.set(true);
      return;
    }
    const descriptionCtrl = this.newVariantGroup.get('description');
    this.isNewVariant.set(descriptionCtrl?.hasValidator(Validators.required) ?? false);
  }

  // ── Accesors ──────────────────────────────────────────────────────────

  get productVariantIdCtrl(): FormControl<number | null> {
    return this.form().controls.productVariantId;
  }

  get newVariantGroup(): FormGroup {
    return this.form().controls.newVariant;
  }

  onRemove(): void { this.remove.emit(); }

  hasError(ctrl: AbstractControl | null, error: string = 'required'): boolean {
    if (!ctrl) return false;
    return ctrl.hasError(error) && ctrl.touched;
  }
}
