import { DecimalPipe } from "@angular/common";
import { Component, input, output, computed } from "@angular/core";
import { ItemForm } from "@features/inventory/models/variant-form.model";

@Component({
  selector: 'app-reception-item',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './reception-item.html',
})
export class ReceptionItem {


  group  = input.required<ItemForm>();
  remove = output<GUID>();
  edit = output<GUID>();


  totalUnits = computed(() =>
    this.group().variants.reduce((sum, v) => sum + v.quantityReceived!, 0)
  );

  totalCost = computed(() =>
    this.group().variants.reduce((sum, v) => sum + v.quantityReceived! * v.unitCost!, 0)
  );

  onRemove() {
    this.remove.emit(this.group().product.id!);
  }

  onEdit() {
  this.edit.emit(this.group().product.id!);
}
}