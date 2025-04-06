import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaintingAreaComponent } from './painting-area.component';

describe('PaintingAreaComponent', () => {
  let component: PaintingAreaComponent;
  let fixture: ComponentFixture<PaintingAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaintingAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaintingAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
