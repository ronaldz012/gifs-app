import { Component, computed, input, output, signal} from '@angular/core';
import {Color} from '../../dtos/Colors/color';
import {FormControl} from '@angular/forms';
import CreateColor from '../create-color/create-color';
import SelectCtrl from '@shared/components/selec-from-list-ctrl';

@Component({
  selector: 'app-color-select-ctrl',
  imports: [
    SelectCtrl,
    CreateColor
  ],
  template: `
    <div class="relative w-full">
      <app-select-ctrl
        [ctrl]="ctrl()"
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
  styles: ``,
})
export class ColorSelectCtrl {
  ctrl        = input.required<FormControl>();
  colors      = input<Color[]>([]);
  placeholder = input<string>('Color...');
  colorOptions = computed(() =>
    this.colors().map(c => ({ id: c.id, name: c.name }))
  );
  // ── Outputs ───────────────────────────────────────────────────────────
  colorCreated = output<Color>();

  // ── State interno ─────────────────────────────────────────────────────
  showCreate  = signal(false);
  createQuery = signal('');


  // ── Handlers ──────────────────────────────────────────────────────────
  openInlineCreate(query: string) {
    this.createQuery.set(query);
    this.showCreate.set(true);
  }

  closeInlineCreate() {
    this.showCreate.set(false);
    this.createQuery.set('');
  }

  onCreated(color: Color) {
    this.ctrl().setValue(color.id);
    this.ctrl().markAsTouched();
    this.closeInlineCreate();
    this.colorCreated.emit(color);
  }

}
