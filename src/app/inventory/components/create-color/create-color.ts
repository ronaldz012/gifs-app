import {Component, ElementRef, inject, input, OnInit, output, ViewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Color} from '../../dtos/Colors/color';
import {ColorService} from '../../services/color-service';


@Component({
  selector: 'app-create-color',
  imports: [ReactiveFormsModule],
  templateUrl: './create-color.html',
  styles: ``,
})
export default class CreateColor implements OnInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  private fb = inject(FormBuilder);
  initialName = input.required<string>();
  colorService = inject(ColorService);
  created = output<Color>();
  closed = output<void>();

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3), Validators.pattern(/^[A-Za-z]{3}$/)]]
  });

  ngOnInit(): void {
    this.form.controls.name.setValue(this.initialName());
  }

  focus() {
    this.nameInput?.nativeElement.focus();
  }

  onCodeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
    this.form.controls.code.setValue(input.value, {emitEvent: false});
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const body = this.form.getRawValue();
    this.colorService.create({name: body.name!, code: body.code!.toUpperCase()
    }).subscribe({
      next: data => {
        this.created.emit(data);
        this.form.reset();
      },
      error: err => {
        // TODO: manejar 400 con toast
      }
    });
  }

  get nameInvalid() {
    const ctrl = this.form.get('name')!;
    return ctrl.invalid && ctrl.touched;
  }

  get codeInvalid() {
    const ctrl = this.form.get('code')!;
    return ctrl.invalid && ctrl.touched;
  }

  get codeErrorMessage() {
    const ctrl = this.form.get('code')!;
    if (ctrl.hasError('required')) return 'El código es requerido';
    if (ctrl.hasError('minlength') || ctrl.hasError('maxlength')) return 'Debe tener exactamente 3 letras';
    if (ctrl.hasError('pattern')) return 'Solo se permiten letras';
    return '';
  }
}
