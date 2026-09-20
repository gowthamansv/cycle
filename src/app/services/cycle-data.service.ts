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
  AppointmentStatus,
  BicycleType
} from '../models/cycle-management.models';

@Injectable({
  providedIn: 'root'
})
export class CycleDataService {
  // Reactive Signals for in-memory state
  private ticketsSignal = signal<ServiceTicket[]>([
    {
      id: 'TCK-1001',
      customerId: 'CUST-001',
      cycleId: 'BIKE-001',
      customerName: 'Marcus Vance',
      cycleModel: 'Trek Domane SL 6 (2023)',
      serialNumber: 'WTU230C8912P',
      companyName: 'Vance Logistics',
      statusId: 'IN_PROGRESS',
      status: 'In Progress',
      priorityId: 'HIGH',
      priority: 'High',
      assigneeId: 'TECH-001',
      assigneeName: 'Alex Rivera',
      contactPhone: '+1 (555) 234-8901',
      contactEmail: 'marcus.vance@example.com',
      description: 'Hydraulic disc brake bleeding and Shimano Di2 gear indexing calibration.',
      estimatedCost: 145,
      category: 'Drivetrain & Brakes',
      createdAt: '2026-09-18 09:30',
      updatedAt: '2026-09-20 10:15',
      enabled: true
    },
    {
      id: 'TCK-1002',
      customerId: 'CUST-002',
      cycleId: 'BIKE-003',
      customerName: 'Elena Rostova',
      cycleModel: 'Specialized Stumpjumper EVO',
      serialNumber: 'WSBC60108920K',
      companyName: 'Aero Dynamics Co.',
      statusId: 'ASSIGNED',
      status: 'Assigned',
      priorityId: 'MEDIUM',
      priority: 'Medium',
      assigneeId: 'TECH-002',
      assigneeName: 'David Chen',
      contactPhone: '+1 (555) 345-6712',
      contactEmail: 'elena.rostova@example.com',
      description: 'Fox Float 36 Fork lower leg service and rear shock seal rebuild.',
      estimatedCost: 220,
      category: 'Suspension',
      createdAt: '2026-09-19 11:20',
      updatedAt: '2026-09-20 08:30',
      enabled: true
    },
    {
      id: 'TCK-1003',
      customerId: 'CUST-003',
      cycleId: 'BIKE-004',
      customerName: 'Samantha Reed',
      cycleModel: 'Cannondale Topstone Carbon 2',
      serialNumber: 'CM219084A09',
      companyName: 'Apex Velo Club',
      statusId: 'WAITING',
      status: 'Waiting',
      priorityId: 'URGENT',
      priority: 'Urgent',
      assigneeId: 'TECH-001',
      assigneeName: 'Alex Rivera',
      contactPhone: '+1 (555) 456-7890',
      contactEmail: 'sam.reed@example.com',
      description: 'Tubeless tire sealant recharge, cassette replacement, and bottom bracket creak diagnosis.',
      estimatedCost: 180,
      category: 'Overhaul',
      createdAt: '2026-09-20 08:15',
      updatedAt: '2026-09-20 08:15',
      enabled: true
    },
    {
      id: 'TCK-1004',
      customerId: 'CUST-004',
      cycleId: 'BIKE-005',
      customerName: 'Carlos Gomez',
      cycleModel: 'Giant Defy Advanced Pro',
      serialNumber: 'GNT9923841C',
      companyName: 'Gomez Design Studio',
      statusId: 'COMPLETED',
      status: 'Completed',
      priorityId: 'LOW',
      priority: 'Low',
      assigneeId: 'TECH-003',
      assigneeName: 'Sara Jenkins',
      contactPhone: '+1 (555) 567-8901',
      contactEmail: 'carlos.g@example.com',
      description: 'Annual full tune-up, headset bearings cleaning, and chain lubrication.',
      estimatedCost: 110,
      category: 'Annual Tune-up',
      createdAt: '2026-09-16 14:00',
      updatedAt: '2026-09-19 16:45',
      enabled: true
    },
    {
      id: 'TCK-1005',
      customerId: 'CUST-005',
      cycleId: 'BIKE-007',
      customerName: 'Liam O’Connor',
      cycleModel: 'Specialized Turbo Vado 4.0 E-Bike',
      serialNumber: 'SPE90284711M',
      companyName: 'Urban Commute Inc',
      statusId: 'IN_PROGRESS',
      status: 'In Progress',
      priorityId: 'HIGH',
      priority: 'High',
      assigneeId: 'TECH-002',
      assigneeName: 'David Chen',
      contactPhone: '+1 (555) 678-9012',
      contactEmail: 'liam.oc@example.com',
      description: 'Brose motor firmware update, battery health diagnostic check, and brake pad replacement.',
      estimatedCost: 165,
      category: 'E-Bike Diagnostics',
      createdAt: '2026-09-19 16:00',
      updatedAt: '2026-09-20 09:00',
      enabled: true
    },
    {
      id: 'TCK-1006',
      customerId: 'CUST-006',
      cycleId: 'BIKE-008',
      customerName: 'Priya Sharma',
      cycleModel: 'Santa Cruz Megatower C',
      serialNumber: 'SCZ8810294B',
      companyName: 'Cascade Mountain Club',
      statusId: 'WAITING',
      status: 'Waiting',
      priorityId: 'MEDIUM',
      priority: 'Medium',
      assigneeId: 'TECH-004',
      assigneeName: 'Michael Scott',
      contactPhone: '+1 (555) 789-0123',
      contactEmail: 'priya.sharma@example.com',
      description: 'Dropper seatpost bleed, rear derailleur hanger alignment, and spoke tension check.',
      estimatedCost: 95,
      category: 'General Maintenance',
      createdAt: '2026-09-20 09:45',
      updatedAt: '2026-09-20 09:45',
      enabled: true
    },
    {
      id: 'TCK-1007',
      customerId: 'CUST-001',
      cycleId: 'BIKE-002',
      customerName: 'Marcus Vance',
      cycleModel: 'Canyon Grizl CF SL 8',
      serialNumber: 'CYN4920481G',
      companyName: 'Vance Logistics',
      statusId: 'COMPLETED',
      status: 'Completed',
      priorityId: 'MEDIUM',
      priority: 'Medium',
      assigneeId: 'TECH-001',
      assigneeName: 'Alex Rivera',
      contactPhone: '+1 (555) 234-8901',
      contactEmail: 'marcus.vance@example.com',
      description: 'Gravel wheel truing, bar tape replacement, and rotor replacement.',
      estimatedCost: 130,
      category: 'Wheel & Cockpit',
      createdAt: '2026-09-15 10:00',
      updatedAt: '2026-09-17 15:30',
      enabled: true
    },
    {
      id: 'TCK-1008',
      customerId: 'CUST-007',
      cycleId: 'BIKE-009',
      customerName: 'Nathaniel Drake',
      cycleModel: 'Pinarello Dogma F12',
      serialNumber: 'PIN7712093X',
      companyName: 'Drake Ventures',
      statusId: 'CANCELLED',
      status: 'Cancelled',
      priorityId: 'LOW',
      priority: 'Low',
      assigneeId: 'TECH-003',
      assigneeName: 'Sara Jenkins',
      contactPhone: '+1 (555) 890-1234',
      contactEmail: 'nathaniel.d@example.com',
      description: 'Customer rescheduled appointment to next month.',
      estimatedCost: 0,
      category: 'Diagnostics',
      createdAt: '2026-09-14 13:20',
      updatedAt: '2026-09-15 09:10',
      enabled: false
    }
  ]);

  private appointmentsSignal = signal<Appointment[]>([
    {
      id: 'APT-301',
      customerId: 'CUST-001',
      customerName: 'Marcus Vance',
      contactPhone: '+1 (555) 234-8901',
      cycleId: 'BIKE-001',
      cycleModel: 'Trek Domane SL 6',
      cycleType: 'Road',
      serviceType: 'Hydraulic Brake Bleed & Gear Tuning',
      technicianId: 'TECH-001',
      technicianName: 'Alex Rivera',
      date: '2026-09-20',
      time: '09:30 AM',
      status: 'In Service',
      notes: 'Customer requested ready before 4:00 PM for weekend race.',
      createdAt: '2026-09-18 10:00'
    },
    {
      id: 'APT-302',
      customerId: 'CUST-003',
      customerName: 'Samantha Reed',
      contactPhone: '+1 (555) 456-7890',
      cycleId: 'BIKE-004',
      cycleModel: 'Cannondale Topstone Carbon',
      cycleType: 'Gravel',
      serviceType: 'Tubeless Setup & Cassette Swap',
      technicianId: 'TECH-001',
      technicianName: 'Alex Rivera',
      date: '2026-09-20',
      time: '11:00 AM',
      status: 'Confirmed',
      notes: 'Client brings own Orange Seal sealant.',
      createdAt: '2026-09-19 14:30'
    },
    {
      id: 'APT-303',
      customerId: 'CUST-005',
      customerName: 'Liam O’Connor',
      contactPhone: '+1 (555) 678-9012',
      cycleId: 'BIKE-007',
      cycleModel: 'Specialized Turbo Vado 4.0',
      cycleType: 'Electric',
      serviceType: 'E-Bike Motor & Battery Health Check',
      technicianId: 'TECH-002',
      technicianName: 'David Chen',
      date: '2026-09-20',
      time: '02:00 PM',
      status: 'Scheduled',
      notes: 'Battery charger handed in with the bike.',
      createdAt: '2026-09-19 16:45'
    },
    {
      id: 'APT-304',
      customerId: 'CUST-006',
      customerName: 'Priya Sharma',
      contactPhone: '+1 (555) 789-0123',
      cycleId: 'BIKE-008',
      cycleModel: 'Santa Cruz Megatower',
      cycleType: 'Mountain',
      serviceType: 'Dropper Post Bleed & Wheel Truing',
      technicianId: 'TECH-004',
      technicianName: 'Michael Scott',
      date: '2026-09-20',
      time: '03:30 PM',
      status: 'Scheduled',
      notes: 'Check rear derailleur hanger alignment.',
      createdAt: '2026-09-20 08:30'
    },
    {
      id: 'APT-305',
      customerId: 'CUST-002',
      customerName: 'Elena Rostova',
      contactPhone: '+1 (555) 345-6712',
      cycleId: 'BIKE-003',
      cycleModel: 'Specialized Stumpjumper EVO',
      cycleType: 'Mountain',
      serviceType: 'Fox Fork & Rear Shock Overhaul',
      technicianId: 'TECH-002',
      technicianName: 'David Chen',
      date: '2026-09-21',
      time: '10:00 AM',
      status: 'Confirmed',
      notes: 'Replace seals with SKF low-friction green seals.',
      createdAt: '2026-09-19 11:00'
    },
    {
      id: 'APT-306',
      customerId: 'CUST-004',
      customerName: 'Carlos Gomez',
      contactPhone: '+1 (555) 567-8901',
      cycleId: 'BIKE-005',
      cycleModel: 'Giant Defy Advanced Pro',
      cycleType: 'Road',
      serviceType: 'Annual Comprehensive Inspection',
      technicianId: 'TECH-003',
      technicianName: 'Sara Jenkins',
      date: '2026-09-19',
      time: '09:00 AM',
      status: 'Completed',
      notes: 'Customer collected bicycle yesterday afternoon.',
      createdAt: '2026-09-16 12:00'
    }
  ]);

  private serviceJobsSignal = signal<ServiceJob[]>([
    {
      id: 'JOB-501',
      ticketId: 'TCK-1001',
      customerName: 'Marcus Vance',
      customerPhone: '+1 (555) 234-8901',
      bicycleModel: 'Trek Domane SL 6',
      cycleType: 'Road',
      serviceName: 'Hydraulic Disc Brake Bleeding & Di2 Calibration',
      technicianName: 'Alex Rivera',
      technicianId: 'TECH-001',
      scheduledTime: '09:30 AM',
      status: 'In Progress',
      cost: 145,
      progress: 65,
      notes: 'Brake fluid flushed, currently syncing Di2 firmware.',
      date: '2026-09-20',
      partsUsed: [
        { name: 'Shimano Mineral Oil 100ml', qty: 1, price: 18 },
        { name: 'Shimano L05A Resin Pads', qty: 2, price: 42 }
      ]
    },
    {
      id: 'JOB-502',
      ticketId: 'TCK-1002',
      customerName: 'Elena Rostova',
      customerPhone: '+1 (555) 345-6712',
      bicycleModel: 'Specialized Stumpjumper EVO',
      cycleType: 'Mountain',
      serviceName: 'Fox 36 Fork & Rear Shock Rebuild',
      technicianName: 'David Chen',
      technicianId: 'TECH-002',
      scheduledTime: '10:45 AM',
      status: 'Assigned',
      cost: 220,
      progress: 20,
      notes: 'Parts picked from inventory, awaiting wash bay.',
      date: '2026-09-20',
      partsUsed: [
        { name: 'Fox 36mm Dust Wiper Seal Kit', qty: 1, price: 48 },
        { name: 'Fox 20wt Gold Bath Oil 250ml', qty: 1, price: 24 }
      ]
    },
    {
      id: 'JOB-503',
      ticketId: 'TCK-1003',
      customerName: 'Samantha Reed',
      customerPhone: '+1 (555) 456-7890',
      bicycleModel: 'Cannondale Topstone Carbon 2',
      cycleType: 'Gravel',
      serviceName: 'Tubeless Conversion & Drivetrain Creak Fix',
      technicianName: 'Alex Rivera',
      technicianId: 'TECH-001',
      scheduledTime: '01:15 PM',
      status: 'Waiting',
      cost: 180,
      progress: 0,
      notes: 'Bike checked in at reception.',
      date: '2026-09-20'
    },
    {
      id: 'JOB-504',
      ticketId: 'TCK-1005',
      customerName: 'Liam O’Connor',
      customerPhone: '+1 (555) 678-9012',
      bicycleModel: 'Specialized Turbo Vado 4.0 E-Bike',
      cycleType: 'Electric',
      serviceName: 'E-Bike Diagnostics & Pad Replacement',
      technicianName: 'David Chen',
      technicianId: 'TECH-002',
      scheduledTime: '02:30 PM',
      status: 'In Progress',
      cost: 165,
      progress: 80,
      notes: 'Motor test completed successfully, bedding in new brake pads.',
      date: '2026-09-20',
      partsUsed: [
        { name: 'Magura 8.S Sport Disc Brake Pads', qty: 2, price: 46 }
      ]
    },
    {
      id: 'JOB-505',
      ticketId: 'TCK-1004',
      customerName: 'Carlos Gomez',
      customerPhone: '+1 (555) 567-8901',
      bicycleModel: 'Giant Defy Advanced Pro',
      cycleType: 'Road',
      serviceName: 'Annual Pro Tune-up',
      technicianName: 'Sara Jenkins',
      technicianId: 'TECH-003',
      scheduledTime: '08:00 AM',
      status: 'Completed',
      cost: 110,
      progress: 100,
      notes: 'Fully cleaned, adjusted and QC test ridden.',
      date: '2026-09-20',
      partsUsed: [
        { name: 'KMC X11-EL Silver Chain', qty: 1, price: 45 }
      ]
    }
  ]);

  private customersSignal = signal<Customer[]>([
    {
      id: 'CUST-001',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      email: 'marcus.vance@example.com',
      companyName: 'Vance Logistics',
      bicyclesCount: 2,
      activeServicesCount: 1,
      lastServiceDate: '2026-09-20',
      status: 'VIP',
      address: '742 Evergreen Terrace',
      city: 'Portland',
      postalCode: '97201',
      joinDate: '2024-03-15',
      notes: 'Prefers Shimano components and high-pressure tubeless setups.',
      bicycles: [
        { id: 'BIKE-001', brand: 'Trek', model: 'Domane SL 6 (2023)', type: 'Road', serialNumber: 'WTU230C8912P', lastService: '2026-09-20' },
        { id: 'BIKE-002', brand: 'Canyon', model: 'Grizl CF SL 8', type: 'Gravel', serialNumber: 'CYN4920481G', lastService: '2026-09-17' }
      ]
    },
    {
      id: 'CUST-002',
      name: 'Elena Rostova',
      phone: '+1 (555) 345-6712',
      email: 'elena.rostova@example.com',
      companyName: 'Aero Dynamics Co.',
      bicyclesCount: 1,
      activeServicesCount: 1,
      lastServiceDate: '2026-09-20',
      status: 'Active',
      address: '1204 Pine Ridge Road',
      city: 'Boulder',
      postalCode: '80302',
      joinDate: '2025-01-10',
      notes: 'Enduro racer, rides aggressive trails weekly.',
      bicycles: [
        { id: 'BIKE-003', brand: 'Specialized', model: 'Stumpjumper EVO', type: 'Mountain', serialNumber: 'WSBC60108920K', lastService: '2026-09-20' }
      ]
    },
    {
      id: 'CUST-003',
      name: 'Samantha Reed',
      phone: '+1 (555) 456-7890',
      email: 'sam.reed@example.com',
      companyName: 'Apex Velo Club',
      bicyclesCount: 1,
      activeServicesCount: 1,
      lastServiceDate: '2026-09-20',
      status: 'Active',
      address: '582 Skyline Blvd',
      city: 'Seattle',
      postalCode: '98101',
      joinDate: '2024-08-22',
      notes: 'Regular club gravel group rider.',
      bicycles: [
        { id: 'BIKE-004', brand: 'Cannondale', model: 'Topstone Carbon 2', type: 'Gravel', serialNumber: 'CM219084A09', lastService: '2026-09-20' }
      ]
    },
    {
      id: 'CUST-004',
      name: 'Carlos Gomez',
      phone: '+1 (555) 567-8901',
      email: 'carlos.g@example.com',
      companyName: 'Gomez Design Studio',
      bicyclesCount: 2,
      activeServicesCount: 0,
      lastServiceDate: '2026-09-19',
      status: 'Active',
      address: '334 Marina Court',
      city: 'San Francisco',
      postalCode: '94107',
      joinDate: '2023-11-05',
      bicycles: [
        { id: 'BIKE-005', brand: 'Giant', model: 'Defy Advanced Pro', type: 'Road', serialNumber: 'GNT9923841C', lastService: '2026-09-19' },
        { id: 'BIKE-006', brand: 'Brompton', model: 'C Line Explore', type: 'Other', serialNumber: 'BRM7412899Q', lastService: '2026-05-12' }
      ]
    },
    {
      id: 'CUST-005',
      name: 'Liam O’Connor',
      phone: '+1 (555) 678-9012',
      email: 'liam.oc@example.com',
      companyName: 'Urban Commute Inc',
      bicyclesCount: 1,
      activeServicesCount: 1,
      lastServiceDate: '2026-09-20',
      status: 'Active',
      address: '918 Columbia Heights',
      city: 'Portland',
      postalCode: '97205',
      joinDate: '2025-05-18',
      bicycles: [
        { id: 'BIKE-007', brand: 'Specialized', model: 'Turbo Vado 4.0', type: 'Electric', serialNumber: 'SPE90284711M', lastService: '2026-09-20' }
      ]
    },
    {
      id: 'CUST-006',
      name: 'Priya Sharma',
      phone: '+1 (555) 789-0123',
      email: 'priya.sharma@example.com',
      companyName: 'Cascade Mountain Club',
      bicyclesCount: 1,
      activeServicesCount: 1,
      lastServiceDate: '2026-09-20',
      status: 'VIP',
      address: '402 Alpine Meadows',
      city: 'Bend',
      postalCode: '97701',
      joinDate: '2023-04-12',
      bicycles: [
        { id: 'BIKE-008', brand: 'Santa Cruz', model: 'Megatower C', type: 'Mountain', serialNumber: 'SCZ8810294B', lastService: '2026-09-20' }
      ]
    }
  ]);

  private bicyclesSignal = signal<Bicycle[]>([
    {
      id: 'BIKE-001',
      name: 'Marcus’s Road Bike',
      brand: 'Trek',
      model: 'Domane SL 6 (2023)',
      type: 'Road',
      frameNumber: 'FRM-TRK-98124',
      serialNumber: 'WTU230C8912P',
      customerId: 'CUST-001',
      customerName: 'Marcus Vance',
      purchaseDate: '2023-05-10',
      status: 'In Service',
      lastServiceDate: '2026-09-20',
      nextServiceDate: '2027-03-20',
      color: 'Matte Deep Smoke',
      gearSystem: 'Shimano 105 Di2 12-Speed',
      brakeType: 'Hydraulic Disc',
      notes: 'Carbon frame inspected; all clear. Rear tire replaced last month.'
    },
    {
      id: 'BIKE-002',
      name: 'Marcus’s Gravel Explorer',
      brand: 'Canyon',
      model: 'Grizl CF SL 8',
      type: 'Gravel',
      frameNumber: 'FRM-CYN-11204',
      serialNumber: 'CYN4920481G',
      customerId: 'CUST-001',
      customerName: 'Marcus Vance',
      purchaseDate: '2024-02-18',
      status: 'Good',
      lastServiceDate: '2026-09-17',
      nextServiceDate: '2027-03-17',
      color: 'Curry Powder / Black',
      gearSystem: 'Shimano GRX RX810',
      brakeType: 'Hydraulic Disc',
      notes: 'New bar tape installed, sealant refreshed.'
    },
    {
      id: 'BIKE-003',
      name: 'Elena’s Trail Shredder',
      brand: 'Specialized',
      model: 'Stumpjumper EVO',
      type: 'Mountain',
      frameNumber: 'FRM-SPZ-66710',
      serialNumber: 'WSBC60108920K',
      customerId: 'CUST-002',
      customerName: 'Elena Rostova',
      purchaseDate: '2023-09-22',
      status: 'In Service',
      lastServiceDate: '2026-09-20',
      nextServiceDate: '2026-12-20',
      color: 'Gloss Oasis / Metallic White',
      gearSystem: 'SRAM GX Eagle AXS',
      brakeType: 'SRAM Code RS 4-Piston',
      notes: 'Heavy trail usage, requires suspension service every 50 riding hours.'
    },
    {
      id: 'BIKE-004',
      name: 'Samantha’s Topstone',
      brand: 'Cannondale',
      model: 'Topstone Carbon 2',
      type: 'Gravel',
      frameNumber: 'FRM-CND-40918',
      serialNumber: 'CM219084A09',
      customerId: 'CUST-003',
      customerName: 'Samantha Reed',
      purchaseDate: '2024-04-05',
      status: 'Needs Service',
      lastServiceDate: '2026-09-20',
      nextServiceDate: '2027-03-20',
      color: 'Beetle Green',
      gearSystem: 'Shimano GRX 800 2x11',
      brakeType: 'Hydraulic Disc',
      notes: 'Kingpin suspension pivot inspected and torqued to 8Nm.'
    },
    {
      id: 'BIKE-005',
      name: 'Carlos’s Endurance Road',
      brand: 'Giant',
      model: 'Defy Advanced Pro',
      type: 'Road',
      frameNumber: 'FRM-GNT-88290',
      serialNumber: 'GNT9923841C',
      customerId: 'CUST-004',
      customerName: 'Carlos Gomez',
      purchaseDate: '2022-10-14',
      status: 'Ready for Pickup',
      lastServiceDate: '2026-09-19',
      nextServiceDate: '2027-03-19',
      color: 'Metallic Black / Amber Flame',
      gearSystem: 'Shimano Ultegra Di2',
      brakeType: 'Shimano Ultegra Hydraulic',
      notes: 'Full annual service completed. New chain fitted.'
    },
    {
      id: 'BIKE-007',
      name: 'Liam’s City Commuter E-Bike',
      brand: 'Specialized',
      model: 'Turbo Vado 4.0',
      type: 'Electric',
      frameNumber: 'FRM-SPZ-99120',
      serialNumber: 'SPE90284711M',
      customerId: 'CUST-005',
      customerName: 'Liam O’Connor',
      purchaseDate: '2023-08-01',
      status: 'In Service',
      lastServiceDate: '2026-09-20',
      nextServiceDate: '2027-01-20',
      color: 'Cast Black / Silver Reflective',
      gearSystem: 'SRAM NX 11-Speed',
      brakeType: 'Master Cylinder Disc Hydraulic',
      notes: 'Specialized 2.0 Motor - Firmware v8.4.1 installed.'
    },
    {
      id: 'BIKE-008',
      name: 'Priya’s Downhill Rig',
      brand: 'Santa Cruz',
      model: 'Megatower C',
      type: 'Mountain',
      frameNumber: 'FRM-SCZ-33918',
      serialNumber: 'SCZ8810294B',
      customerId: 'CUST-006',
      customerName: 'Priya Sharma',
      purchaseDate: '2023-11-19',
      status: 'Needs Service',
      lastServiceDate: '2026-09-20',
      nextServiceDate: '2027-02-20',
      color: 'Matte Nickel / Gloss Carbon',
      gearSystem: 'SRAM X01 Eagle Mechanical',
      brakeType: 'SRAM Code RSC',
      notes: 'Dropper post requires bleed.'
    }
  ]);

  private techniciansSignal = signal<Technician[]>([
    {
      id: 'TECH-001',
      name: 'Alex Rivera',
      email: 'alex.rivera@cycleservice.com',
      phone: '+1 (555) 101-2001',
      avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/stephenshaw.png',
      specialization: 'Electronic Shifting & Hydraulic Systems',
      activeJobsCount: 2,
      completedJobsCount: 342,
      availability: 'On Job',
      status: 'Active',
      rating: 4.9,
      experienceYears: 8,
      certification: 'Shimano T.E.C. Master, SRAM Certified'
    },
    {
      id: 'TECH-002',
      name: 'David Chen',
      email: 'david.chen@cycleservice.com',
      phone: '+1 (555) 101-2002',
      avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png',
      specialization: 'MTB Suspension Rebuilding & E-Bikes',
      activeJobsCount: 2,
      completedJobsCount: 289,
      availability: 'On Job',
      status: 'Active',
      rating: 4.8,
      experienceYears: 6,
      certification: 'Fox Master Service Tech, Bosch Certified'
    },
    {
      id: 'TECH-003',
      name: 'Sara Jenkins',
      email: 'sara.jenkins@cycleservice.com',
      phone: '+1 (555) 101-2003',
      avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
      specialization: 'Custom Wheel Building & Precision Alignment',
      activeJobsCount: 0,
      completedJobsCount: 410,
      availability: 'Available',
      status: 'Active',
      rating: 5.0,
      experienceYears: 10,
      certification: 'DT Swiss Master Wheel Builder, PBMA Pro'
    },
    {
      id: 'TECH-004',
      name: 'Michael Scott',
      email: 'michael.scott@cycleservice.com',
      phone: '+1 (555) 101-2004',
      avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodomingues.png',
      specialization: 'General Maintenance & Frame Preparation',
      activeJobsCount: 1,
      completedJobsCount: 175,
      availability: 'Available',
      status: 'Active',
      rating: 4.7,
      experienceYears: 4,
      certification: 'Barnett Bicycle Institute Certified'
    }
  ]);

  private inventorySignal = signal<InventoryItem[]>([
    {
      id: 'INV-001',
      sku: 'SHM-PAD-L05A',
      name: 'Shimano L05A Resin Disc Brake Pads',
      category: 'Brakes',
      stock: 38,
      reorderLevel: 15,
      unitPrice: 21.00,
      supplier: 'Shimano North America',
      status: 'In Stock',
      lastRestocked: '2026-09-12'
    },
    {
      id: 'INV-002',
      sku: 'KMC-CHN-X11EL',
      name: 'KMC X11-EL Extra Light 11-Speed Chain',
      category: 'Drivetrain',
      stock: 8,
      reorderLevel: 10,
      unitPrice: 45.00,
      supplier: 'KMC Global Direct',
      status: 'Low Stock',
      lastRestocked: '2026-08-25'
    },
    {
      id: 'INV-003',
      sku: 'FOX-SLS-36MM',
      name: 'Fox 36mm Low Friction Dust Wiper Kit',
      category: 'Fluids & Lubricants',
      stock: 14,
      reorderLevel: 6,
      unitPrice: 48.00,
      supplier: 'Fox Factory US',
      status: 'In Stock',
      lastRestocked: '2026-09-05'
    },
    {
      id: 'INV-004',
      sku: 'STN-SLNT-32OZ',
      name: 'Stan’s NoTubes Tire Sealant 32oz',
      category: 'Tires & Tubes',
      stock: 22,
      reorderLevel: 8,
      unitPrice: 28.50,
      supplier: 'Quality Bicycle Products',
      status: 'In Stock',
      lastRestocked: '2026-09-15'
    },
    {
      id: 'INV-005',
      sku: 'SRM-AXS-BAT',
      name: 'SRAM eTap / AXS Rechargeable Battery',
      category: 'Accessories',
      stock: 3,
      reorderLevel: 5,
      unitPrice: 59.00,
      supplier: 'SRAM Corporation',
      status: 'Low Stock',
      lastRestocked: '2026-08-10'
    },
    {
      id: 'INV-006',
      sku: 'PRK-BOT-TLB',
      name: 'Park Tool Polylube 1000 Grease 1lb',
      category: 'Fluids & Lubricants',
      stock: 19,
      reorderLevel: 5,
      unitPrice: 16.00,
      supplier: 'Park Tool Co.',
      status: 'In Stock',
      lastRestocked: '2026-09-01'
    }
  ]);

  private paymentsSignal = signal<PaymentRecord[]>([
    {
      id: 'PAY-8001',
      invoiceNumber: 'INV-2026-0901',
      customerName: 'Carlos Gomez',
      customerId: 'CUST-004',
      serviceJobId: 'JOB-505',
      serviceName: 'Annual Pro Tune-up',
      amount: 155.00,
      paymentMethod: 'Credit Card',
      status: 'Paid',
      date: '2026-09-20 09:15'
    },
    {
      id: 'PAY-8002',
      invoiceNumber: 'INV-2026-0902',
      customerName: 'Marcus Vance',
      customerId: 'CUST-001',
      serviceJobId: 'JOB-501',
      serviceName: 'Gravel Wheel Truing & Bar Tape',
      amount: 130.00,
      paymentMethod: 'UPI / QR',
      status: 'Paid',
      date: '2026-09-17 16:00'
    },
    {
      id: 'PAY-8003',
      invoiceNumber: 'INV-2026-0903',
      customerName: 'Elena Rostova',
      customerId: 'CUST-002',
      serviceJobId: 'JOB-502',
      serviceName: 'Fox Fork & Rear Shock Rebuild',
      amount: 220.00,
      paymentMethod: 'Credit Card',
      status: 'Pending',
      date: '2026-09-20 10:45'
    },
    {
      id: 'PAY-8004',
      invoiceNumber: 'INV-2026-0904',
      customerName: 'Liam O’Connor',
      customerId: 'CUST-005',
      serviceJobId: 'JOB-504',
      serviceName: 'E-Bike Diagnostics & Pad Replacement',
      amount: 165.00,
      paymentMethod: 'Debit Card',
      status: 'Paid',
      date: '2026-09-20 11:30'
    }
  ]);

  // Read-only public signals
  readonly tickets = this.ticketsSignal.asReadonly();
  readonly appointments = this.appointmentsSignal.asReadonly();
  readonly serviceJobs = this.serviceJobsSignal.asReadonly();
  readonly customers = this.customersSignal.asReadonly();
  readonly bicycles = this.bicyclesSignal.asReadonly();
  readonly technicians = this.techniciansSignal.asReadonly();
  readonly inventory = this.inventorySignal.asReadonly();
  readonly payments = this.paymentsSignal.asReadonly();

  // Computed KPIs for Dashboard
  readonly todaysAppointmentsCount = computed(() =>
    this.appointments().filter(a => a.date === '2026-09-20').length
  );

  readonly activeServiceJobsCount = computed(() =>
    this.serviceJobs().filter(j => j.status === 'In Progress' || j.status === 'Assigned').length
  );

  readonly completedServicesTodayCount = computed(() =>
    this.serviceJobs().filter(j => j.status === 'Completed' && j.date === '2026-09-20').length
  );

  readonly todaysRevenue = computed(() =>
    this.payments()
      .filter(p => p.date.startsWith('2026-09-20') && p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0)
  );

  // Tickets CRUD
  addTicket(dto: CreateServiceTicketDto): Observable<ServiceTicket> {
    const customer = this.customers().find(c => c.id === dto.customerId);
    const bicycle = this.bicycles().find(b => b.id === dto.cycleId);
    const tech = this.technicians().find(t => t.id === dto.assigneeId);

    const newTicket: ServiceTicket = {
      id: `TCK-${1000 + this.tickets().length + 1}`,
      customerId: dto.customerId,
      cycleId: dto.cycleId,
      customerName: customer ? customer.name : 'Unknown Customer',
      cycleModel: bicycle ? `${bicycle.brand} ${bicycle.model}` : 'Custom Bicycle',
      serialNumber: bicycle ? bicycle.serialNumber : 'N/A',
      companyName: dto.companyName || customer?.companyName || 'Private Customer',
      statusId: dto.statusId || 'WAITING',
      status: (dto.statusId === 'IN_PROGRESS' ? 'In Progress' :
               dto.statusId === 'ASSIGNED' ? 'Assigned' :
               dto.statusId === 'COMPLETED' ? 'Completed' :
               dto.statusId === 'CANCELLED' ? 'Cancelled' : 'Waiting') as TicketStatus,
      priorityId: dto.priorityId || 'MEDIUM',
      priority: (dto.priorityId === 'HIGH' ? 'High' :
                 dto.priorityId === 'URGENT' ? 'Urgent' :
                 dto.priorityId === 'LOW' ? 'Low' : 'Medium'),
      assigneeId: dto.assigneeId || 'TECH-001',
      assigneeName: tech ? tech.name : 'Unassigned',
      contactPhone: dto.contactPhone || customer?.phone || '',
      contactEmail: dto.contactEmail || customer?.email || '',
      description: dto.description,
      estimatedCost: dto.estimatedCost || 120,
      category: dto.category || 'General Service',
      createdAt: '2026-09-20 11:45',
      updatedAt: '2026-09-20 11:45',
      enabled: dto.enabled ?? true
    };

    this.ticketsSignal.update(list => [newTicket, ...list]);

    // Also auto-create a linked service job
    const newJob: ServiceJob = {
      id: `JOB-${500 + this.serviceJobs().length + 1}`,
      ticketId: newTicket.id,
      customerName: newTicket.customerName,
      customerPhone: newTicket.contactPhone,
      bicycleModel: newTicket.cycleModel,
      serviceName: newTicket.category || 'General Service',
      technicianName: newTicket.assigneeName,
      technicianId: newTicket.assigneeId,
      scheduledTime: '12:00 PM',
      status: newTicket.status,
      cost: newTicket.estimatedCost || 120,
      progress: newTicket.status === 'In Progress' ? 25 : 0,
      notes: newTicket.description,
      date: '2026-09-20'
    };
    this.serviceJobsSignal.update(list => [newJob, ...list]);

    return of(newTicket).pipe(delay(300));
  }

  updateTicket(id: string, updates: Partial<ServiceTicket>): void {
    this.ticketsSignal.update(list =>
      list.map(t => (t.id === id ? { ...t, ...updates, updatedAt: '2026-09-20 11:50' } : t))
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
      technicianName: dto.technicianName || 'Alex Rivera',
      date: dto.date,
      time: dto.time,
      status: 'Scheduled',
      notes: dto.notes,
      createdAt: '2026-09-20 11:50'
    };

    this.appointmentsSignal.update(list => [newApt, ...list]);
    return of(newApt).pipe(delay(300));
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
      id: `CUST-00${this.customers().length + 1}`,
      joinDate: '2026-09-20',
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
      id: `BIKE-00${this.bicycles().length + 1}`
    };
    this.bicyclesSignal.update(list => [newBike, ...list]);

    // Update customer count
    this.customersSignal.update(list =>
      list.map(c => {
        if (c.id === bike.customerId) {
          const bList = c.bicycles || [];
          return {
            ...c,
            bicyclesCount: c.bicyclesCount + 1,
            bicycles: [...bList, {
              id: newBike.id,
              brand: newBike.brand,
              model: newBike.model,
              type: newBike.type,
              serialNumber: newBike.serialNumber,
              lastService: newBike.lastServiceDate
            }]
          };
        }
        return c;
      })
    );
    return newBike;
  }

  // Technicians
  updateTechnicianStatus(id: string, availability: Technician['availability']): void {
    this.techniciansSignal.update(list =>
      list.map(t => (t.id === id ? { ...t, availability } : t))
    );
  }
}
