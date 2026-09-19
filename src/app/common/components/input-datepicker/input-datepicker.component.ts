import { Component, input } from '@angular/core';
import { DatePickerModule, DatePickerTypeView } from 'primeng/datepicker';
import { NoopValueAccessorDirective } from '../../directives/noopValueAccessor.directive';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { injectNgControl } from '../../functions/injectNgControl';
import { getErrorMessages } from '../../functions/validation';

@Component({
  selector: 'app-input-datepicker',
  hostDirectives: [NoopValueAccessorDirective],
  imports: [ReactiveFormsModule, DatePickerModule],
  templateUrl: './input-datepicker.component.html',
  styleUrl: './input-datepicker.component.scss',
})
export class InputDatepickerComponent {
  label = input.required<string>();
  dateFormat = input<string>('dd-mm-yy');
  showIcon = input<boolean>(true);
  showButtonBar = input<boolean>(true);
  showTime = input<boolean>(false);
  timeOnly = input<boolean>(false);
  hourFormat = input<'12' | '24'>('12');
  selectionMode = input<'range' | 'single' | 'multiple'>('single');
  minDate = input<Date | null>(null);
  maxDate = input<Date | null>(null);
  view = input<DatePickerTypeView>('date');
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
