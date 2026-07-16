import { Component, OnInit, signal, ViewChild, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, applyEach, min, validate } from '@angular/forms/signals';
import { ProductService } from '@features/inventory/services';
import { isBarcodeApiAvailable, QrScannerModal } from '@features/sales/components/qr-scanner-modal/qr-scanner-modal';
import { PosCartItemCardComponent } from './pos-item/pos-item.component';
import { PosCartItem, PosSaleState } from '@features/sales/models/pos-sale-state.model';
import { PaymentMethod } from '@features/sales/models/payment-method';
import { ProductVariantBySkuDto } from '@features/inventory/dtos/products/product-variant-by-sku-dto';
import { DecimalPipe } from '@angular/common';
import { PosMobilePayModal } from './pos-mobile-pay-modal/pos-mobile-pay-modal';
import { PosDesktopPayPanel } from './pos-desktop-pay-panel/pos-desktop-pay-panel';
import { CashRegisterService } from '@features/sales/services/cash-register-service';
import { CurrentRegisterDto } from '@features/sales/dtos/current-register-dto';



@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [
    RouterLink,
    QrScannerModal, 
    PosCartItemCardComponent, 
    DecimalPipe,
    PosMobilePayModal, 
    PosDesktopPayPanel
  ],
  templateUrl: './pos-page.html',
})
export default class PosPage implements OnInit {

  // ── Register state ────────────────────────────────────────────────────
  registerState = signal<'loading' | 'closed' | 'open'>('loading');
  currentRegister = signal<CurrentRegisterDto | null>(null);
  showOpenForm = signal(false);
  openingBalance = signal<number>(0);

  private cashRegisterService = inject(CashRegisterService);

  // ── POS state ──────────────────────────────────────────────────────────

  @ViewChild(QrScannerModal) scanner!: QrScannerModal;
  
  private productService = inject(ProductService);

  /** Muestra el botón solo si la API está disponible en este dispositivo */
  scannerAvailable = signal(false);

  // Control de apertura para el BottomSheet de cobro en móviles
  isMobilePayOpen = signal(false);

  // 1. Estado reactivo principal del POS
  posModel = signal<PosSaleState>({
    paymentMethod: PaymentMethod.Cash,
    transactionCode: null,
    publicName: '',
    cashReceived: 0,
    items: []
  });

  // 2. Definición del Esquema de validación del Formulario
  posForm = form(this.posModel, (schemaPath) => {
    applyEach(schemaPath.items, (item) => {
      min(item.quantity, 1, { message: 'Mínimo 1 unidad.' });
      
      // Control reactivo de stock por prenda en el carrito
      validate(item.quantity, ({ value, valueOf }) => {
        if (value() > valueOf(item.stock)) {
          return { kind: 'outOfStock', message: 'Supera el stock.' };
        }
        return null;
      });
    });
  });

  // Total acumulado derivativo para mostrar en el pie de página
  totalCart = computed(() => {
    return this.posModel().items.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
  });

  // Validador global para habilitar los flujos de cobros
  isFormValid = computed(() => {
    return this.posModel().items.length > 0 && this.posForm().valid();
  });

  async ngOnInit(): Promise<void> {
    this.scannerAvailable.set(await isBarcodeApiAvailable());
    this.checkRegister();
  }

  checkRegister(): void {
    this.cashRegisterService.getCurrentRegister().subscribe({
      next: (register) => {
        if (register.isOpen) {
          this.currentRegister.set(register);
          this.registerState.set('open');
        } else {
          this.registerState.set('closed');
        }
      },
      error: () => this.registerState.set('closed')
    });
  }

  toggleOpenForm(): void {
    this.showOpenForm.update(v => !v);
    this.openingBalance.set(0);
  }

  confirmOpenRegister(): void {
    this.cashRegisterService.openRegister({ openingBalance: this.openingBalance() }).subscribe({
      next: () => {
        this.showOpenForm.set(false);
        this.openingBalance.set(0);
        this.checkRegister();
      },
      error: () => alert('Error al abrir la caja. Intente de nuevo.')
    });
  }

  searchBySku(skuValue: string): void {
    const cleanSku = skuValue?.trim();
    if (!cleanSku) return;

    // Reutiliza la misma lógica exacta de búsqueda y validación del backend
    this.onScanned(cleanSku);
  }
  openScanner(): void {
    this.scanner.open();
  }

  /**
   * Ejecución final del guardado de la venta en el sistema
   */
  submitSale(): void {
    if (!this.isFormValid()) return;
    
    console.log('Modelo listo para enviar a la API:', this.posModel());
    alert('Venta procesada con éxito');
    
    // Reset del flujo operativo posterior a la transacción
    this.isMobilePayOpen.set(false);
    this.posModel.set({
      paymentMethod: PaymentMethod.Cash,
      transactionCode: null,
      publicName: '',
      cashReceived: 0,
      items: []
    });
  }

  /**
   * Procesa el código escaneado (SKU), busca en el backend e interactúa con el carrito
   */
  onScanned(skuValue: string): void {
    this.productService.getVariantBySku(skuValue).subscribe({
      next: (variant: ProductVariantBySkuDto) => {
        if (variant.availableStockInBranch <= 0) {
          alert(`La variante SKU ${variant.sku} no cuenta con stock disponible en esta sucursal.`);
          return;
        }

        this.posModel.update((state) => {
          const updatedItems = [...state.items];
          const existingItemIndex = updatedItems.findIndex(i => i.productVariantId === variant.id);

          if (existingItemIndex > -1) {
            const currentItem = updatedItems[existingItemIndex];
            if (currentItem.quantity < variant.availableStockInBranch) {
              currentItem.quantity += 1;
            } else {
              alert(`No puedes agregar más unidades. Stock máximo disponible: ${variant.availableStockInBranch} u.`);
            }
          } else {
            const newItem: PosCartItem = {
              productVariantId: variant.id,
              productName: variant.productName,
              quantity: 1,
              categoryName: variant.categoryName,
              brandName: variant.productName,
              sku: variant.sku,
              size: variant.size,
              colorName: variant.colorName,
              stock: variant.availableStockInBranch,
              originalPrice: variant.price,
              sellingPrice: variant.price,
              discountAmount: 0
            };
            updatedItems.unshift(newItem);
          }

          return { ...state, items: updatedItems };
        });
      },
      error: () => {
        alert(`No se encontró ningún producto con el código: ${skuValue}`);
      }
    });
  }

  /**
   * Elimina un ítem específico del árbol por su índice
   */
  removeItem(index: number): void {
    this.posModel.update((state) => ({
      ...state,
      items: state.items.filter((_, i) => i !== index)
    }));
  }
}