import { Component, input } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { NoopValueAccessorDirective } from '../../directives/noopValueAccessor.directive';
import { injectNgControl } from '../../functions/injectNgControl';
import { getErrorMessages } from '../../functions/validation';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-input-checkbox',
  hostDirectives: [NoopValueAccessorDirective],
  imports: [ReactiveFormsModule, CheckboxModule],
  templateUrl: './input-checkbox.component.html',
  styleUrl: './input-checkbox.component.scss',
})
export class InputCheckboxComponent {
  label = input.required<string>();
  group = input<boolean>(true);
  binary = input<boolean>(true);
  disabled = input<boolean>(true);
  ngControl = injectNgControl();

  hasError() {
    const formControl = this.ngControl.control;
    return formControl && (formControl.touched || formControl.dirty) && formControl.invalid;
  }

  getErrors() {
    const formControl = this.ngControl.control;
    return formControl ? getErrorMessages(formControl.errors, this.label()) : [];
  }
  isRequired() {
    return this.ngControl.control?.hasValidator(Validators.required);
  }
  computdLabel() {
    if (this.label()) return this.label() + (this.isRequired() ? ' *' : '');
    return this.label();
  }
}
