import {Component, input, model, output, signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-autocomplete-input',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './autocomplete-input.html'
})
export class AutocompleteInput {
  value = model<number>(0);
  forceTouched = input<boolean>(false);
  valueTouched = output<void>();
  options = input<{ id: number, name: string }[]>([])
  inputValue = signal<string>("");
  placeHolder = input<string>("")
  selected = output<number>()

  showBrands = signal<boolean>(false)

  filterBrands($event: Event) {
    const value = ($event.target as HTMLInputElement).value.toLowerCase();
    this.inputValue.set(value); // Sincronizamos el texto
    this.showBrands.set(true);

  }
}
