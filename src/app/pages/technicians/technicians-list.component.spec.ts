import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TechniciansListComponent } from './technicians-list.component';
import { UserService } from '../../services/user.service';
import { MiscService } from '../../services/misc.service';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../common/services/auth.service';
import { AppNotificationService } from '../../common/services/notification.service';
import { UserResponse, CreateUserResponse, UpdateUserResponse } from '../../models/api.models';

describe('TechniciansListComponent', () => {
  let component: TechniciansListComponent;
  let fixture: ComponentFixture<TechniciansListComponent>;
  let userServiceMock: any;
  let miscServiceMock: any;
  let ticketServiceMock: any;
  let authServiceMock: any;
  let notificationServiceMock: any;

  const mockUsers: UserResponse[] = [
    {
      id: 'tech-1',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus@workshop.com',
      phoneNumber: '+15551234567',
      isActive: true,
      roles: [{ id: 'role-1', name: 'Employee' }],
      groups: [{ id: 'group-1', name: 'Service Team' }]
    },
    {
      id: 'tech-2',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena@workshop.com',
      phoneNumber: '+15559876543',
      isActive: false,
      roles: [{ id: 'role-2', name: 'Admin' }],
      groups: []
    }
  ];

  beforeEach(async () => {
    userServiceMock = {
      users: vi.fn(() => mockUsers),
      isLoading: vi.fn(() => false),
      getUsers: vi.fn(() => of(mockUsers)),
      createUser: vi.fn(() => of({ id: 'tech-3', firstName: 'New', lastName: 'Tech', email: 'new@workshop.com', phoneNumber: '+15553334444', isActive: true, createdAt: '' } as CreateUserResponse)),
      updateUser: vi.fn(() => of({ id: 'tech-1', firstName: 'Marcus', lastName: 'Updated', email: 'marcus@workshop.com', phoneNumber: '+15551234567', isActive: true, createdAt: '' } as UpdateUserResponse)),
      deleteUser: vi.fn(() => of(void 0))
    };

    miscServiceMock = {
      users: { set: vi.fn() },
      roles: vi.fn(() => [{ id: 'role-1', name: 'Employee' }]),
      groups: vi.fn(() => [{ id: 'group-1', name: 'Service Team' }]),
      getRoles: vi.fn(() => of([{ id: 'role-1', name: 'Employee' }])),
      getGroups: vi.fn(() => of([{ id: 'group-1', name: 'Service Team' }])),
      isLoading: vi.fn(() => false)
    };

    ticketServiceMock = {
      tickets: vi.fn(() => []),
      getTickets: vi.fn(() => of([]))
    };

    authServiceMock = {
      isAdmin: vi.fn(() => true),
      isAuthenticated: vi.fn(() => true)
    };

    notificationServiceMock = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showApiSuccess: vi.fn(),
      handleApiError: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TechniciansListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
        { provide: MiscService, useValue: miscServiceMock },
        { provide: TicketService, useValue: ticketServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: AppNotificationService, useValue: notificationServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TechniciansListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and load staff members via GET /api/users', () => {
    expect(userServiceMock.getUsers).toHaveBeenCalled();
    expect(miscServiceMock.getRoles).toHaveBeenCalled();
    expect(miscServiceMock.getGroups).toHaveBeenCalled();
    expect(ticketServiceMock.getTickets).toHaveBeenCalled();
  });

  describe('Create Technician (POST /api/users)', () => {
    it('should validate required fields before submission', () => {
      component.openAddUserModal();
      component.newUser.firstName = '';
      component.newUser.email = '';
      component.newUser.phoneNumber = '';

      component.saveUser();

      expect(notificationServiceMock.showWarning).toHaveBeenCalledWith(
        'Incomplete Details',
        expect.any(String)
      );
      expect(userServiceMock.createUser).not.toHaveBeenCalled();
    });

    it('should submit valid payload and handle successful creation', () => {
      component.openAddUserModal();
      component.newUser.firstName = 'Jane';
      component.newUser.lastName = 'Doe';
      component.newUser.email = 'jane@example.com';
      component.newUser.phoneNumber = '+15553334444';
      component.newUser.password = 'Password123!';
      component.newUser.roleIds = ['role-1'];

      component.saveUser();

      expect(userServiceMock.createUser).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phoneNumber: '+15553334444',
        password: 'Password123!',
        roleIds: ['role-1']
      }));
      expect(component.addUserDialogVisible).toBe(false);
      expect(notificationServiceMock.showApiSuccess).toHaveBeenCalledWith('create', 'Technician', expect.any(String));
    });
  });

  describe('Update Technician (PUT /api/users/{id})', () => {
    it('should populate edit form with existing technician data and blank password', () => {
      const selected = mockUsers[0];
      component.openEditUserModal(selected);

      expect(component.editUserDialogVisible).toBe(true);
      expect(component.editUser.id).toBe('tech-1');
      expect(component.editUser.firstName).toBe('Marcus');
      expect(component.editUser.lastName).toBe('Vance');
      expect(component.editUser.email).toBe('marcus@workshop.com');
      expect(component.editUser.phoneNumber).toBe('+15551234567');
      expect(component.editUser.password).toBe(''); // Never populated!
      expect(component.editUser.roleIds).toEqual(['role-1']);
      expect(component.editUser.groupIds).toEqual(['group-1']);
      expect(component.editUser.isActive).toBe(true);
    });

    it('should update without password when password field is empty', () => {
      component.openEditUserModal(mockUsers[0]);
      component.editUser.firstName = 'Marcus Updated';
      component.editUser.password = ''; // empty

      component.updateUser();

      expect(userServiceMock.updateUser).toHaveBeenCalledWith('tech-1', expect.objectContaining({
        id: 'tech-1',
        firstName: 'Marcus Updated',
        lastName: 'Vance',
        email: 'marcus@workshop.com',
        phoneNumber: '+15551234567'
      }));

      // Verify password was NOT included in payload
      const sentPayload = userServiceMock.updateUser.mock.calls[0][1];
      expect(sentPayload.password).toBeUndefined();
      expect(component.editUserDialogVisible).toBe(false);
      expect(notificationServiceMock.showApiSuccess).toHaveBeenCalledWith('update', 'Technician', expect.any(String));
    });

    it('should update with new password when password field is entered', () => {
      component.openEditUserModal(mockUsers[0]);
      component.editUser.password = 'BrandNewPassword123!';

      component.updateUser();

      const sentPayload = userServiceMock.updateUser.mock.calls[0][1];
      expect(sentPayload.password).toBe('BrandNewPassword123!');
    });
  });

  describe('Delete Technician (DELETE /api/users/{id})', () => {
    it('should open confirmation dialog showing technician name', () => {
      component.openDeleteUserDialog(mockUsers[0]);

      expect(component.deleteUserDialogVisible).toBe(true);
      expect(component.technicianToDelete).toBe(mockUsers[0]);
      expect(component.technicianToDeleteName).toBe('Marcus Vance');
    });

    it('should NOT call delete API if user cancels', () => {
      component.openDeleteUserDialog(mockUsers[0]);
      component.deleteUserDialogVisible = false; // Cancelled

      expect(userServiceMock.deleteUser).not.toHaveBeenCalled();
    });

    it('should call DELETE /api/users/{id} on confirmation and refresh list', () => {
      component.openDeleteUserDialog(mockUsers[0]);
      component.confirmDeleteUser();

      expect(userServiceMock.deleteUser).toHaveBeenCalledWith('tech-1');
      expect(component.deleteUserDialogVisible).toBe(false);
      expect(notificationServiceMock.showApiSuccess).toHaveBeenCalledWith('delete', 'Technician', expect.any(String));
    });

    it('should handle API failure gracefully without corrupted state', () => {
      userServiceMock.deleteUser.mockReturnValueOnce(throwError(() => new Error('Server error')));

      component.openDeleteUserDialog(mockUsers[0]);
      component.confirmDeleteUser();

      expect(notificationServiceMock.handleApiError).toHaveBeenCalledWith('delete technician', expect.any(Error));
      expect(component.isDeleting).toBe(false);
    });
  });
});
