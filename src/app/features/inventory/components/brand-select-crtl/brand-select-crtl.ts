import { Component, computed, input, output, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Brand } from '@features/inventory/dtos/brands/brand-dto';
import CreateBrand from '../create-brand/create-brand';
import SelectCtrl from '@shared/components/selec-from-list-ctrl';

@Component({
  selector: 'app-brand-select-ctrl',
  standalone: true,
  imports: [SelectCtrl, CreateBrand],
  template: `
    <div class="relative w-full">
      <app-select-ctrl
        [ctrl]="ctrl()"
        [options]="brandOptions()"
        [placeholder]="placeholder()"
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
  ctrl        = input.required<FormControl>();
  brands      = input<Brand[]>([]);
  placeholder = input<string>('Marca...');

  brandCreated = output<Brand>();

  showCreate  = signal(false);
  createQuery = signal('');

  brandOptions = computed(() =>
    this.brands().map(b => ({ id: b.id, name: b.name }))
  );

  openInlineCreate(query: string) {
    this.createQuery.set(query);
    this.showCreate.set(true);
  }

  closeInlineCreate() {
    this.showCreate.set(false);
    this.createQuery.set('');
  }

  onCreated(brand: Brand) {
    this.ctrl().setValue(brand.id);
    this.ctrl().markAsTouched();
    this.closeInlineCreate();
    this.brandCreated.emit(brand);
  }
}
