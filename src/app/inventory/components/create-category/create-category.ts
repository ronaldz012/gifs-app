import {Component, ElementRef, inject, output, signal, ViewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-create-category',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './create-category.html',
  styles: ``,
})
export class CreateCategory {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  private fb = inject(FormBuilder);

  created = output<{ name: string; description: string }>();
  closed  = output<void>();

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  focus() {
    // El padre puede llamar esto con viewChild para hacer autofocus
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
