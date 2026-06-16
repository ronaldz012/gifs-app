import { Component, OnInit, signal, ViewChild, inject, computed } from '@angular/core';
import { form, applyEach, min, validate } from '@angular/forms/signals';
import { ProductService } from '@features/inventory/services';
import { isBarcodeApiAvailable, QrScannerModal } from '@features/sales/components/qr-scanner-modal/qr-scanner-modal';
import {  PosCartItemCardComponent } from './pos-item/pos-item.component';
import { PosCartItem, PosSaleState } from '@features/sales/models/pos-sale-state.model';
import { PaymentMethod } from '@features/sales/models/payment-method';
import { ProductVariantBySkuDto } from '@features/inventory/dtos/products/product-variant-by-sku-dto';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [QrScannerModal, PosCartItemCardComponent, DecimalPipe],
  templateUrl: './pos-page.html',
})
export default class PosPage implements OnInit {
  @ViewChild(QrScannerModal) scanner!: QrScannerModal;
  
  private productService = inject(ProductService);

  /** Muestra el botón solo si la API está disponible en este dispositivo */
  scannerAvailable = signal(false);

  // 1. Estado reactivo principal del POS usando la estructura definida
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

  async ngOnInit(): Promise<void> {
    this.scannerAvailable.set(await isBarcodeApiAvailable());
  }

  openScanner(): void {
    this.scanner.open();
  }

  /**
   * Procesa el código escaneado (SKU), busca en el backend e interactúa con el carrito
   */
  onScanned(skuValue: string): void {
    this.productService.getVariantBySku(skuValue).subscribe({
      next: (variant: ProductVariantBySkuDto) => {
        
        // Validación preliminar: ¿Tiene stock en sucursal?
        if (variant.availableStockInBranch <= 0) {
          alert(`La variante SKU ${variant.sku} no cuenta con stock disponible en esta sucursal.`);
          return;
        }

        this.posModel.update((state) => {
          const updatedItems = [...state.items];
          const existingItemIndex = updatedItems.findIndex(i => i.productVariantId === variant.id);

          if (existingItemIndex > -1) {
            // Regla Retail: Si el producto ya existe, incrementamos cantidad si el stock lo permite
            const currentItem = updatedItems[existingItemIndex];
            if (currentItem.quantity < variant.availableStockInBranch) {
              currentItem.quantity += 1;
            } else {
              alert(`No puedes agregar más unidades. Stock máximo disponible: ${variant.availableStockInBranch} u.`);
            }
          } else {
            // Si es nuevo, mapeamos el DTO de C# a la interfaz de vista PosCartItem
            const newItem: PosCartItem = {
              productVariantId: variant.id,
              productName: variant.productName,
              quantity: 1,
              categoryName: variant.categoryName,
              brandName: variant.productName, // El nombre base de la prenda
              sku: variant.sku,
              size: variant.size,
              colorName: variant.colorName,
              stock: variant.availableStockInBranch,
              originalPrice: variant.price,
              sellingPrice: variant.price,
              discountAmount: 0
            };
            updatedItems.unshift(newItem); // Agregamos al inicio de la lista
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