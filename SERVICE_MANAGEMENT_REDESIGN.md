# Cycle Service Center - Service Management Redesign Documentation

## 1. User Prompt & Goal
Redesign the Cycle Service Center admin UI into a single unified, clean, and API-driven Service Management experience:
- **Unify `/services` and `/service-jobs`**: Remove duplicate pages and consolidate into a single **Service Management** page under `/services`.
- **Remove Service Catalog & SOPs**: Remove all 20-category / 8-department catalog UI cards, SOP checklists, and separate tabs.
- **Remove Digital Bicycle Passports**: Remove the digital passport verification UI and cards.
- **Remove Predefined Mock Data**: Ensure the page starts completely empty with 0 records when the backend database is empty, removing all fake seed records.
- **API-First Architecture**:
  - `GET /api/tickets` via `TicketService.getTickets()`
  - `POST /api/tickets` via `TicketService.createTicket()`
  - `PUT /api/tickets/{id}` via `TicketService.updateTicket()`
  - `GET /api/misc/*` via `MiscService.loadAllLookups()`
  - Live summary metrics computed dynamically from API responses.
  - Search and filter by status, priority, and technician using real API lookups.
  - Full Create, Edit, and View Service Details modals.
  - Loading, empty, and retryable error states.

---

## 2. API Contracts Inspected
- **Ticket Model (`TicketResponseDto`)**:
  - `id`: GUID
  - `customerId`: GUID
  - `cycleId`: GUID
  - `customerName`: string
  - `cycleModel`: string
  - `serialNumber`: string (optional)
  - `companyName`: string (optional)
  - `statusId`: GUID
  - `status`: string
  - `priorityId`: GUID
  - `priority`: string
  - `assigneeId`: GUID (optional)
  - `assigneeName`: string (optional)
  - `contactPhone`: string
  - `contactEmail`: string (optional)
  - `description`: string (optional)
  - `createdAt`: ISO DateTime
  - `updatedAt`: ISO DateTime (optional)
- **Create Request (`CreateTicketRequest`)**:
  - Exact 9 fields: `customerId`, `cycleId`, `companyName`, `statusId`, `priorityId`, `assigneeId`, `contactPhone`, `contactEmail`, `description`.
- **Update Request (`UpdateTicketRequest`)**:
  - `statusId`, `priorityId`, `assigneeId`, `contactPhone`, `contactEmail`, `description`.
- **Misc Lookups (`/api/misc/*`)**:
  - `/api/misc/statuses`: Status dropdown values
  - `/api/misc/priorities`: Priority dropdown values
  - `/api/misc/users`: Technicians / staff list
  - `/api/misc/customers`: Registered customer lookup

---

## 3. Step-by-Step Implementation & Modified Files

### 1. `src/app/pages/services-mgmt/services-list.component.ts`
- **Replaced**: Entire 3-tab layout (Catalog, Active Tickets, Passports) with a single-page **Service Management** UI.
- **Dynamic Metrics Strip**: Total Services, New, Assigned, In Progress, Completed (computed from `TicketService.tickets()`).
- **Search & Filters**:
  - Real-time search query filter (matches ID, customer, bicycle, technician, phone, email, notes).
  - Status dropdown filter (from `/api/misc/statuses`).
  - Technician dropdown filter (from `/api/misc/users`).
  - Priority dropdown filter (from `/api/misc/priorities`).
  - Clear filter button.
- **Responsive Data Table**:
  - Columns: Service ID (`#GUID`), Customer, Bicycle, Contact, Technician, Priority (Tag), Status (Tag), Created Date, Actions.
  - Row Actions: `[View Details]` and `[Edit Ticket]`.
  - Empty state with `+ Create Service` button when no records match or database is empty.
  - Error banner with `Retry` action if API fails to load.
- **Create Service Modal**: Form with the exact 9 fields, validating and submitting to `POST /api/tickets`.
- **Edit Service Modal**: Form pre-filled with ticket details, submitting updates to `PUT /api/tickets/{id}`.
- **View Service Details Modal**: Read-only structured card displaying all ticket metadata.

### 2. `src/app/pages/services-mgmt/service-form.component.ts`
- **Rewritten**: Removed all extra fields (catalog packages, departments, estimated cost, estimated minutes, notify customer checkbox, file uploads).
- Form strictly aligned with the exact 9-field body: `{ customerId, cycleId, companyName, statusId, priorityId, assigneeId, contactPhone, contactEmail, description }`.

### 3. `src/app/app.routes.ts`
- Added redirect for `/service-jobs` -> `/services` (`{ path: 'service-jobs', redirectTo: 'services', pathMatch: 'full' }`) so both URLs land on the unified Service Management interface.

### 4. `src/app/layout/component/app.menu.ts`
- Under `OPERATIONS`: Retained `Dashboard` and `Services`.
- Removed `Service Jobs` and hardcoded badge values.

### 5. `src/app/layout/component/app.topbar.ts`
- Cleaned up `adminMenuGroups`, `userMenuGroups`, and `structuredMenuItems`.
- Operations now provides a single **Services** menu link pointing to `/services` for both Admin and User roles.

---

## 4. Verification
- Ran `npx ng build --no-progress`.
- Result: **Application bundle generation complete with 0 errors (exit code 0)**.

---

## 5. QR Code Generation & 3cm × 3cm Printing Implementation

### 1. Requirements Implemented:
- Integrated QR code generation directly into the existing **Service Ticket Details** modal.
- Derived the QR content strictly and deterministically from `TicketResponseDto.cycleId`.
- Constructed the endpoint URL via `AppConfigService`:
  `${baseUrl}/api/cycles/${ticket.cycleId}/service-info` (e.g. `https://localhost:7167/api/cycles/{cycleId}/service-info`).
- Validated that if `cycleId` is null/empty, an informative message is shown and invalid QR URLs are never generated.
- Added a **"Print QR"** button (`pi pi-print`) in the modal.
- Configured a dedicated print window with `@media print` rules locking the QR code dimensions to **exactly 3cm × 3cm** (`width: 3cm !important; height: 3cm !important;`).
- Clean printable card output:
  - Header: `CYCLE SERVICE CENTER`
  - Subtitle: `Digital Bicycle Service Passport`
  - QR Code: `3cm × 3cm`
  - Cycle Model & ID: `{cycleModel}`, `Cycle ID: {cycleId}`
  - Scan instruction: `Scan to view bicycle service information`
  - Service Info URL: `{service-info-url}`
- Fully reproducible: Printing 20 times produces the exact same QR code for the same `cycleId`.

### 2. Files Modified / Packages Installed:
- **`qrcode` & `@types/qrcode`**: Installed for vector-crisp base64 data URL rendering.
- **`src/app/pages/services-mgmt/services-list.component.ts`**: Added `AppConfigService`, `QRCode` generation, modal QR section, and print handler.
- **`SERVICE_MANAGEMENT_REDESIGN.md`**: Updated with full architectural documentation.

---

## 6. Dynamic Live Misc API Lookup on Edit & Create
- **Eliminated Manual Feeding**: Whenever the **Edit** or **Create** button is clicked, the application executes `MiscService.loadAllLookups()` to hit:
  - `GET /api/misc/statuses` for status options
  - `GET /api/misc/priorities` for priority options
  - `GET /api/misc/users` for technician/assignee options
  - `GET /api/misc/customers` for customer options
- **Intelligent Field Matching**: In `openEditDialog(ticket)`:
  - Dynamically binds and matches `statusId` by GUID or name match against fresh backend statuses.
  - Dynamically binds and matches `priorityId` by GUID or name match against fresh backend priorities.
  - Dynamically binds and matches `assigneeId` by GUID or name match against fresh backend user list.
- Guarantees that any changes to staff, priorities, or statuses on the backend are instantly reflected upon opening the Edit modal without needing a hard page reload.

---

## 7. Customer Table and Dropdown Options from `/api/misc/customers`
- **Customers Table**: Refactored `CustomersListComponent` ([customers-list.component.ts](file:///c:/Users/gowth/Desktop/cycle/src/app/pages/customers/customers-list.component.ts)) to bind its main data table directly to `MiscService.getCustomers()` (`GET /api/misc/customers`).
- **Live Search & Metrics**: Real-time filtering across customer names, phone numbers, emails, addresses, and GUIDs.
- **Add Customer Flow**:
  - Submits to `POST /api/customers` via `CustomerService.createCustomer()`.
  - Immediately re-fetches `GET /api/misc/customers` to update the customer table and all customer lookup dropdowns across the application without manual state manipulation.
- **Customer Options**: Used universally across Service creation, Service filtering, and Bicycle management via `MiscService.customers()` signal.

---

## 8. Menu Search with Live Suggestions & Removal of In-Page Search Inputs

### 1. In-Page Search Removal:
- Completely removed in-page search text inputs, search-related variables (`searchQuery`), and search-matching filtering expressions across all pages:
  - **Services Management** ([`services-list.component.ts`](file:///c:/Users/gowth/Desktop/cycle/src/app/pages/services-mgmt/services-list.component.ts))
  - **Customers Directory** ([`customers-list.component.ts`](file:///c:/Users/gowth/Desktop/cycle/src/app/pages/customers/customers-list.component.ts))
  - **Bicycles Fleet** ([`bicycles-list.component.ts`](file:///c:/Users/gowth/Desktop/cycle/src/app/pages/bicycles/bicycles-list.component.ts))
  - **Appointments** ([`appointments-list.component.ts`](file:///c:/Users/gowth/Desktop/cycle/src/app/pages/appointments/appointments-list.component.ts))
  - **Service Jobs** ([`service-jobs-list.component.ts`](file:///c:/Users/gowth/Desktop/cycle/src/app/pages/service-jobs/service-jobs-list.component.ts))
- Retained category dropdown filters (Status, Technician, Priority, Bicycle Type, Date Filter) and reset buttons on each page.

### 2. Topbar Menu Search with Live Suggestions:
- Implemented menu search in the top navigation bar ([`app.topbar.ts`](file:///c:/Users/gowth/Desktop/cycle/src/app/layout/component/app.topbar.ts)):
  - Real-time suggestions dropdown overlay upon typing in either desktop or mobile search bar.
  - Matches across menu titles, section categories, descriptions, and route paths.
  - Displays category badges, icons, page titles, and descriptions.
  - Clicking any suggestion executes direct route navigation and clears the search query.
