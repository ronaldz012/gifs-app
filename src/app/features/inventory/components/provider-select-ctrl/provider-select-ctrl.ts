import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FieldState } from '@angular/forms/signals';
import { Provider } from '@features/inventory/dtos/providers/provider';
import { ProviderService } from '@features/inventory/services/provider-service';
import CreateProvider from '../create-provider/create-provider';
import SelectCtrl from '@shared/components/selec-from-list-ctrl';

@Component({
  selector: 'app-provider-select-ctrl',
  standalone: true,
  imports: [SelectCtrl, CreateProvider],
  template: `
    <div class="relative w-full">
      <app-select-ctrl
        [fieldState]="fieldId()"
        [options]="providerOptions()"
        [placeholder]="placeholder()"
        (selected)="providerSelected($event)"
        (createNew)="openInlineCreate($event)"
      />
      @if (showCreate()) {
        <div class="absolute z-110 w-full mt-1">
          <app-create-provider
            [initialName]="createQuery()"
            (created)="onCreated($event)"
            (closed)="closeInlineCreate()"
          />
        </div>
      }
    </div>
  `,
})
export default class ProviderSelectCtrl {
  private providerService = inject(ProviderService);

  fieldId = input.required<FieldState<GUID | null>>();
  fieldName = input.required<FieldState<string>>();
  placeholder = input<string>('Proveedor...');

  providerCreated = output<Provider>();

  providerOptions = computed(() =>
    this.providerService.providers().map((p) => ({ id: p.id, displayName: p.name })),
  );

  showCreate = signal(false);
  createQuery = signal('');

  providerSelected(id: GUID): void {
    const found = this.providerOptions().find((o) => o.id === id);
    if (!found) return;
    this.fieldId().value.set(id);
    this.fieldName().value.set(found.displayName);
  }

  openInlineCreate(query: string): void {
    this.createQuery.set(query);
    this.showCreate.set(true);
  }

  closeInlineCreate(): void {
    this.showCreate.set(false);
    this.createQuery.set('');
  }

  onCreated(provider: Provider): void {
    this.providerService.add(provider);

    this.fieldId().value.set(provider.id);
    this.fieldName().value.set(provider.name);
    this.fieldId().markAsTouched();
    this.fieldName().markAsTouched();

    this.providerCreated.emit(provider);

    this.closeInlineCreate();
  }
}