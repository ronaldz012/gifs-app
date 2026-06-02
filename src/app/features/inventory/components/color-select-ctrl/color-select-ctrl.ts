import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Color } from '../../dtos/Colors/color';
import { FieldState } from '@angular/forms/signals';
import CreateColor from '../create-color/create-color';
import SelectCtrl from '@shared/components/selec-from-list-ctrl';
import { Options } from 'jsbarcode';
import { SelectOption } from '@shared/models/select-option.model';
import { ColorService } from '@features/inventory/services/color-service';

@Component({
  selector: 'app-color-select-ctrl',
  imports: [SelectCtrl, CreateColor],
  template: `
    <div class="relative w-full">
      <app-select-ctrl
        [fieldState]="fieldState()"
        [options]="colorOptions()"
        [placeholder]="placeholder()"
        (createNew)="openInlineCreate($event)"
        />
      @if (showCreate()) {
        <div class="absolute z-110 w-full mt-1">
          <app-create-color
            [initialName]="createQuery()"
            (created)="onCreated($event)"
            (closed)="closeInlineCreate()"
          />
        </div>
      }
    </div>
  `,
})
export class ColorSelectCtrl {

  service = inject(ColorService);
  fieldState   = input.required<FieldState<GUID>>();
  colorCode    = input.required<FieldState<string>>();
  colors       = this.service.colors;
  placeholder  = input<string>('Color...');
  colorCreated = output<Color>();

  colorOptions = computed(() => this.colors().map(c => ({
  id: c.id, displayName: c.name})));


  showCreate  = signal(false);
  createQuery = signal('');

  openInlineCreate(query: string) {
    this.createQuery.set(query);
    this.showCreate.set(true);
  }

  closeInlineCreate() {
    this.showCreate.set(false);
    this.createQuery.set('');
  }

  onCreated(color: Color) {
    this.service.add(color);
    this.fieldState().setControlValue(color.id);
    this.colorCode().setControlValue(color.code);
    this.fieldState().markAsTouched();
    this.closeInlineCreate();
    
  }
}