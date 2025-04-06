import { TestBed } from '@angular/core/testing';

import { BrushServiceService } from './brush-service.service';

describe('BrushServiceService', () => {
  let service: BrushServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrushServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
