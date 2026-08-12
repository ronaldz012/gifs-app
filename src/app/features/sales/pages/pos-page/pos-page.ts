import { Component, OnInit, signal, ViewChild, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, applyEach, min, validate } from '@angular/forms/signals';
import { ProductService } from '@features/inventory/services';
import {
  isBarcodeApiAvailable,
  QrScannerModal,
} from '@features/sales/components/qr-scanner-modal/qr-scanner-modal';
import { PosCartItemCardComponent } from './pos-item/pos-item.component';
import { PosCartItem, PosSaleState } from '@features/sales/models/pos-sale-state.model';
import { ProductVariantBySkuDto } from '@features/inventory/dtos/products/product-variant-by-sku-dto';
import { CurrencyPipe } from '@angular/common';
import { PosMobilePayModal } from './pos-mobile-pay-modal/pos-mobile-pay-modal';
import { PosDesktopPayPanel } from './pos-desktop-pay-panel/pos-desktop-pay-panel';
import { PosSearchModal } from './pos-search-modal/pos-search-modal';
import { CashRegisterService } from '@features/sales/services/cash-register-service';
import { CurrentRegisterDto } from '@features/sales/dtos/current-register-dto';
import { SaleService } from '@features/sales/services/sale-service';
import { CreateSaleDto, CreateSaleItemDto } from '@features/sales/dtos/create-sale-dto';

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [
    RouterLink,
    QrScannerModal,
    PosCartItemCardComponent,
    CurrencyPipe,
    PosMobilePayModal,
    PosDesktopPayPanel,
    PosSearchModal,
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
  private saleService = inject(SaleService);

  // ── POS state ──────────────────────────────────────────────────────────

  @ViewChild(QrScannerModal) scanner!: QrScannerModal;

  private productService = inject(ProductService);

  /** Muestra el botón solo si la API está disponible en este dispositivo */
  scannerAvailable = signal(false);

  // Control de apertura para el BottomSheet de cobro en móviles
  isMobilePayOpen = signal(false);

  // Control de apertura del modal de búsqueda de productos
  isSearchOpen = signal(false);

  // 1. Estado reactivo principal del POS
  posModel = signal<PosSaleState>({
    paymentMethod: null,
    transactionCode: null,
    publicName: '',
    cashReceived: 0,
    items: [],
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
    return this.posModel().items.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
  });

  // Validador global para habilitar los flujos de cobros
  isFormValid = computed(() => {
    return this.posModel().items.length > 0 && this.posForm().valid();
  });

  registerLabel = computed(() => {
    const reg = this.currentRegister();
    if (!reg?.openedAt) return '';

    const opened = new Date(reg.openedAt);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const openedDay = new Date(opened.getFullYear(), opened.getMonth(), opened.getDate());

    const diffDays = Math.round((today.getTime() - openedDay.getTime()) / (1000 * 60 * 60 * 24));

    let dayLabel: string;
    if (diffDays === 0) {
      dayLabel = 'hoy';
    } else if (diffDays === 1) {
      dayLabel = 'ayer';
    } else {
      dayLabel = `${String(opened.getDate()).padStart(2, '0')}/${String(opened.getMonth() + 1).padStart(2, '0')}`;
    }

    const time = `${String(opened.getHours()).padStart(2, '0')}:${String(opened.getMinutes()).padStart(2, '0')}`;

    return `Caja abierta · ${dayLabel} ${time}`;
  });

  registerDayStatus = computed<'today' | 'yesterday' | 'old'>(() => {
    const reg = this.currentRegister();
    if (!reg?.openedAt) return 'today';

    const opened = new Date(reg.openedAt);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const openedDay = new Date(opened.getFullYear(), opened.getMonth(), opened.getDate());

    const diffDays = Math.round((today.getTime() - openedDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    return 'old';
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
      error: () => this.registerState.set('closed'),
    });
  }

  toggleOpenForm(): void {
    this.showOpenForm.update((v) => !v);
    this.openingBalance.set(0);
  }

  confirmOpenRegister(): void {
    this.cashRegisterService.openRegister({ openingBalance: this.openingBalance() }).subscribe({
      next: () => {
        this.showOpenForm.set(false);
        this.openingBalance.set(0);
        this.checkRegister();
      },
      error: () => alert('Error al abrir la caja. Intente de nuevo.'),
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

  openSearch(): void {
    this.isSearchOpen.set(true);
  }
  closeSearch(): void {
    this.isSearchOpen.set(false);
  }

  /** Agrega al carrito la variante elegida en el modal de búsqueda */
  onVariantPicked(sku: string): void {
    this.onScanned(sku);
  }

  /**
   * Ejecución final del guardado de la venta en el sistema
   */
  submitSale(): void {
    if (!this.isFormValid()) return;

    const state = this.posModel();
    const paymentMethod = state.paymentMethod;
    if (paymentMethod === null) return;

    const dto: CreateSaleDto = {
      paymentMethod,
      invoiceNumber: null,
      documentType: 0, // Ticket
      transactionCode: state.transactionCode,
      notes: null,
      items: state.items.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        discountAmount: item.discountAmount,
      })),
    };

    this.saleService.createSale(dto).subscribe({
      next: () => {
        this.isMobilePayOpen.set(false);
        this.posModel.set({
          paymentMethod: null,
          transactionCode: null,
          publicName: '',
          cashReceived: 0,
          items: [],
        });
      },
      error: () => alert('Error al procesar la venta. Intente de nuevo.'),
    });
  }

  /**
   * Procesa el código escaneado (SKU), busca en el backend e interactúa con el carrito
   */
  onScanned(skuValue: string): void {
    this.productService.getVariantBySku(skuValue).subscribe({
      next: (variant: ProductVariantBySkuDto) => {
        if (variant.availableStockInBranch <= 0) {
          alert(
            `La talla/color SKU ${variant.sku} no cuenta con stock disponible en esta sucursal.`,
          );
          return;
        }

        this.posModel.update((state) => {
          const updatedItems = [...state.items];
          const existingItemIndex = updatedItems.findIndex(
            (i) => i.productVariantId === variant.id,
          );

          if (existingItemIndex > -1) {
            const currentItem = updatedItems[existingItemIndex];
            if (currentItem.quantity < variant.availableStockInBranch) {
              currentItem.quantity += 1;
            } else {
              alert(
                `No puedes agregar más unidades. Stock máximo disponible: ${variant.availableStockInBranch} u.`,
              );
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
              discountAmount: 0,
            };
            updatedItems.unshift(newItem);
          }

          return { ...state, items: updatedItems };
        });
      },
      error: () => {
        alert(`No se encontró ningún producto con el código: ${skuValue}`);
      },
    });
  }

  /**
   * Elimina un ítem específico del árbol por su índice
   */
  removeItem(index: number): void {
    this.posModel.update((state) => ({
      ...state,
      items: state.items.filter((_, i) => i !== index),
    }));
  }
}
