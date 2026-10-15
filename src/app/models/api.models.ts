// Exact Backend API Models and DTOs for Port 7167

// ==========================================
// 1. MISC & LOOKUP MODELS (/api/misc/*)
// ==========================================
export interface MiscRole {
  id: string; // GUID
  name: string;
  description?: string | null;
}

export interface MiscUser {
  id: string; // GUID
  firstName: string;
  lastName?: string | null;
  email?: string | null;
}

export interface MiscStatus {
  id: string; // GUID
  name: string;
}

export interface MiscPriority {
  id: string; // GUID
  name: string;
}

export interface MiscGroup {
  id: string; // GUID
  name: string;
  description?: string | null;
}

export interface MiscCustomer {
  id: string; // GUID
  name: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
}

// ==========================================
// 2. TICKET MODELS (/api/tickets)
// ==========================================
export interface TicketResponseDto {
  id: string; // GUID
  customerId: string; // GUID
  cycleId: string; // GUID
  customerName: string;
  cycleModel: string;
  serialNumber?: string | null;
  companyName?: string | null;
  statusId: string; // GUID
  status: string;
  priorityId: string; // GUID
  priority: string;
  assigneeId?: string | null; // GUID
  assigneeName?: string | null;
  contactPhone: string;
  contactEmail?: string | null;
  description?: string | null;
  createdAt: string; // ISO date-time
  updatedAt?: string | null; // ISO date-time
  // UDF 1-10 (User Defined Fields for Bicycle Service Details)
  udF1?: string | null; // Bicycle Condition at Intake (Good, Fair, Poor, Severely Damaged)
  udF2?: string | null; // Visible Damage / Existing Defects
  udF3?: string | null; // Approximate Distance Used (e.g. 1500 km)
  udF4?: string | null; // Accessories Received (e.g. Pedals, Lights, Bottle Cage)
  udF5?: string | null; // Intake Photos / Attachment Data
  udF6?: string | null; // Requested Service(s) from Catalogue
  udF7?: string | null; // Parts / Components Requiring Attention
  udF8?: string | null; // Mechanic Inspection Findings
  udF9?: string | null; // Repair / Work Performed
  udF10?: string | null; // Parts Replaced & Work Approval
  udf1?: string | null;
  udf2?: string | null;
  udf3?: string | null;
  udf4?: string | null;
  udf5?: string | null;
  udf6?: string | null;
  udf7?: string | null;
  udf8?: string | null;
  udf9?: string | null;
  udf10?: string | null;
}

export interface CustomerCycleLookup {
  id?: string;
  cycleId?: string;
  customerId?: string;
  brand?: string;
  model?: string;
  cycleModel?: string;
  serialNumber?: string | null;
  frameNumber?: string | null;
  bicycleType?: string | null;
  type?: string | null;
  brakeSystem?: string | null;
  brakeType?: string | null;
  drivetrain?: string | null;
  gearSystem?: string | null;
  wheelSize?: string | null;
  tyreSize?: string | null;
  color?: string | null;
  status?: string | null;
  createdAt?: string | null;
}

export interface CreateTicketRequest {
  customerId: string; // GUID, required
  cycleId: string; // GUID, required
  companyName?: string | null;
  statusId: string; // GUID, required
  priorityId: string; // GUID, required
  assigneeId?: string | null; // GUID
  contactPhone: string; // required
  contactEmail?: string | null;
  description?: string | null;
  // UDF 1-10
  udF1?: string | null;
  udF2?: string | null;
  udF3?: string | null;
  udF4?: string | null;
  udF5?: string | null;
  udF6?: string | null;
  udF7?: string | null;
  udF8?: string | null;
  udF9?: string | null;
  udF10?: string | null;
  udf1?: string | null;
  udf2?: string | null;
  udf3?: string | null;
  udf4?: string | null;
  udf5?: string | null;
  udf6?: string | null;
  udf7?: string | null;
  udf8?: string | null;
  udf9?: string | null;
  udf10?: string | null;
}

export interface CreateTicketResponse {
  id: string; // GUID
  customerId: string;
  cycleId: string;
  companyName?: string | null;
  statusId: string;
  priorityId: string;
  assigneeId?: string | null;
  contactPhone: string;
  contactEmail?: string | null;
  description?: string | null;
  createdAt: string;
  udF1?: string | null;
  udF2?: string | null;
  udF3?: string | null;
  udF4?: string | null;
  udF5?: string | null;
  udF6?: string | null;
  udF7?: string | null;
  udF8?: string | null;
  udF9?: string | null;
  udF10?: string | null;
  udf1?: string | null;
  udf2?: string | null;
  udf3?: string | null;
  udf4?: string | null;
  udf5?: string | null;
  udf6?: string | null;
  udf7?: string | null;
  udf8?: string | null;
  udf9?: string | null;
  udf10?: string | null;
}

export interface UpdateTicketRequest {
  statusId?: string | null; // GUID
  priorityId?: string | null; // GUID
  assigneeId?: string | null; // GUID
  contactPhone?: string | null;
  contactEmail?: string | null;
  description?: string | null;
  udF1?: string | null;
  udF2?: string | null;
  udF3?: string | null;
  udF4?: string | null;
  udF5?: string | null;
  udF6?: string | null;
  udF7?: string | null;
  udF8?: string | null;
  udF9?: string | null;
  udF10?: string | null;
  udf1?: string | null;
  udf2?: string | null;
  udf3?: string | null;
  udf4?: string | null;
  udf5?: string | null;
  udf6?: string | null;
  udf7?: string | null;
  udf8?: string | null;
  udf9?: string | null;
  udf10?: string | null;
}

export interface UpdateTicketResponse {
  id: string; // GUID
  customerId: string;
  cycleId: string;
  companyName?: string | null;
  statusId: string;
  priorityId: string;
  assigneeId?: string | null;
  contactPhone: string;
  contactEmail?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  udF1?: string | null;
  udF2?: string | null;
  udF3?: string | null;
  udF4?: string | null;
  udF5?: string | null;
  udF6?: string | null;
  udF7?: string | null;
  udF8?: string | null;
  udF9?: string | null;
  udF10?: string | null;
}

export interface AssignedTicketResponseDto {
  id: string;
  customerId: string;
  cycleId: string;
  customerName: string;
  cycleModel: string;
  serialNumber?: string | null;
  companyName?: string | null;
  statusId: string;
  status: string;
  priorityId: string;
  priority: string;
  contactPhone: string;
  contactEmail?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  udF1?: string | null;
  udF2?: string | null;
  udF3?: string | null;
  udF4?: string | null;
  udF5?: string | null;
  udF6?: string | null;
  udF7?: string | null;
  udF8?: string | null;
  udF9?: string | null;
  udF10?: string | null;
}

// ==========================================
// 3. USER MANAGEMENT MODELS (/api/users)
// ==========================================
export interface CreateUserRequest {
  firstName: string; // required
  lastName?: string | null;
  email?: string | null;
  phoneNumber: string; // required
  password: string; // min 8 chars, required
  roleIds?: string[]; // GUID array
  groupIds?: string[]; // GUID array
}

export interface CreateUserResponse {
  id: string; // GUID
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface FastEndpointsErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

// ==========================================
// 4. CUSTOMER MODELS (/api/customers)
// ==========================================
export interface CreateCustomerRequest {
  name: string; // required
  phoneNumber: string; // required
  email?: string | null;
  address?: string | null;
}

export interface CreateCustomerResponse {
  id: string; // GUID
  name: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  createdAt: string;
}

// ==========================================
// 5. CYCLE MODELS (/api/cycles)
// ==========================================
export interface CreateCycleRequest {
  customerId: string; // GUID, required
  model: string; // required
  serialNumber?: string | null;
}

export interface CreateCycleResponse {
  id: string; // GUID
  customerId: string;
  model: string;
  serialNumber?: string | null;
  qrToken?: string;
  createdAt: string;
}

export interface CycleServiceInfoResponse {
  cycleId: string;
  model?: string | null;
  serialNumber?: string | null;
  customer: {
    id: string;
    name: string;
    phoneNumber?: string | null;
    email?: string | null;
  };
  currentService?: {
    ticketId: string;
    statusId: string;
    status?: string | null;
    priorityId: string;
    priority?: string | null;
    description?: string | null;
    createdAt: string;
    updatedAt?: string | null;
  } | null;
  previousServices: Array<{
    ticketId: string;
    statusId: string;
    status?: string | null;
    priorityId: string;
    priority?: string | null;
    description?: string | null;
    createdAt: string;
    updatedAt?: string | null;
  }>;
}

// ==========================================
// 6. DEMO REQUEST MODELS (/api/demo-requests)
// ==========================================
export interface DemoRequestResponse {
  id: string; // GUID
  name: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  serviceCenterId?: string | null;
  statusId?: string | null;
  createdAt: string;
}

export interface BookDemoRequest {
  name: string; // required
  phoneNumber: string; // required
  email?: string | null;
  address?: string | null;
}

export interface BookDemoResponse {
  id: string; // GUID
  message: string;
  whatsAppUrl?: string | null;
}
