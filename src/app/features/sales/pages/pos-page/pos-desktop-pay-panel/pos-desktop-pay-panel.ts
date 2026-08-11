import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod } from '@features/sales/models/payment-method';
import { Field, FieldState, FieldTree, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-pos-desktop-pay-panel',
  standalone: true,
  imports: [CommonModule, FormField],
  templateUrl: './pos-desktop-pay-panel.html',
})
export class PosDesktopPayPanel {

  total = input.required<number>();
  itemCount = input.required<number>();
  currentMethod = input.required<FieldState<number>>();
  transactionCode = input.required<FieldState<string |null >>();
  submitted = output<void>();
  protected readonly PaymentMethodEnum = PaymentMethod;

  onMethodChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value);
  this.currentMethod().value.set(value as PaymentMethod);
}
}