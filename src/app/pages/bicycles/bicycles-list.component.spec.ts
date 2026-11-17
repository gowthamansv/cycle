import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { BicyclesListComponent } from './bicycles-list.component';
import { CycleService } from '../../services/cycle.service';
import { MiscService } from '../../services/misc.service';
import { AuthService } from '../../common/services/auth.service';
import { AppNotificationService } from '../../common/services/notification.service';
import { AppConfigService } from '../../app.config.service';
import { CreateCycleResponse, Cycle, MiscCustomer } from '../../models/api.models';

describe('BicyclesListComponent', () => {
  let component: BicyclesListComponent;
  let fixture: ComponentFixture<BicyclesListComponent>;

  let cycleServiceMock: {
    getCycles: ReturnType<typeof vi.fn>;
    createCycle: ReturnType<typeof vi.fn>;
    getCycleServiceInfo: ReturnType<typeof vi.fn>;
  };
  let miscServiceMock: {
    getCustomers: ReturnType<typeof vi.fn>;
  };
  let authServiceMock: {
    isAdmin: ReturnType<typeof vi.fn>;
  };
  let notificationServiceMock: {
    showSuccess: ReturnType<typeof vi.fn>;
    showError: ReturnType<typeof vi.fn>;
    showWarning: ReturnType<typeof vi.fn>;
    showApiSuccess: ReturnType<typeof vi.fn>;
    handleApiError: ReturnType<typeof vi.fn>;
  };

  const mockCycles: Cycle[] = [
    {
      id: 'c1a2b3d4-1234-4567-8901-123456789012',
      customerId: 'a1b2c3d4-1234-4567-8901-123456789012',
      customerName: 'Gowtham',
      model: 'Trek Marlin 7',
      serialNumber: 'TRK-001',
      qrToken: 'accb3b22-d52b-48c2-8f63-0e7d8b6bf655',
      createdAt: '2026-11-17T10:00:00'
    },
    {
      id: 'd2b3c4e5-2345-4567-8901-234567890123',
      customerId: 'b2c3d4e5-2345-4567-8901-234567890123',
      customerName: 'Ananya',
      model: 'Giant Escape 3',
      serialNumber: 'GNT-204',
      qrToken: '11bb22cc-33dd-44ee-55ff-6677889900aa',
      createdAt: '2026-11-16T14:30:00'
    }
  ];

  const mockCustomers: MiscCustomer[] = [
    {
      id: 'a1b2c3d4-1234-4567-8901-123456789012',
      name: 'Gowtham',
      phoneNumber: '+919876543210'
    },
    {
      id: 'b2c3d4e5-2345-4567-8901-234567890123',
      name: 'Ananya',
      phoneNumber: '+919123456789'
    }
  ];

  async function setup(options?: {
    isAdmin?: boolean;
    cycles$?: ReturnType<typeof of<Cycle[]>> | Subject<Cycle[]>;
  }): Promise<void> {
    const isAdmin = options?.isAdmin ?? true;
    const cycles$ = options?.cycles$ ?? of(mockCycles);

    cycleServiceMock = {
      getCycles: vi.fn(() => cycles$),
      createCycle: vi.fn(() =>
        of({
          id: 'new-cycle-id',
          customerId: mockCustomers[0].id,
          model: 'Specialized Allez',
          serialNumber: 'SPC-777',
          qrToken: 'qr-token-new',
          createdAt: '2026-11-17T12:00:00'
        } as CreateCycleResponse)
      ),
      getCycleServiceInfo: vi.fn()
    };

    miscServiceMock = {
      getCustomers: vi.fn(() => of(mockCustomers))
    };

    authServiceMock = {
      isAdmin: vi.fn(() => isAdmin)
    };

    notificationServiceMock = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showApiSuccess: vi.fn(),
      handleApiError: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BicyclesListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        AppConfigService,
        { provide: CycleService, useValue: cycleServiceMock },
        { provide: MiscService, useValue: miscServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: AppNotificationService, useValue: notificationServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BicyclesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should call GET /api/cycles on initialization, remove temporary notice, and render mapped fields', async () => {
    await setup();

    expect(cycleServiceMock.getCycles).toHaveBeenCalledTimes(1);
    expect(component.bicycles()).toEqual(mockCycles);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('GET /api/cycles is not available');
    expect(text).not.toContain('structurally prepared for future GET endpoint release');

    expect(text).toContain('Trek Marlin 7');
    expect(text).toContain('Gowtham');
    expect(text).toContain('TRK-001');
    expect(text).toContain('accb3b22-d52b-48c2-8f63-0e7d8b6bf655');
    expect(text).toContain('Giant Escape 3');
    expect(text).toContain('Ananya');
  });

  it('should not show empty state while GET /api/cycles is loading', async () => {
    const pending$ = new Subject<Cycle[]>();
    await setup({ cycles$: pending$ });

    expect(component.isLoading()).toBe(true);
    const loadingText = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(loadingText).not.toContain('No bicycles found.');

    pending$.next([]);
    pending$.complete();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    const emptyText = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(emptyText).toContain('No bicycles found.');
  });

  it('should display error notification and error banner when GET /api/cycles fails', async () => {
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    await setup({ cycles$: throwError(() => httpError) });

    expect(component.isLoading()).toBe(false);
    expect(component.loadError()).toBe(true);
    expect(notificationServiceMock.handleApiError).toHaveBeenCalledWith(
      'load bicycles',
      httpError,
      'Unable to load bicycles. Please check your connection and try again.'
    );

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Unable to load bicycles');
  });

  it('should filter bicycles by search query and customer, and reset filters', async () => {
    await setup();

    component.searchQuery.set('Marlin');
    expect(component.filteredCycles().length).toBe(1);
    expect(component.filteredCycles()[0].id).toBe(mockCycles[0].id);

    component.searchQuery.set('GNT-204');
    expect(component.filteredCycles().length).toBe(1);
    expect(component.filteredCycles()[0].customerName).toBe('Ananya');

    component.searchQuery.set('');
    component.selectedCustomerId.set(mockCycles[0].customerId);
    expect(component.filteredCycles().length).toBe(1);
    expect(component.filteredCycles()[0].customerName).toBe('Gowtham');

    component.resetFilters();
    expect(component.filteredCycles().length).toBe(2);
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('should create a bicycle via POST /api/cycles and refresh the list without duplicate calls', async () => {
    await setup();
    expect(cycleServiceMock.getCycles).toHaveBeenCalledTimes(1);

    component.openAddModal();
    component.newBike.brand = 'Specialized';
    component.newBike.model = 'Allez';
    component.newBike.serialNumber = 'SPC-777';
    component.newBike.customerId = mockCustomers[0].id;

    component.saveBicycle();

    expect(cycleServiceMock.createCycle).toHaveBeenCalledWith({
      customerId: mockCustomers[0].id,
      model: 'Specialized Allez',
      serialNumber: 'SPC-777'
    });
    expect(notificationServiceMock.showApiSuccess).toHaveBeenCalled();
    expect(cycleServiceMock.getCycles).toHaveBeenCalledTimes(2);
    expect(component.addDialogVisible).toBe(false);
  });

  it('should open QR dialog with service-info endpoint for a bicycle', async () => {
    await setup();

    component.openQrDialog(mockCycles[0]);

    expect(component.qrDialogVisible).toBe(true);
    expect(component.selectedCycleForQr).toEqual(mockCycles[0]);
    expect(component.qrServiceInfoUrl()).toContain(`/api/cycles/${mockCycles[0].id}/service-info`);
  });

  it('should avoid unnecessary GET /api/cycles call for non-admin create-only view', async () => {
    await setup({ isAdmin: false });

    expect(cycleServiceMock.getCycles).not.toHaveBeenCalled();
    expect(miscServiceMock.getCustomers).toHaveBeenCalledTimes(1);
  });
});
