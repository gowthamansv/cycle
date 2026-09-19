import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, input } from '@angular/core';
import { InputNumber } from 'primeng/inputnumber';
import { injectNgControl } from '../../functions/injectNgControl';
import { getErrorMessages } from '../../functions/validation';
import { NoopValueAccessorDirective } from '../../directives/noopValueAccessor.directive';

@Component({
  selector: 'app-input-number',
  hostDirectives: [NoopValueAccessorDirective],
  imports: [ReactiveFormsModule, InputNumber],
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.scss',
})
export class InputNumberComponent {
  label = input.required<string>();
  group = input<boolean>(true);
  minFractionDigits = input<number | undefined>(undefined);
  maxFractionDigits = input<number | undefined>(undefined);
  // min = input<number | undefined>(undefined);
  // max = input<number | undefined>(undefined);
  prefix = input<string | undefined>(undefined);
  suffix = input<string | undefined>(undefined);
  type = input<'decimal' | 'currency'>('decimal');
  currency = input<string | undefined>(undefined);

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
