import { Component, computed, input } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { NoopValueAccessorDirective } from '../../directives/noopValueAccessor.directive';
import { TranslatePipe } from '@ngx-translate/core';
import { injectNgControl } from '../../functions/injectNgControl';
import { getErrorMessages } from '../../functions/validation';

@Component({
  selector: 'app-input-select',
  hostDirectives: [NoopValueAccessorDirective],
  imports: [ReactiveFormsModule, SelectModule, MultiSelectModule, TranslatePipe],
  templateUrl: './input-select.component.html',
  styleUrl: './input-select.component.scss',
})
export class InputSelectComponent {
  multiple = input<boolean>(false);
  label = input.required<string>();
  options = input<any[]>([]);
  loading = input<boolean>(false);
  optionLabel = input<string>('label');
  optionValue = input<string>('value');
  showClear = input<boolean>(false);
  filter = input<boolean>(false);
  chip = input<boolean>(false);
  virtualScroll = input<boolean>(false);
  virtualScrollItemSize = input<number | null>(null);
  display = computed(() => {
    if (this.chip()) return 'chip';
    else return 'comma';
  });
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
