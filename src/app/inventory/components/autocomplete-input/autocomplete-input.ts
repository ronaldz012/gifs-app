import {Component, input, output, signal} from '@angular/core';

@Component({
  selector: 'app-autocomplete-input',
  imports: [],
  templateUrl: './autocomplete-input.html'
})
export class AutocompleteInput {

  options = input<{id:number, name:string}[]>([])
  filteredoptions = signal<{id:number , name: string}[]>([])
  inputValue = signal<string>("");
  placeHolder = input<string>("")
  selected = output<number>()

  showBrands = signal<boolean>(false)
  filterBrands($event: Event) {
    const value = ($event.target as HTMLInputElement).value.toLowerCase();
    this.inputValue.set(value); // Sincronizamos el texto
    this.showBrands.set(true);
    const filtered = this.options().filter(opt =>
      opt.name.toLowerCase().includes(value)
    );

    this.filteredoptions.set(filtered);
  }

  selectOption(option : {id:number, name:string}) {
    this.selected.emit(option.id);
    this.inputValue.set(option.name);
    this.showBrands = signal<boolean>(false)
  }
  onBlur(type: string) {
    // pequeño delay para que el click en la lista se registre antes de cerrar
    setTimeout(() => {
      if (type === 'brands')  this.showBrands.set(false);
    }, 150);
  }


}
