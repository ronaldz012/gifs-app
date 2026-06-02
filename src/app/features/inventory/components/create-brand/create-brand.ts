import {Component, ElementRef, inject, input, OnInit, output, ViewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Brand} from '../../dtos/brands/brand-dto';
import { BrandService } from '@features/inventory/services/brand-service';

@Component({
  selector: 'app-create-brand',
  imports: [ReactiveFormsModule],
  templateUrl: './create-brand.html',
  styles: ``,
})
export default class CreateBrand implements OnInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  private fb = inject(FormBuilder);
  initialName = input.required<string>();
  brandService = inject(BrandService);
  created = output<Brand>();
  closed = output<void>();

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    prefix:      ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3), Validators.pattern(/^[A-Za-z]{3}$/)]],
    description: ['']
  });

  ngOnInit(): void {
    this.form.controls.name.setValue(this.initialName());
  }

  focus() {
    this.nameInput?.nativeElement.focus();
  }

  onPrefixInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
    this.form.controls.prefix.setValue(input.value, { emitEvent: false });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const body = this.form.getRawValue();
    this.brandService.create({
      name:        body.name!,
      prefix:      body.prefix!.toUpperCase(),
      description: body.description!
    }).subscribe(data => {
      this.created.emit(data);
    });
    this.form.reset();
  }

  get nameInvalid() {
    const ctrl = this.form.get('name')!;
    return ctrl.invalid && ctrl.touched;
  }

  get prefixInvalid() {
    const ctrl = this.form.get('prefix')!;
    return ctrl.invalid && ctrl.touched;
  }

  get prefixErrorMessage() {
    const ctrl = this.form.get('prefix')!;
    if (ctrl.hasError('required')) return 'El prefijo es requerido';
    if (ctrl.hasError('minlength') || ctrl.hasError('maxlength')) return 'Debe tener exactamente 3 letras';
    if (ctrl.hasError('pattern')) return 'Solo se permiten letras';
    return '';
  }
}
