import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Brand } from '@features/inventory/dtos/brands/brand-dto';
import CreateBrand from '../create-brand/create-brand';
import SelectCtrl from '@shared/components/selec-from-list-ctrl';
import { FieldState } from '@angular/forms/signals';
import { BrandService } from '@features/inventory/services/brand-service';

@Component({
  selector: 'app-brand-select-ctrl',
  standalone: true,
  imports: [SelectCtrl, CreateBrand],
  template: `
    <div class="relative w-full">
      <app-select-ctrl
        [fieldState]="fieldId()"
        [options]="brandOptions()"
        [placeholder]="placeholder()"
        (selected)="brandSelected($event)"
        (createNew)="openInlineCreate($event)"
      />
      @if (showCreate()) {
        <div class="absolute z-110 w-full mt-1">
          <app-create-brand
            [initialName]="createQuery()"
            (created)="onCreated($event)"
            (closed)="closeInlineCreate()"
          />
        </div>
      }
    </div>
  `,
})
export class BrandSelectCtrl {

  fieldId        = input.required<FieldState<GUID>>();
  fieldName       = input.required<FieldState<string>>();
  service = inject(BrandService);
  brands      = this.service.brands;
  
  placeholder = input<string>('Marca...');


  showCreate  = signal(false);
  createQuery = signal('');

  brandOptions = computed(() =>
    this.brands().map(b => ({ id: b.id, displayName: b.name }))
  );

  brandSelected($event: GUID) {
    const brand = this.brands().find(b => b.id === $event);
    this.fieldName().setControlValue(brand?.name ?? '');
    
  }

  openInlineCreate(query: string) {
    this.createQuery.set(query);
    this.showCreate.set(true);
  }

  closeInlineCreate() {
    this.showCreate.set(false);
    this.createQuery.set('');
  }

  onCreated(brand: Brand) {
    this.service.add(brand);
    this.fieldId().setControlValue(brand.id);
    this.fieldId().markAsTouched();
    this.closeInlineCreate();
  }
}
