import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-styled-back-btn',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './styled-back-btn.component.html',
    styleUrl: './styled-back-btn.component.scss',
})
export class StyledBackBtnComponent {
    onClick = output<void>();

    OnClick() {
        this.onClick.emit();
    }
}
