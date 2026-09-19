import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { NoopValueAccessorDirective } from '../../directives/noopValueAccessor.directive';
import { injectNgControl } from '../../functions/injectNgControl';
import { getErrorMessages } from '../../functions/validation';
import { KeyFilterModule } from 'primeng/keyfilter';

@Component({
  selector: 'app-input-text',
  hostDirectives: [NoopValueAccessorDirective],
  imports: [ReactiveFormsModule, InputTextModule, InputNumberModule, KeyFilterModule],
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.scss',
})
export class InputTextComponent {
  label = input.required<string>();
  type = input<'text' | 'int' | 'number' | 'money' | 'alpha' | 'alphanum'>('text');
  ngControl = injectNgControl();
  // ngOnInit() {
  //     this.ngControl?.valueChanges?.subscribe(() => {
  //     });
  // }
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
