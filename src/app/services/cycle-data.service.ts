import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  ServiceTicket,
  CreateServiceTicketDto,
  Appointment,
  CreateAppointmentDto,
  ServiceJob,
  Customer,
  Bicycle,
  Technician,
  InventoryItem,
  PaymentRecord,
  TicketStatus,
  AppointmentStatus
} from '../models/cycle-management.models';

@Injectable({
  providedIn: 'root'
})
export class CycleDataService {
  // Empty Reactive Signals - No Mock Data
  private ticketsSignal = signal<ServiceTicket[]>([]);
  private appointmentsSignal = signal<Appointment[]>([]);
  private serviceJobsSignal = signal<ServiceJob[]>([]);
  private customersSignal = signal<Customer[]>([]);
  private bicyclesSignal = signal<Bicycle[]>([]);
  private techniciansSignal = signal<Technician[]>([]);
  private inventorySignal = signal<InventoryItem[]>([]);
  private paymentsSignal = signal<PaymentRecord[]>([]);

  // Read-only public signals
  readonly tickets = this.ticketsSignal.asReadonly();
  readonly appointments = this.appointmentsSignal.asReadonly();
  readonly serviceJobs = this.serviceJobsSignal.asReadonly();
  readonly customers = this.customersSignal.asReadonly();
  readonly bicycles = this.bicyclesSignal.asReadonly();
  readonly technicians = this.techniciansSignal.asReadonly();
  readonly inventory = this.inventorySignal.asReadonly();
  readonly payments = this.paymentsSignal.asReadonly();

  // Computed KPIs
  readonly todaysAppointmentsCount = computed(() => this.appointments().length);
  readonly activeServiceJobsCount = computed(() =>
    this.serviceJobs().filter(j => j.status === 'In Progress' || j.status === 'Assigned').length
  );
  readonly completedServicesTodayCount = computed(() =>
    this.serviceJobs().filter(j => j.status === 'Completed').length
  );
  readonly todaysRevenue = computed(() =>
    this.payments()
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0)
  );

  // Tickets CRUD
  createTicket(dto: CreateServiceTicketDto): ServiceTicket {
    const customer = this.customers().find(c => c.id === dto.customerId);
    const bicycle = this.bicycles().find(b => b.id === dto.cycleId);
    const tech = this.technicians().find(t => t.id === dto.assigneeId);

    const newTicket: ServiceTicket = {
      id: `TCK-${1000 + this.tickets().length + 1}`,
      customerId: dto.customerId,
      cycleId: dto.cycleId,
      customerName: customer ? customer.name : 'Customer',
      cycleModel: bicycle ? `${bicycle.brand} ${bicycle.model}` : 'Bicycle',
      serialNumber: bicycle ? bicycle.serialNumber : 'N/A',
      companyName: dto.companyName || customer?.companyName || '',
      statusId: dto.statusId || 'WAITING',
      status: (dto.statusId === 'IN_PROGRESS' ? 'In Progress' :
        dto.statusId === 'ASSIGNED' ? 'Assigned' :
          dto.statusId === 'COMPLETED' ? 'Completed' :
            dto.statusId === 'CANCELLED' ? 'Cancelled' : 'New') as TicketStatus,
      priorityId: dto.priorityId || 'MEDIUM',
      priority: (dto.priorityId === 'HIGH' ? 'High' :
        dto.priorityId === 'URGENT' ? 'Urgent' :
          dto.priorityId === 'LOW' ? 'Low' : 'Medium'),
      assigneeId: dto.assigneeId || '',
      assigneeName: tech ? tech.name : 'Unassigned',
      contactPhone: dto.contactPhone || customer?.phone || '',
      contactEmail: dto.contactEmail || customer?.email || '',
      description: dto.description,
      estimatedCost: dto.estimatedCost || 0,
      estimatedMinutes: dto.estimatedMinutes || 0,
      department: dto.department || 'Bike Service',
      serviceCatalogId: dto.serviceCatalogId,
      category: dto.category || dto.department || 'Bike Service',
      sopList: dto.sopList,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enabled: dto.enabled ?? true,
      udF1: dto.udF1,
      udF2: dto.udF2,
      udF3: dto.udF3,
      udF4: dto.udF4,
      udF5: dto.udF5,
      udF6: dto.udF6,
      udF7: dto.udF7,
      udF8: dto.udF8,
      udF9: dto.udF9,
      udF10: dto.udF10
    };

    this.ticketsSignal.update(list => [newTicket, ...list]);

    const newJob: ServiceJob = {
      id: `JOB-${500 + this.serviceJobs().length + 1}`,
      ticketId: newTicket.id,
      customerName: newTicket.customerName,
      customerPhone: newTicket.contactPhone,
      bicycleModel: newTicket.cycleModel,
      serviceName: newTicket.category || 'Bike Service',
      department: newTicket.department,
      technicianName: newTicket.assigneeName,
      technicianId: newTicket.assigneeId,
      scheduledTime: '12:00 PM',
      status: newTicket.status,
      cost: newTicket.estimatedCost || 0,
      progress: newTicket.status === 'In Progress' ? 25 : 0,
      notes: newTicket.description,
      date: new Date().toISOString().split('T')[0]
    };
    this.serviceJobsSignal.update(list => [newJob, ...list]);

    return newTicket;
  }

  addTicket(dto: CreateServiceTicketDto): Observable<ServiceTicket> {
    const newTicket = this.createTicket(dto);
    return of(newTicket).pipe(delay(200));
  }

  updateTicket(id: string, updates: Partial<ServiceTicket>): void {
    this.ticketsSignal.update(list =>
      list.map(t => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  }

  toggleTicketEnabled(id: string): void {
    this.ticketsSignal.update(list =>
      list.map(t => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  }

  deleteTicket(id: string): void {
    this.ticketsSignal.update(list => list.filter(t => t.id !== id));
  }

  // Appointments CRUD
  addAppointment(dto: CreateAppointmentDto): Observable<Appointment> {
    const newApt: Appointment = {
      id: `APT-${300 + this.appointments().length + 1}`,
      customerId: dto.customerId,
      customerName: dto.customerName || 'Customer',
      contactPhone: dto.contactPhone,
      cycleId: dto.cycleId,
      cycleModel: dto.cycleModel,
      cycleType: dto.cycleType,
      serviceType: dto.serviceType,
      technicianId: dto.technicianId,
      technicianName: dto.technicianName || 'Unassigned',
      date: dto.date,
      time: dto.time,
      status: 'Scheduled',
      notes: dto.notes,
      createdAt: new Date().toISOString()
    };

    this.appointmentsSignal.update(list => [newApt, ...list]);
    return of(newApt).pipe(delay(200));
  }

  updateAppointmentStatus(id: string, status: AppointmentStatus): void {
    this.appointmentsSignal.update(list =>
      list.map(a => (a.id === id ? { ...a, status } : a))
    );
  }

  deleteAppointment(id: string): void {
    this.appointmentsSignal.update(list => list.filter(a => a.id !== id));
  }

  // Service Jobs
  updateJobStatus(id: string, status: TicketStatus): void {
    this.serviceJobsSignal.update(list =>
      list.map(j => {
        if (j.id === id) {
          const progress = status === 'Completed' ? 100 :
            status === 'In Progress' ? 65 :
              status === 'Assigned' ? 25 : 0;
          return { ...j, status, progress };
        }
        return j;
      })
    );
  }

  // Customers
  addCustomer(customer: Omit<Customer, 'id' | 'joinDate' | 'bicyclesCount' | 'activeServicesCount' | 'lastServiceDate'>): Customer {
    const newCust: Customer = {
      ...customer,
      id: `CUST-${Date.now()}`,
      joinDate: new Date().toISOString().split('T')[0],
      bicyclesCount: 0,
      activeServicesCount: 0,
      lastServiceDate: 'Never',
      bicycles: []
    };
    this.customersSignal.update(list => [newCust, ...list]);
    return newCust;
  }

  // Bicycles
  addBicycle(bike: Omit<Bicycle, 'id'>): Bicycle {
    const newBike: Bicycle = {
      ...bike,
      id: `BIKE-${Date.now()}`
    };
    this.bicyclesSignal.update(list => [newBike, ...list]);
    return newBike;
  }

  // Technicians
  updateTechnicianStatus(id: string, availability: Technician['availability']): void {
    this.techniciansSignal.update(list =>
      list.map(t => (t.id === id ? { ...t, availability } : t))
    );
  }
}
