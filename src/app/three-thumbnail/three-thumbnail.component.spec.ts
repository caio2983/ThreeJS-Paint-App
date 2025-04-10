import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeThumbnailComponent } from './three-thumbnail.component';

describe('ThreeThumbnailComponent', () => {
  let component: ThreeThumbnailComponent;
  let fixture: ComponentFixture<ThreeThumbnailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeThumbnailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
