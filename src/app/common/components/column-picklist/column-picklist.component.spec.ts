import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnPicklistComponent } from './column-picklist.component';

describe('ColumnPicklistComponent', () => {
  let component: ColumnPicklistComponent;
  let fixture: ComponentFixture<ColumnPicklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnPicklistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnPicklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
