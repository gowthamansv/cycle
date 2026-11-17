import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { AppConfigService } from '../app.config.service';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../models/api.models';

describe('UserService CRUD Operations', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        AppConfigService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('GET /api/users: should fetch technicians and update users signal', () => {
    const mockUsers: UserResponse[] = [
      {
        id: 'user-guid-1',
        firstName: 'Anand',
        lastName: 'Elango',
        email: 'anand@freewheel.com',
        phoneNumber: '+15551234567',
        isActive: true,
        createdAt: '2026-11-17T00:00:00Z',
        roles: [{ id: 'role-1', name: 'Admin' }],
        groups: [{ id: 'group-1', name: 'Service Team' }]
      }
    ];

    expect(service.users().length).toBe(0);

    service.getUsers().subscribe((data) => {
      expect(data).toEqual(mockUsers);
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('api/users') && r.method === 'GET');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);

    expect(service.users()).toEqual(mockUsers);
    expect(service.isLoading()).toBe(false);
  });

  it('POST /api/users: should create a technician', () => {
    const newReq: CreateUserRequest = {
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah@freewheel.com',
      phoneNumber: '+15559876543',
      password: 'SecurePassword123!',
      roleIds: ['role-1'],
      groupIds: ['group-1']
    };

    const mockResponse = {
      id: 'new-user-guid',
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah@freewheel.com',
      phoneNumber: '+15559876543',
      isActive: true,
      createdAt: '2026-11-17T12:00:00Z'
    };

    service.createUser(newReq).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('api/users') && r.method === 'POST');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newReq);
    req.flush(mockResponse);
  });

  it('PUT /api/users/{id}: should update a technician', () => {
    const updateReq: UpdateUserRequest = {
      id: 'user-guid-1',
      firstName: 'Anand',
      lastName: 'Updated',
      email: 'anand.updated@freewheel.com',
      phoneNumber: '+15559998888',
      isActive: true,
      roleIds: ['role-1'],
      groupIds: ['group-1']
    };

    const mockResponse = {
      id: 'user-guid-1',
      firstName: 'Anand',
      lastName: 'Updated',
      email: 'anand.updated@freewheel.com',
      phoneNumber: '+15559998888',
      isActive: true,
      createdAt: '2026-11-17T00:00:00Z'
    };

    service.updateUser('user-guid-1', updateReq).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('api/users/user-guid-1') && r.method === 'PUT');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateReq);
    req.flush(mockResponse);
  });

  it('DELETE /api/users/{id}: should delete a technician and remove from local signal', () => {
    service.users.set([
      {
        id: 'user-guid-1',
        firstName: 'Anand',
        lastName: 'Elango',
        email: 'anand@freewheel.com',
        phoneNumber: '+15551234567',
        isActive: true
      },
      {
        id: 'user-guid-2',
        firstName: 'Bob',
        lastName: 'Builder',
        email: 'bob@freewheel.com',
        phoneNumber: '+15552223333',
        isActive: true
      }
    ]);

    expect(service.users().length).toBe(2);

    service.deleteUser('user-guid-1').subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('api/users/user-guid-1') && r.method === 'DELETE');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(service.users().length).toBe(1);
    expect(service.users()[0].id).toBe('user-guid-2');
  });
});
