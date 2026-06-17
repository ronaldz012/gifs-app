import { Component, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PaymentMethod } from '@features/sales/models/payment-method';
import { Field, FieldState, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-pos-mobile-pay-modal',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormField],
  templateUrl: './pos-mobile-pay-modal.html',
})
export class PosMobilePayModal {
  total = input.required<number>();
  itemCount = input.required<number>();
  currentMethod = input.required<FieldState<PaymentMethod>>();
  transactionCode = input.required<FieldState<string | null>>();
  isValid = input.required<boolean>();

  closed = output<void>();
  submitted = output<void>();

  onMethodChange(method: PaymentMethod): void {
    this.currentMethod().value.set(method);
  }

  protected readonly PaymentMethodEnum = PaymentMethod;
}