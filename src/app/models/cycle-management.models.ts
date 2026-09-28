export type BicycleType = 'Road' | 'Mountain' | 'Hybrid' | 'BMX' | 'Electric' | 'Gravel' | 'Other';

export type TicketStatus = 'Waiting' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'In Service' | 'Completed' | 'Cancelled' | 'No Show';

export type TechnicianAvailability = 'Available' | 'On Job' | 'On Break' | 'Off Duty';

// FREEWHEEL FACTORY - Service System Taxonomy
export type ServiceDepartment = 
  | 'Bike Service'
  | 'Performance & Race'
  | 'Bike Fit & Ergonomics'
  | 'Suspension Lab'
  | 'Wheels & Tyres'
  | 'Components & Drivetrain'
  | 'Mobile & Event Support'
  | 'Inspection & Digital';

export type DigitalHealthStatus = 'GOOD' | 'ATTENTION_REQUIRED' | 'REPLACE_OR_REPAIR';

export interface SOPCheckItem {
  id: string;
  step: string;
  completed?: boolean;
  notes?: string;
}

export interface ServiceCatalogItem {
  id: string;
  categoryNumber: number;
  code: string;
  name: string;
  department: ServiceDepartment;
  tagline: string;
  description: string;
  icon: string;
  basePrice: number;
  estimatedMinutes: number;
  sopChecklist: string[];
  compatibleBikeTypes: BicycleType[];
  isSignature: boolean;
  signatureBadge?: string;
  includedBenefits?: string[];
}

export interface ComponentHealthItem {
  componentName: string;
  category: 'Frame' | 'Fork' | 'Shock' | 'Wheels' | 'Drivetrain' | 'Brakes' | 'Bearings' | 'Cockpit' | 'Electrical';
  status: DigitalHealthStatus;
  measuredWear?: string;
  technicianNotes?: string;
  actionRequired?: string;
}

export interface DigitalBicyclePassport {
  id: string;
  bikeId: string;
  serialNumber: string;
  frameNumber: string;
  brand: string;
  model: string;
  bikeType: BicycleType;
  ownerName: string;
  ownerPhone: string;
  overallHealthScore: number; // 0 - 100%
  raceReadyStatus: 'PASS' | 'CONDITIONAL' | 'FAIL' | 'NOT_APPLICABLE';
  lastInspectionDate: string;
  inspectorName: string;
  inspectionItems: ComponentHealthItem[];
  verifiedTorqueSpecs: boolean;
  ultrasonicDrivetrainCertified: boolean;
  notes?: string;
  qrCodeToken?: string;
}

export interface BikeFitProfile {
  id: string;
  customerId: string;
  customerName: string;
  bikeModel: string;
  fitDate: string;
  fitterName: string;
  saddleHeightMm: number;
  saddleSetbackMm: number;
  saddleTiltDeg: number;
  reachMm: number;
  dropMm: number;
  stemLengthMm: number;
  handlebarWidthMm: number;
  kneeAngleDeg: number;
  cleatForeAftMm: number;
  cleatAngleDeg: number;
  qFactorMm: number;
  reportNotes?: string;
}

export interface ServiceTicket {
  id: string;
  customerId: string;
  cycleId: string;
  customerName: string;
  cycleModel: string;
  serialNumber: string;
  companyName: string;
  statusId: string;
  status: TicketStatus;
  priorityId: string;
  priority: TicketPriority;
  assigneeId: string;
  assigneeName: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  estimatedCost?: number;
  estimatedMinutes?: number;
  department?: ServiceDepartment;
  serviceCode?: string;
  serviceCatalogId?: string;
  category?: string;
  sopList?: SOPCheckItem[];
  passportId?: string;
  createdAt: string;
  updatedAt: string;
  enabled?: boolean;
}

export interface CreateServiceTicketDto {
  customerId: string;
  cycleId: string;
  companyName: string;
  statusId: string;
  priorityId: string;
  assigneeId: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  category?: string;
  department?: ServiceDepartment;
  serviceCatalogId?: string;
  estimatedCost?: number;
  estimatedMinutes?: number;
  sopList?: SOPCheckItem[];
  enabled?: boolean;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  contactPhone: string;
  cycleId: string;
  cycleModel: string;
  cycleType: BicycleType;
  serviceType: string;
  technicianId: string;
  technicianName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface CreateAppointmentDto {
  customerId: string;
  customerName?: string;
  contactPhone: string;
  cycleId: string;
  cycleModel: string;
  cycleType: BicycleType;
  serviceType: string;
  technicianId: string;
  technicianName?: string;
  date: string;
  time: string;
  notes?: string;
}

export interface ServiceJob {
  id: string;
  ticketId?: string;
  customerName: string;
  customerPhone?: string;
  bicycleModel: string;
  cycleType?: BicycleType;
  serviceName: string;
  department?: ServiceDepartment;
  technicianName: string;
  technicianId?: string;
  scheduledTime: string;
  status: TicketStatus;
  cost: number;
  progress: number;
  notes?: string;
  date: string;
  sopCompletedCount?: number;
  sopTotalCount?: number;
  partsUsed?: { name: string; qty: number; price: number }[];
}

export interface CustomerBicycleSummary {
  id: string;
  brand: string;
  model: string;
  type: BicycleType;
  serialNumber: string;
  lastService: string;
  healthScore?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  companyName?: string;
  bicyclesCount: number;
  activeServicesCount: number;
  lastServiceDate: string;
  status: 'Active' | 'Inactive' | 'VIP';
  address?: string;
  city?: string;
  postalCode?: string;
  joinDate: string;
  notes?: string;
  bicycles?: CustomerBicycleSummary[];
}

export interface Bicycle {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: BicycleType;
  frameNumber: string;
  serialNumber: string;
  customerId: string;
  customerName: string;
  purchaseDate: string;
  status: 'Good' | 'Needs Service' | 'In Service' | 'Ready for Pickup';
  healthScore?: number;
  lastServiceDate: string;
  nextServiceDate: string;
  notes?: string;
  color?: string;
  gearSystem?: string;
  brakeType?: string;
  passportId?: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specialization: string;
  activeJobsCount: number;
  completedJobsCount: number;
  availability: TechnicianAvailability;
  status: 'Active' | 'On Leave' | 'Inactive';
  rating: number;
  experienceYears: number;
  certification?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Drivetrain' | 'Brakes' | 'Tires & Tubes' | 'Wheels' | 'Accessories' | 'Fluids & Lubricants';
  stock: number;
  reorderLevel: number;
  unitPrice: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
}

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  serviceJobId: string;
  serviceName: string;
  amount: number;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'Cash' | 'UPI / QR' | 'Bank Transfer';
  status: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  date: string;
}
