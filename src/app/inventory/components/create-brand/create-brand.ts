import {Component, ElementRef, inject, output, ViewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';


@Component({
  selector: 'app-create-brand',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './create-brand.html',
  styles: ``,
})
export class CreateBrand {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  private fb = inject(FormBuilder);

  created = output<{ name: string; description: string }>();
  closed  = output<void>();

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  focus() {
    this.nameInput?.nativeElement.focus();
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, description } = this.form.getRawValue();
    this.created.emit({ name: name!.trim(), description: description ?? '' });
    this.form.reset();
  }

  get nameInvalid() {
    const ctrl = this.form.get('name')!;
    return ctrl.invalid && ctrl.touched;
  }
}
