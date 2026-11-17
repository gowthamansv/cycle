import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CycleService } from './cycle.service';
import { AppConfigService } from '../app.config.service';
import { CreateCycleRequest, CreateCycleResponse, Cycle, CycleServiceInfoResponse } from '../models/api.models';

describe('CycleService', () => {
  let service: CycleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CycleService,
        AppConfigService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CycleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('GET /api/cycles: should fetch bicycles and update cycles and isLoading signals', () => {
    const mockCycles: Cycle[] = [
      {
        id: 'c1a2b3d4-1234-4567-8901-123456789012',
        customerId: 'a1b2c3d4-1234-4567-8901-123456789012',
        customerName: 'Gowtham',
        model: 'Trek Marlin 7',
        serialNumber: 'TRK-001',
        qrToken: 'accb3b22-d52b-48c2-8f63-0e7d8b6bf655',
        createdAt: '2026-11-17T10:00:00'
      }
    ];

    let received: Cycle[] | undefined;
    service.getCycles().subscribe((data) => {
      received = data;
    });

    expect(service.isLoading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url.endsWith('api/cycles') && r.method === 'GET');
    req.flush(mockCycles);

    expect(received).toEqual(mockCycles);
    expect(service.cycles()).toEqual(mockCycles);
    expect(service.isLoading()).toBe(false);
  });

  it('GET /api/cycles: should reset isLoading when request fails', () => {
    let errored = false;
    service.getCycles().subscribe({
      error: () => {
        errored = true;
      }
    });

    expect(service.isLoading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url.endsWith('api/cycles') && r.method === 'GET');
    req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

    expect(errored).toBe(true);
    expect(service.isLoading()).toBe(false);
  });

  it('POST /api/cycles: should create a bicycle without firing duplicate GET requests', () => {
    const payload: CreateCycleRequest = {
      customerId: 'a1b2c3d4-1234-4567-8901-123456789012',
      model: 'Trek Marlin 7',
      serialNumber: 'TRK-001'
    };

    const mockResponse: CreateCycleResponse = {
      id: 'c1a2b3d4-1234-4567-8901-123456789012',
      customerId: payload.customerId,
      model: payload.model,
      serialNumber: payload.serialNumber,
      qrToken: 'accb3b22-d52b-48c2-8f63-0e7d8b6bf655',
      createdAt: '2026-11-17T10:00:00'
    };

    let received: CreateCycleResponse | undefined;
    service.createCycle(payload).subscribe((res) => {
      received = res;
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('api/cycles') && r.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);

    expect(received).toEqual(mockResponse);
  });

  it('GET /api/cycles/{id}/service-info: should fetch bicycle service info', () => {
    const cycleId = 'c1a2b3d4-1234-4567-8901-123456789012';
    const mockInfo: CycleServiceInfoResponse = {
      cycleId,
      model: 'Trek Marlin 7',
      serialNumber: 'TRK-001',
      customer: {
        id: 'a1b2c3d4-1234-4567-8901-123456789012',
        name: 'Gowtham',
        phoneNumber: '+919999999999',
        email: 'gowtham@example.com'
      },
      currentService: null,
      previousServices: []
    };

    let received: CycleServiceInfoResponse | undefined;
    service.getCycleServiceInfo(cycleId).subscribe((res) => {
      received = res;
    });

    const req = httpMock.expectOne((r) => r.url.endsWith(`api/cycles/${cycleId}/service-info`) && r.method === 'GET');
    req.flush(mockInfo);

    expect(received).toEqual(mockInfo);
  });
});
