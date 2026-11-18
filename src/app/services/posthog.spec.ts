import { TestBed } from '@angular/core/testing';

import { Posthog } from './posthog';

describe('Posthog', () => {
  let service: Posthog;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Posthog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
