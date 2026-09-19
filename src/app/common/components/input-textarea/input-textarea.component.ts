import { Component, input } from '@angular/core';
import { injectNgControl } from '../../functions/injectNgControl';
import { getErrorMessages } from '../../functions/validation';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { NoopValueAccessorDirective } from '../../directives/noopValueAccessor.directive';

@Component({
  selector: 'app-input-textarea',
  hostDirectives: [NoopValueAccessorDirective],
  imports: [ReactiveFormsModule, TextareaModule],
  templateUrl: './input-textarea.component.html',
  styleUrl: './input-textarea.component.scss',
})
export class InputTextareaComponent {
  label = input.required<string>();
  rows = input<number>(5);
  cols = input<number>(20);
  autoResize = input<boolean>(false);
  ngControl = injectNgControl();

  onBlur() {
    const formControl = this.ngControl.control;
    formControl.setValue(formControl.value.trim());
  }
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
