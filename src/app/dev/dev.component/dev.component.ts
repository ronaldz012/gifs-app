import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';
import { PaymentMethod } from '@features/sales/models/payment-method';
import { PosDesktopPayPanel } from '@features/sales/pages/pos-page/pos-desktop-pay-panel/pos-desktop-pay-panel';
import { PosMobilePayModal } from '@features/sales/pages/pos-page/pos-mobile-pay-modal/pos-mobile-pay-modal';
import { SimpleScannerDemo } from '@features/sales/components/simple-scanner-demo/simple-scanner-demo';
import { ToastService } from '@core/services/toast-service';

interface PaymentFormModel {
  method: PaymentMethod;
  transactionCode: string | null;
}

@Component({
  selector: 'app-dev-component',
  imports: [CommonModule, DecimalPipe, PosDesktopPayPanel, PosMobilePayModal, SimpleScannerDemo],
  templateUrl: './dev.component.html',
  styleUrl: './dev.component.css',
})
export default class DevComponent {
  private toastService = inject(ToastService);

  // Datos de prueba
  total = signal(1250.75);
  itemCount = signal(3);
  showMobileModal = signal(false);

  toastMessage = signal('Mensaje de prueba');
  toastDuration = signal(3000);

  paymentModel = signal<PaymentFormModel>({
    method: PaymentMethod.Cash,
    transactionCode: null,
  });

  paymentForm = form(this.paymentModel);
  onSubmit(): void {
    console.log('✅ Submit', this.paymentModel());
    this.showMobileModal.set(false);
  }

  showToast(type: 'success' | 'error' | 'warning' | 'info'): void {
    this.toastService[type](this.toastMessage() || 'Sin mensaje', this.toastDuration());
  }
}
