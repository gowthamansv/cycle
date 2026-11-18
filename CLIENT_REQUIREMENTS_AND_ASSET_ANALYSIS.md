# Freewheel Factory / Cycle Service Center — Complete Project Analysis & Client Requirements Report

**Document Type:** Technical, Functional & Client Asset Collection Analysis  
**Project Root:** `/Users/shyamsv/Desktop/cycle`  
**Frontend Package:** `admin-cy` (Angular 21.2 + PrimeNG 21 + Tailwind CSS 4)  
**Backend API Contract:** `swagger.json` (`Cycle App v1.0.0`, ASP.NET Core / FastEndpoints, configured at `https://c-api-7x7e.onrender.com/`)  
**Analysis Date:** November 17, 2026  
**Prepared From:** Direct static inspection of all frontend source files, routes, services, models, assets, `swagger.json`, `public/config.json`, `docs/FREEWHEEL_FACTORY_SERVICES_SPECIFICATION.md`, `SERVICE_MANAGEMENT_REDESIGN.md`, and `Freewheel_Factory_Dashboard_Full_Audit_Report.md`.

> **Evidence & Scope Notice:**  
> This report strictly distinguishes between **(a) Confirmed / Implemented** functionality observed in the actual codebase, **(b) Scaffolded / Planned / Unrouted** components present in the repository but not live or not backend-connected, and **(c) Missing / Recommended** client content, photography, and features. No business facts, pricing, or service guarantees have been invented; all placeholder figures found in code (e.g., INR `₹` prices in `FreewheelCatalogService` or `$` symbols in unrouted components) are explicitly flagged for client confirmation.

---

## Table of Contents
1. [Application Overview](#1-application-overview)
2. [Complete Page & Module Analysis](#2-complete-page--module-analysis)
3. [Client Image & Photography Requirements](#3-client-image--photography-requirements)
4. [Complete Business Services Analysis](#4-complete-business-services-analysis)
5. [Client Business Information Requirements](#5-client-business-information-requirements)
6. [Appointment & Booking Requirements](#6-appointment--booking-requirements)
7. [Admin & Operational Requirements](#7-admin--operational-requirements)
8. [Missing Information & Gap Analysis](#8-missing-information--gap-analysis)
9. [Final Client Requirements Checklist](#9-final-client-requirements-checklist)
10. [Final Recommendations](#10-final-recommendations)

---

## 1. Application Overview

### 1.1 Application Purpose
The existing repository is an **internal web-based Bicycle Service Center Management & Admin Portal** built for **Freewheel Factory** (referred to inconsistently across the UI as *Cycle Service Center*, *Freewheel Factory*, and *Freewheel Service Center*). It manages customer records, registered bicycles, workshop staff/technicians, service intake tickets (with User Defined Fields `udF1`–`udF10`), and printable bicycle QR code stickers linked to a backend service-info endpoint.

A public landing page (`/landing`) and customer login route (`/login`) exist in `src/app/app.routes.ts`, but both are currently **unmodified PrimeNG Sakai template boilerplate** containing Latin placeholder text (*Lorem Ipsum*), generic SaaS pricing (`$0 / $1 / $5`), and "Welcome to PrimeLand!" copy. Therefore, the application currently functions only as an **internal staff/admin operations dashboard**, while the public-facing customer website remains unbuilt.

### 1.2 Business Objectives
Based on the implemented modules, API contract, and specification documents (`docs/FREEWHEEL_FACTORY_SERVICES_SPECIFICATION.md`, `SERVICE_MANAGEMENT_REDESIGN.md`), the platform aims to:
1. **Digitize Workshop Operations:** Replace paper job cards with structured digital service tickets capturing intake condition, pre-existing defects, accessories handed over, requested services, mechanic diagnostic findings, work performed, and customer approval notes (`UDF1`–`UDF10`).
2. **Centralize Customer & Bicycle Fleet Records:** Maintain a CRM directory of riders and their bicycles (serial numbers, models, QR tokens) linked to historical service tickets.
3. **Enable QR-Based Bicycle Service Tracking:** Generate deterministic, printable 3 cm × 3 cm QR stickers per bicycle so technicians or riders can scan a bike to retrieve current and previous service records.
4. **Support Role-Based Staff Workflows:** Separate full administrative oversight (dashboard analytics, technician management, full fleet list) from front-desk/mechanic day-to-day intake workflows.
5. **Planned Objective (Not Yet Built):** Provide a branded public website (`/landing`, services showcase, customer appointment/demo booking, and customer-accessible QR service passport).

### 1.3 Target Audience
| Audience Segment | Current Support Status | Primary Interactions |
|---|---|---|
| **Workshop Administrators / Owners** | **Implemented (Core)** | Dashboard KPIs, ticket lifecycle management, customer CRM, bicycle fleet & QR printing, staff management. |
| **Workshop Mechanics / Front-Desk Staff (`Employee` role)** | **Implemented (Partial)** | View/create/edit service tickets, register new customers, register new bicycles. |
| **Bicycle Owners / Customers** | **Not Implemented** | Planned public website browsing, online service booking, customer portal login, and QR-code service history viewing. |

### 1.4 User Roles
Inspection of `src/app/common/services/auth.service.ts`, `src/app/common/guards/admin.guard.ts`, `src/app/layout/component/app.topbar.ts`, and `Freewheel_Factory_Dashboard_Full_Audit_Report.md` (Section C) shows:

| Role | Backend Role (`GET /api/misc/roles`) | Frontend Guard / Mapping | Access Scope in Current App |
|---|---|---|---|
| **Admin** | `Admin` (`Users with administrative access.`) | `authGuard` + `adminGuard` (`authService.isAdmin()`) | Full access: `/dashboard`, `/services` (CRUD), `/customers` + `/customers/:id`, `/bicycles` (table + modal) + `/bicycles/:id`, `/technicians` + `/technicians/:id`. |
| **Employee / Standard User** | `Employee` (`Users who handle cycle service requests.`) | `authGuard` only (`authService.isUser()`) | Restricted access: `/services` (list, create, edit), `/customers` (directory & add), `/bicycles` (direct Create Bicycle form only—no fleet list). Redirected from `/dashboard` to `/services`. |
| **Customer** | *Not configured in backend* | `UserRole` type includes `'customer'`, `/login` route titled `Customer Login` | **Not implemented.** `/login` is non-functional Sakai boilerplate with no auth logic. |

> **Important Technical Discrepancy Observed:** In `src/app/pages/auth/admin-login.component.ts` (lines 351–353), post-login routing checks `response.user.groups?.some(x => x.name === 'Admin Team')`, whereas `AuthService.loginAdmin()` checks `response.roles[0].name === 'Admin'` to set `isAdmin()`. These two checks can conflict if an Admin user is not in a group literally named `"Admin Team"`.

### 1.5 Main Application Modules
- **Active, Routed & API-Integrated Modules:** Authentication (`/admin/login`), Workshop Operations Dashboard (`/dashboard`), Service Management & Tickets (`/services`, `/services/new`, `/services/:id/edit`), Customer Directory & Profile (`/customers`, `/customers/:id`), Bicycle Fleet & Service History (`/bicycles`, `/bicycles/:id`), Technician/Staff Management (`/technicians`, `/technicians/:id`), QR Code Generation & Printing (embedded in Services & Bicycles modals), Theme Customizer Drawer (`ThemeDrawerComponent`).
- **Routed Boilerplate / Placeholder Modules:** Public Landing (`/landing`), Customer Login (`/login`), Access Denied (`/auth/access`), System Error (`/auth/error`), Leftover Sakai Template Pages (`/documentation`, `/crud`, `/empty`, `/pages/crud`, `/pages/empty`).
- **Built on Disk but Commented Out / Unrouted (Local-Only or Unfinished):** Appointments (`/appointments`, `/appointments/new`), Workshop Settings (`/settings`), Legacy Service Jobs (`/service-jobs` redirects to `/services`), Inventory (`InventoryListComponent`), Payments (`PaymentsListComponent`), Reports (`ReportsDashboardComponent`).
- **Backend Endpoint Present but Unused in UI:** Demo / Booking Requests (`/api/demo-requests` via `DemoService`).

### 1.6 Current Technology Stack
| Layer | Technology / Library | Version / Details | Source Reference |
|---|---|---|---|
| **Frontend Framework** | Angular (Standalone Components, Signals) | `^21.2.0` | `package.json` |
| **UI Component Library** | PrimeNG + PrimeIcons + `@primeuix/themes` (Aura preset customized as `BicyclePreset`) | `^21.1.9` / `^7.0.0` / `^2.0.3` | `package.json`, `src/app/theme/bicycle-theme.preset.ts` |
| **CSS Framework** | Tailwind CSS + `tailwindcss-primeui` + PostCSS | `^4.3.3` / `^0.6.1` | `package.json`, `src/assets/tailwind.css` |
| **Charts & Visualization** | Chart.js (via PrimeNG `p-chart`) | `^4.4.2` | `package.json`, `service-activity.component.ts` |
| **QR Code Engine** | `qrcode` + `@types/qrcode` | `^1.5.4` | `package.json`, `services-list.component.ts`, `bicycles-list.component.ts` |
| **Rich Text / i18n (Installed, Unused)** | `quill` (`^2.0.3`), `@ngx-translate/core` (`^18.0.0`) | Installed in `package.json`, not wired to core pages | `package.json` |
| **Testing** | Vitest + JSDOM | `^4.0.8` / `^28.0.0` | `package.json`, `angular.json` |
| **Frontend Hosting** | Netlify (SPA `_redirects` configured) | `https://freewheeldashboard.netlify.app/` | `public/_redirects`, `Freewheel_Factory_Dashboard_Full_Audit_Report.md` |
| **Backend API** | ASP.NET Core + FastEndpoints (NSwag OpenAPI 3.0.0) | `Cycle App v1.0.0` (source repo external; contract in `swagger.json`) | `swagger.json` |
| **Backend Hosting** | Render | `https://c-api-7x7e.onrender.com/` (fallback `https://localhost:7167/`) | `public/config.json`, `src/app/app.config.service.ts` |
| **Database (Inferred)** | PostgreSQL (`Npgsql` referenced in error sanitizer) | Accessed exclusively via REST API | `src/app/common/services/notification.service.ts` (L229–230) |
| **Authentication** | JWT Bearer Token (`JWTBearerAuth`) | Stored in `sessionStorage` / `localStorage`, attached via `authInterceptor` | `swagger.json`, `src/app/common/interceptors/auth.interceptor.ts` |

### 1.7 Frontend & Backend Architecture
- **Frontend Architecture:** Single-page application using Angular standalone components, reactive Signals (`signal`, `computed`, `effect`), RxJS HTTP services, functional route guards (`authGuard`, `adminGuard`), and a functional HTTP interceptor (`authInterceptor`) for Bearer token attachment and 401 session-expiry handling. Runtime API configuration is loaded at bootstrap via `provideAppInitializer` reading `public/config.json`.
- **State Split (Live API vs. Legacy In-Memory Store):**
  - **Live Backend Services:** `AuthService`, `TicketService`, `MiscService`, `CustomerService`, `CycleService`, `UserService`, `DemoService`.
  - **Hardcoded Frontend Catalog:** `FreewheelCatalogService` (20 services across 8 departments, used inside `ServiceFormComponent` UDF6 multi-select).
  - **Empty In-Memory Store (`CycleDataService`):** Used only by unrouted/legacy components (`AppointmentsListComponent`, `AppointmentFormComponent`, `ServiceJobsListComponent`, `InventoryListComponent`, `PaymentsListComponent`).
- **Backend Architecture (`swagger.json`):** RESTful vertical-slice endpoints built with FastEndpoints (`CycleMaintenanceFeatures*` / `Cycle_AppFeatures*`). Note that backend source code is **not inside this workspace**; backend capabilities were determined from `swagger.json`, frontend HTTP services, and the live audit results in `Freewheel_Factory_Dashboard_Full_Audit_Report.md`.

### 1.8 Current Application Workflow (How It Supports the Business)
1. **Staff Authentication:** Admin or Employee signs in at `/admin/login` (`POST /api/auth/login`).
2. **Customer Intake:** Staff registers a walk-in/returning rider on `/customers` (`POST /api/customers`) with name, phone, optional email, and address.
3. **Bicycle Registration:** Staff links a bicycle to the customer on `/bicycles` (`POST /api/cycles`), which creates a unique `cycleId` and backend `qrToken`.
4. **Service Ticket Creation:** Staff opens `/services/new`, selects the customer (auto-filling contact details and fetching customer cycles via `GET /api/misc/customers/{customerId}/cycles`), selects the bicycle, enters reported symptoms, selects priority/status/technician from `/api/misc/*`, optionally selects services from the 20-item catalog (`udF6`), and records intake condition (`udF1`), visible damage (`udF2`), mileage (`udF3`), accessories (`udF4`), components needing attention (`udF7`), and photo reference (`udF5`), submitting to `POST /api/tickets`.
5. **Workshop Execution & Updates:** Mechanics or admins open a ticket on `/services` (or `/services/:id/edit`), record inspection findings (`udF8`), work performed (`udF9`), parts replaced & approval (`udF10`), and advance status via `PUT /api/tickets/{ticketId}`.
6. **QR Sticker Printing:** From either `/services` (View Details modal) or `/bicycles` (QR modal), staff generates and prints a 3 cm × 3 cm QR sticker encoding `{apiUrl}/api/cycles/{cycleId}/service-info`.
7. **Operational Monitoring:** Admins view live KPI totals, ticket queues, and 7-day creation/completion trends on `/dashboard`.

---

## 2. Complete Page & Module Analysis

The table below covers every existing, scaffolded, or clearly planned module identified in `src/app/app.routes.ts` and `src/app/pages/`.

| Module / Page | Purpose | Existing Features | Required Client Information | Status |
|---|---|---|---|---|
| **Home / Public Landing Page** (`/landing`, `src/app/pages/landing/*`) | Public-facing marketing homepage introducing the business, services, pricing, and booking entry point. | Route and 6 Sakai template widgets exist (`TopbarWidget`, `HeroWidget`, `FeaturesWidget`, `HighlightsWidget`, `PricingWidget`, `FooterWidget`). Currently displays `SAKAI` branding, Latin placeholder copy, external PrimeFaces CDN images, and SaaS pricing (`$0/$1/$5`). | Official business name, hero headline/tagline, real workshop & bicycle hero photography, verified service highlights, actual service package pricing & currency, customer testimonials, shop address/contact/social links, legal links. | **Template Boilerplate (Incomplete)** |
| **Customer Login** (`/login`, `src/app/pages/auth/login.ts`) | Customer self-service portal authentication. | Routed UI form displaying Sakai SVG and `"Welcome to PrimeLand!"`. Submit button simply links to `/` without calling any auth API. | Confirmation of whether customers will have portal accounts (or passwordless OTP/QR lookup), branding text, password reset policy. | **Template Boilerplate (Non-Functional)** |
| **Admin / Staff Login** (`/admin/login`, `/auth/login`, `src/app/pages/auth/admin-login.component.ts`) | Secure login portal for workshop admins and employees. | Branded dark glassmorphism UI using `assets/images/logo.png`, reactive validation, `POST /api/auth/login`, Remember Me (`localStorage`), return-URL redirect, role-aware routing. *(Note: contains insecure local fallback in `AuthService` and static forgot-password message.)* | Official brand name (`Freewheel Factory` vs `Cycle Service Center`), support contact for password resets, official brand email domain. | **Complete (Needs Security Fix & Brand Alignment)** |
| **Workshop Operations Dashboard** (`/`, `/admin`, `/dashboard`, `src/app/pages/service-dashboard/*`, `statswidget.ts`) | Real-time KPI summary and operational command center for administrators. | Live KPI cards (`Total Tickets`, `Pending Services`, `Completed Services`, `Total Customers`), live paginated ticket table (`ServiceTodayJobsWidget`) with detail modal, 7-day created vs. completed Line Chart (`ServiceActivityWidget`), Incoming Service Intake queue (`TodayScheduleWidget`), Refresh & `+ Add Service` shortcuts. | Confirmation of business KPIs required (e.g., revenue, turnaround SLA, mechanic utilization), target operating hours/timezone. | **Complete (Live API-Driven)** |
| **Service Management & Tickets** (`/services`, `/services/new`, `/services/create`, `/services/:id/edit`, `src/app/pages/services-mgmt/*`) | Core workshop ticket management, bicycle intake inspection, technician workflow, and QR sticker printing. | Live `GET/POST/PUT /api/tickets`; 5 KPI cards (Total, New, Assigned, In Progress, Completed); paginated table; View Details modal with 7-spec breakdown, UDF1–UDF10 display, intake photo display (`udF5`), and 3 cm × 3 cm QR print; Edit modal; full multi-section Create/Edit page (`/services/new`) with 20-item catalog multi-select (`udF6`), component/accessory quick-chips. *(Note: Filter toolbar is commented out in HTML; no search input; `udF5` has no file upload.)* | Confirmed service catalogue (names, prices, durations, currency), exact ticket statuses & priorities, intake checklist items, accessories list, warranty/approval disclaimer text, printed QR sticker brand title. | **Complete (Core) / Partial (Filters & Photo Upload)** |
| **Customer Management (CRM)** (`/customers`, `/customers/:id`, `src/app/pages/customers/*`) | Maintain rider directory, register new customers, and inspect customer profile & history. | Paginated table backed by `GET /api/misc/customers`; Add Customer modal (`POST /api/customers`: name, phone, email, address); View Customer modal; Customer Detail page (`/customers/:id`) with 5 tabs (Profile, Bicycles via `/api/misc/customers/{id}/cycles`, Service History via `/api/tickets`, plus empty placeholder tabs for Appointments & Payments). *(Missing: Edit/Delete customer, in-page search, duplicate email check.)* | Required customer intake fields (e.g., WhatsApp opt-in, emergency contact, riding club/company, GST/tax details if B2B), phone number country format. | **Partial (No Edit/Delete/Search)** |
| **Bicycle Fleet Management** (`/bicycles`, `/bicycles/:id`, `src/app/pages/bicycles/*`) | Register customer bicycles, search fleet, generate/print QR codes, and view per-bicycle service history. | Role-aware view: Employees see direct Create Bicycle form (`POST /api/cycles`); Admins see searchable/filterable fleet table (`GET /api/cycles`), Add Bicycle modal, QR code modal + 3 cm × 3 cm print, and Bicycle Detail page (`/bicycles/:id`) backed by `GET /api/cycles/{id}/service-info`. *(Gap: form collects brand, type, frame#, gear, color, notes, purchase date, but `CreateCycleRequest` only submits `customerId`, `model`, `serialNumber`; `GET /api/cycles` missing from `swagger.json` and returned 405 in audit.)* | Supported bicycle categories/types, mandatory technical specifications to store (brand, frame size, drivetrain, suspension, brake type, e-bike motor/battery), bicycle photo requirements. | **Partial (API Field & Endpoint Gaps)** |
| **QR Code & Bicycle Service Info** (Embedded in `services-list.component.ts`, `bicycles-list.component.ts`, `bicycle-detail.component.ts`) | Label every serviced bike with a scannable 3 cm × 3 cm sticker linking to its service info & history. | Deterministic QR code generated via `qrcode` from `cycleId` pointing to `{apiUrl}/api/cycles/{cycleId}/service-info`; printable 3 cm × 3 cm sticker layout branded `FREEWHEEL SERVICE CENTER`. *(Critical UX Gap: QR points to a JWT-protected raw JSON API endpoint rather than a public human-readable web page!)* | Confirmation of what customers vs. technicians should see when scanning the QR code (public service history page vs. staff-only), exact sticker brand name/logo/phone number. | **Partial (Needs Public Web View & Auth Design)** |
| **Technician / Employee Management** (`/technicians`, `/technicians/:id`, `src/app/pages/technicians/*`) | Manage workshop staff accounts, roles, workshop groups, and view active/completed ticket workload. | Staff directory (`GET /api/users`), 4 workload KPI cards, Create (`POST /api/users`), Edit (`PUT /api/users/{id}`), Delete (`DELETE /api/users/{id}`), role/group multi-selects (`/api/misc/roles`, `/api/misc/groups`), Technician Detail page (`/technicians/:id`) showing assigned tickets. *(Critical Blockers: `POST /api/users` returns HTTP 500 in live audit; `GET/PUT/DELETE /api/users` absent from `swagger.json`; no specializations, certifications, shift hours, or profile photos stored.)* | Staff roster (names, roles, emails, phone numbers), workshop department/group names, mechanic specializations & certifications, staff portrait photos (if shown publicly). | **Partial (Blocked by Backend 500 & Missing Endpoints)** |
| **Appointment Booking** (`/appointments`, `/appointments/new` — **commented out in `app.routes.ts`**; `src/app/pages/appointments/*`; plus `DemoService`) | Schedule customer drop-offs and workshop time slots. | Full UI built (`AppointmentsListComponent`, `AppointmentFormComponent`) with status workflow (`Scheduled → Confirmed → In Service → Completed/Cancelled/No Show`), filters, and 5-step booking form. Uses empty in-memory `CycleDataService` with hardcoded 6 time slots and 7 service packages. Separately, backend exposes `GET/POST /api/demo-requests` returning `whatsAppUrl` (unused in UI). | Working days, opening hours, booking slot intervals, max daily capacity, services bookable online, advance notice, cancellation/rescheduling policy, WhatsApp/SMS notification rules. | **Planned / Disabled (No Backend Appointments API)** |
| **Service History** (Integrated in `/customers/:id` Tab 2 and `/bicycles/:id`) | Track past and current services for each rider and bicycle. | Displays current service and previous tickets matched by `customerId` or `cycleId` from `/api/tickets` and `/api/cycles/{id}/service-info`. *(Note: `/api/cycles/{id}/service-info` returns HTTP 400 when a bicycle has no ticket yet.)* | Retention/display preferences (e.g., whether customers should see parts replaced, mechanic notes, next recommended service date/km). | **Partial (Backend 400 Edge Case)** |
| **Admin / Workshop Settings** (`/settings` — **commented out in `app.routes.ts`**; `src/app/pages/settings/workshop-settings.component.ts`) | Configure workshop details, operating hours, notification toggles, and staff profile/password changes. | Role-aware UI built for Admin (Center Name, Facility Phone, Operating Hours, Hub ID, SMS/Low-Stock toggles) and User (Profile, Change Password, Sound/Email toggles). Currently uses hardcoded US placeholder values (`+1 (555) 789-0011`) and only shows toast notifications with **zero backend persistence**. | Official center name, phone, operating hours, hub/branch IDs, notification rules (SMS/WhatsApp/Email triggers). | **Planned / Disabled (UI Only, No Persistence)** |
| **Legacy Service Jobs** (`/service-jobs` redirects to `/services`; `src/app/pages/service-jobs/service-jobs-list.component.ts`) | Previously tracked workshop job progress and parts used. | Component still on disk (using empty `CycleDataService` and `$` currency), route permanently redirects to `/services` per `SERVICE_MANAGEMENT_REDESIGN.md`. | Confirm whether labor progress % and itemized parts-used billing are needed inside `/services`. | **Deprecated / Redirected** |
| **Inventory & Spare Parts** (Unrouted: `src/app/pages/inventory/inventory-list.component.ts`) | Track spare parts SKUs, stock levels, reorder levels, unit prices, and suppliers. | Standalone table UI exists on disk bound to empty `CycleDataService` (uses `$` currency). Explicitly displays notice: `GET /api/inventory is not provided by the backend service`. | Confirm whether inventory management is in Phase 1 or future phase; if required, supply parts/consumables catalogue, SKUs, suppliers, currency. | **Planned / Unrouted (No Backend API)** |
| **Payments & Invoices** (Unrouted: `src/app/pages/payments/payments-list.component.ts`) | Track service invoices, payment methods (`Credit Card`, `Debit Card`, `Cash`, `UPI / QR`, `Bank Transfer`), and revenue. | Standalone table UI exists on disk bound to empty `CycleDataService` (uses `$` currency). Explicitly notes `GET /api/payments is not provided by the backend service`. | Confirm invoicing/billing requirements, currency (`INR ₹`), GST/tax registration details, accepted payment methods, invoice header/footer details. | **Planned / Unrouted (No Backend API)** |
| **Reports & Analytics** (Unrouted: `src/app/pages/reports/reports-dashboard.component.ts`) | Operational analytics charts (Tickets by Priority doughnut, Tickets by Status bar chart). | Component wired to live `TicketService.getTickets()` with Chart.js charts, but has **no route** in `app.routes.ts` and no menu link in `app.topbar.ts`. | Confirm desired management reports (turnaround time, mechanic productivity, revenue by service, export to CSV/PDF). | **Built / Unrouted** |
| **Error & System Pages** (`/auth/access`, `/auth/error`, `/notfound`) | Handle unauthorized access, system errors, and 404 routes. | Custom bicycle-themed 404 page (`NotFoundComponent`) exists (with hardcoded `"Cycle Service Hub Engine v20.4"` footer). `/auth/access` and `/auth/error` are Sakai boilerplate loading external PrimeFaces SVGs. | Brand name alignment and support contact info for error screens. | **Partial (404 Custom; Access/Error Boilerplate)** |
| **Public Website Pages** *(About Us, Public Services & Details, Gallery, Contact Us, Public Booking)* | Customer-facing business website to attract riders, explain services, build trust, and capture bookings. | **Do not exist** in `src/app/pages/` or `src/app/app.routes.ts` (only placeholder `/landing` exists). | Full business profile, About Us story, photography (shop, bikes, services, team), confirmed services & pricing, Google Maps embed, WhatsApp/phone/email, testimonials, legal policies. | **Missing (Not Implemented)** |

> **Cleanup Note:** Template demo routes (`/documentation`, `/crud`, `/empty`, `/pages/crud`, `/pages/empty`) and `src/app/pages/uikit/*` remain in the repository and are currently accessible to logged-in Admins. These should be removed before production launch.

---

## 3. Client Image & Photography Requirements

### Audit of Existing Visual Assets in the Project
Direct inspection of `public/`, `src/assets/`, and all HTML templates found **only 3 local image assets** in the entire project:
1. **`public/assets/images/logo.png`** (duplicated in `src/assets/images/logo.png`): `2137 × 736 px` (394 KB, transparent PNG, ~2.9:1 wide landscape). Displays the **FREEWHEEL FACTORY** horizontal wordmark in **white** text with signature orange (`#ff6a00`) speed bars and gray diagonal stripes — intended for **dark backgrounds**. Used on `/admin/login` and topbar dark mode.
2. **`public/assets/images/logo-dark.png`** (duplicated in `src/assets/images/logo-dark.png`): `2137 × 736 px` (229 KB, transparent PNG, ~2.9:1 wide landscape). Displays the **FREEWHEEL FACTORY** horizontal wordmark in **dark navy/charcoal** text with orange speed bars — intended for **light backgrounds**. Used on topbar light mode.
3. **`public/favicon.ico`**: `15 KB` (32×32 / 48×48 generic icon).

**Key Visual Asset Findings:**
- **No shop, workshop, bicycle, service, or team photographs exist anywhere in the project.**
- **External Sakai CDN Placeholders:** `/landing`, `/auth/access`, and `/auth/error` currently hotlink 9 external images from `https://primefaces.org/cdn/templates/sakai/...` (`screen-1.png`, `peak-logo.svg`, `mockup.png`, `mockup-desktop.png`, `free.svg`, `startup.svg`, `enterprise.svg`, `new-badge.svg`, `asset-access.svg`, `asset-error.svg`). All must be replaced.
- **Logo Aspect Ratio Mismatch in Topbar:** `app.topbar.ts` constrains `.logo` to `40px × 40px`, squeezing the 2.9:1 horizontal `FREEWHEEL FACTORY` wordmark down to ~40×14px. A **1:1 square icon/monogram** (plus vector SVG source files) is urgently needed.
- **Ticket Intake Photos (`udF5`):** `services-list.component.ts` renders `<img [src]="selectedTicketForView.udF5">` in the Service Details modal, but there is no image upload or cloud storage configured yet.

---

### A. Shop / Workshop Images

| Image Name | Where Displayed | Purpose | Recommended Subject | Orientation | Resolution / Aspect Ratio | Mandatory / Optional | Existing Placeholder Reusable? |
|---|---|---|---|---|---|---|---|
| **Workshop Hero Banner** | Public Landing Page (`/landing` Hero section, replacing Sakai `screen-1.png`) | Immediate visual credibility and premium workshop first impression | Wide, well-lit editorial shot of the service bay with a performance bike on a workstand, clean tool wall, warm/dramatic workshop lighting | Landscape | `1920 × 1080 px` (16:9) or `2400 × 1350 px` | **Mandatory** (for public site) | No (currently Sakai SaaS screenshot) |
| **Shop Exterior & Storefront** | Contact Us / Location section, Footer / About Us, Google Business sync | Help riders recognize the physical store on arrival | Clear daytime photo of the building facade, main entrance, parking/bike drop-off area, and storefront signage | Landscape | `1600 × 1067 px` (3:2) | **Mandatory** (for public site) | No |
| **Main Entrance & Signage** | About Us / Contact / Gallery | Reinforce brand identity and accessibility | Front entrance door showing Freewheel Factory signage, hours board (if any), and clean entry | Landscape or Portrait | `1600 × 1200 px` (4:3) | **Optional** | No |
| **Complete Interior Workshop Overview** | Landing Highlights (`/landing`, replacing `mockup-desktop.png`) & About Us | Showcase scale, cleanliness, and professional lab environment | Wide-angle shot of the workshop floor showing multiple repair stands, lighting, and organized bays | Landscape | `1920 × 1080 px` (16:9) | **Mandatory** (for public site) | No (currently Sakai desktop mockup) |
| **Bicycle Servicing Workstation** | Services Overview & Workshop Gallery | Demonstrate precision engineering standards | Close-to-medium view of a dedicated mechanic workstand (e.g., Park Tool / Feedback Sports stand) with calibrated tools | Landscape | `1400 × 933 px` (3:2) | **Mandatory** (for public site) | No |
| **Mechanic Actively Servicing a Bicycle** | Landing Highlights (replacing `mockup.png`), About Us, Booking banner | Build human trust and showcase craftsmanship | Candid action shots of uniformed mechanics adjusting derailleurs, bleeding brakes, or torquing bolts | Landscape & Portrait (1–2 each) | `1600 × 1067 px` (3:2) & `1080 × 1350 px` (4:5) | **Mandatory** (for public site) | No (currently Sakai mobile mockup) |
| **Specialist Repair Tools & Lab Equipment** | About Us / Services / Gallery | Highlight specialized tooling (torque wrenches, truing stand, ultrasonic cleaner, suspension pump/bleed kit, 3D fit gear if owned) | Crisp detail shots of neatly arranged professional tool boards, digital torque wrench, wheel truing stand, ultrasonic tank | Landscape | `1400 × 933 px` (3:2) | **Mandatory** (for public site) | No |
| **Customer Reception & Drop-Off Desk** | About Us / Booking Confirmation / Gallery | Show welcoming, organized check-in experience | Front reception counter, check-in desk, or consultation table | Landscape | `1400 × 933 px` (3:2) | **Optional** | No |
| **Bicycle Display / Waiting Lounge** | Gallery / About Us | Highlight customer comfort & retail/parts display (only if available at shop) | Customer lounge, coffee bar, parts display wall, or finished bikes awaiting pickup | Landscape | `1400 × 933 px` (3:2) | **Optional** (if available) | No |
| **In-Shop Branding & Wall Signage** | About Us / Social Media / Login backdrop (optional) | Reinforce visual identity | Interior neon/metal/printed Freewheel Factory logo wall or bay signage | Landscape | `1600 × 1067 px` (3:2) | **Optional** | No |

---

### B. Bicycle Images

In the codebase (`src/app/models/cycle-management.models.ts` line 1 and `bicycles-list.component.ts` lines 595–603), the supported `BicycleType` enum defines: `Road`, `Mountain`, `Hybrid`, `BMX`, `Electric`, `Gravel`, and `Other`. Client must confirm which categories are actively serviced before shooting optional categories.

| Image Name | Where Displayed | Purpose | Recommended Subject | Orientation | Resolution / Aspect Ratio | Mandatory / Optional | Existing Placeholder Reusable? |
|---|---|---|---|---|---|---|---|
| **Road Bicycles** | Landing Services / Supported Bikes strip, Bicycle Fleet category cards | Appeal to road cyclists & racers | Clean carbon/alloy road bike (drop bars, clean background or on workshop stand) | Landscape | `1400 × 933 px` (3:2) | **Mandatory** (for public site) | No |
| **Mountain Bikes (MTB)** | Supported Bikes strip, Suspension/MTB Service section | Appeal to XC, Trail, and Enduro riders | Full-suspension or hardtail MTB showing suspension fork/shock and disc brakes | Landscape | `1400 × 933 px` (3:2) | **Mandatory** (for public site) | No |
| **Gravel Bicycles** | Supported Bikes strip, Adventure/Gravel tuning section | Appeal to gravel/bikepacking riders | Gravel bike with wide knobby tyres, flare drop bars, disc brakes | Landscape | `1400 × 933 px` (3:2) | **Optional** (confirm if serviced) | No |
| **Hybrid / Commuter Bicycles** | Supported Bikes strip, General Service card | Appeal to everyday & fitness riders | Flat-bar hybrid/city bicycle in clean serviced condition | Landscape | `1400 × 933 px` (3:2) | **Mandatory** (for public site) | No |
| **Electric Bicycles (E-Bikes)** | E-Bike Service card (`FWF-13`) & Supported Bikes strip | Show e-bike diagnostic capability *(only if client services e-bikes)* | E-bike showing mid-drive/hub motor, battery, or diagnostic console | Landscape | `1400 × 933 px` (3:2) | **Optional** (only if e-bikes supported) | No |
| **BMX / Kids / Specialty Bicycles** | Supported Bikes strip *(only if serviced)* | Show inclusivity if client services BMX/commuter bikes | Clean BMX or specialty bicycle | Landscape | `1200 × 800 px` (3:2) | **Optional** (only if supported) | No |
| **Premium / Performance Bicycles** | Hero / Race Ready section / Gallery | Position workshop as trusted with high-value bikes | High-end carbon road/MTB/triathlon bike freshly detailed in the studio | Landscape | `1920 × 1080 px` (16:9) | **Mandatory** (for public site) | No |
| **Bicycle Components & Close-Up Details** | Feature cards, Service cards, Website section dividers | Visual polish & mechanical craftsmanship appeal | Macro shots of spotless cassette/chain, hydraulic disc caliper, carbon fork, suspension stanchions, hub/spokes | Landscape or Square | `1200 × 800 px` (3:2) or `1000 × 1000 px` (1:1) | **Mandatory** (for public site) | No |
| **Before-and-After Service Comparison Photos** | Gallery, Detailing/Ultrasonic Drivetrain Spa showcase, Social Proof | Visually prove service quality | Side-by-side dirty/grimy drivetrain vs. sparkling cleaned cassette/chain; worn vs. serviced components | Square or Landscape | `1200 × 1200 px` (1:1) or `1600 × 900 px` (16:9) | **Optional** (High Impact) | No |

---

### C. Service-Specific Images

The codebase defines **20 services** in `src/app/services/freewheel-catalog.service.ts` (FWF-01 to FWF-20) and `docs/FREEWHEEL_FACTORY_SERVICES_SPECIFICATION.md`, plus **7 services** in `src/app/pages/appointments/appointment-form.component.ts`. None currently have images (only PrimeIcons font icons). The client must first confirm which of these 20 services they genuinely offer; images should only be captured for **confirmed** services.

| Service Code / Name (from Codebase) | Where Displayed | Purpose | Recommended Subject | Orientation | Resolution / Aspect Ratio | Mandatory / Optional | Existing Placeholder Reusable? |
|---|---|---|---|---|---|---|---|
| **FWF-01: General Bicycle Service** | Landing Pricing/Service cards (replacing `free.svg`), Public Services Page | Visually represent entry-tier tune-up | Mechanic performing multi-point safety check and torque check on a hybrid/road bike | Landscape | `1200 × 800 px` (3:2) | **Mandatory** (if offered) | No (currently PrimeIcon / Sakai SVG) |
| **FWF-02: Premium / Complete Service** | Landing Featured Package (replacing `startup.svg`), Services Page | Highlight flagship full-overhaul package | Disassembled drivetrain / spotless full bike undergoing precision truing & complete service | Landscape | `1200 × 800 px` (3:2) | **Mandatory** (if offered) | No |
| **FWF-03 & FWF-15: Performance / Race Service & Race Prep** | Landing Signature Package (replacing `enterprise.svg`), Performance Lab section | Showcase race-day preparation & wax tuning | High-end road or XC race bike undergoing precision calibration/waxing | Landscape | `1200 × 800 px` (3:2) | **Optional** (confirm if offered) | No |
| **FWF-04: Suspension Lab & Rebuild** | Suspension Service card / Service Detail page | Demonstrate specialist fork & rear shock rebuilding | Fork lowers removed, clean stanchions, wiper seals, suspension oil & shock pump on clean bench | Landscape | `1200 × 800 px` (3:2) | **Optional** (confirm if offered) | No |
| **FWF-05: Drivetrain & Electronic Shifting Service** | Drivetrain Service card / Detail page | Showcase gear indexing, ultrasonic cleaning, Di2/AXS tuning | Close-up of derailleur indexing, chain wear gauge, or ultrasonic tank cleaning a cassette | Landscape | `1200 × 800 px` (3:2) | **Mandatory** (core service) | No |
| **FWF-06: Hydraulic & Mechanical Brake Service** | Brake Service card / Detail page | Show safe, clean hydraulic bleed & caliper alignment | Mechanic bleeding hydraulic disc brake with bleed syringe/funnel or aligning brake caliper | Landscape | `1200 × 800 px` (3:2) | **Mandatory** (core service) | No |
| **FWF-07: Wheel Lab & Custom Wheel Building** | Wheel Service card / Detail page | Demonstrate wheel truing & spoke tensioning accuracy | Bicycle wheel mounted in a truing stand with spoke wrench / tensiometer | Landscape | `1200 × 800 px` (3:2) | **Mandatory** (if truing offered) | No |
| **FWF-08: Tyre & Tubeless Service Lab** | Tyre & Tubeless card / Detail page | Showcase tubeless conversion & sealant setup | Mounting tubeless tyre, applying rim tape, or injecting tubeless sealant | Landscape | `1200 × 800 px` (3:2) | **Mandatory** (core service) | No |
| **FWF-09 & FWF-10: 3D Bike Fitting & Cleat Fitting** | Bike Fit Lab section / Detail page | Demonstrate ergonomic/biomechanical fitting *(ONLY if client owns fitting gear)* | Rider on stationary trainer/fit bike with fitting tools/laser/cleat alignment | Landscape | `1200 × 800 px` (3:2) | **Optional** (confirm if offered) | No |
| **FWF-11: Bearing Overhaul & Press-Fit Service** | Bearing Service card / Detail page | Showcase headset, BB, and linkage bearing press work | Bearing press tool installing clean bottom bracket or headset bearings | Landscape | `1200 × 800 px` (3:2) | **Optional** (can share with Complete Service) | No |
| **FWF-12 & FWF-14: Component Upgrades & Pro Bike Assembly** | New Bike Assembly / Upgrades card | Attract online bike buyers needing pro unboxing/assembly | Technician assembling new boxed bike or installing carbon cockpit/groupset with torque wrench | Landscape | `1200 × 800 px` (3:2) | **Mandatory** (if offered) | No |
| **FWF-13: E-Bike Diagnostics & Electrical Service** | E-Bike Service card *(ONLY if client services e-bikes)* | Build confidence with e-bike owners | Technician running diagnostic check on an e-bike battery/motor/display | Landscape | `1200 × 800 px` (3:2) | **Optional** (only if supported) | No |
| **FWF-16: Emergency / Doorstep & Roadside Rescue** | Mobile Service section *(ONLY if client has a service van)* | Showcase doorstep convenience | Branded mobile service van/vehicle and technician servicing a bike outdoors | Landscape | `1400 × 933 px` (3:2) | **Optional** (only if mobile van exists) | No |
| **FWF-17, FWF-18, FWF-19: Bicycle Health Inspection, Digital Passport, Pre-Owned & Advanced Diagnostics** | Digital Passport & Inspection section, QR feature highlight | Explain digital inspection & QR service history | Mechanic inspecting frame with tablet/checklist or scanning a QR sticker on a bike frame | Landscape | `1200 × 800 px` (3:2) | **Mandatory** (core app feature) | No |
| **FWF-20: Bicycle Detailing & Ceramic Protective Spa** | Detailing & Wash card / Gallery | Showcase showroom finish cleaning | Bike wash bay / foam wash / spotless gleaming frame detail | Landscape | `1200 × 800 px` (3:2) | **Optional** (confirm if offered) | No |

---

### D. Team & People Images

Currently, `TechniciansListComponent` and `TechnicianDetailComponent` display only circular initials (e.g., `AE`), and the `Technician` model in `cycle-management.models.ts` includes an `avatar: string` field (not yet backed by an API field).

| Image Name | Where Displayed | Purpose | Recommended Subject | Orientation | Resolution / Aspect Ratio | Mandatory / Optional | Existing Placeholder Reusable? |
|---|---|---|---|---|---|---|---|
| **Owner / Founder Portrait** | About Us page ("Founder's Note" / Brand Story) | Humanize the business and build local authority | Friendly, confident portrait of the founder(s) inside the workshop with bicycles in soft focus behind | Portrait or Square | `1000 × 1250 px` (4:5) or `1000 × 1000 px` (1:1) | **Mandatory** (for About Us) | No |
| **Individual Mechanic / Technician Headshots** | About Us Team section; optionally Staff Avatars in `/technicians` | Show real certified professionals handling customers' bikes | Clean waist-up portraits in branded workshop attire/apron, consistent lighting and background | Square (1:1) or Portrait (4:5) | `800 × 800 px` (1:1) | **Mandatory** (for public Team section) / **Optional** (for Admin avatars) | No (currently text initials) |
| **Full Workshop Team Group Photo** | About Us banner / Careers / Social Media | Convey team cohesion and shop scale | All mechanics and staff smiling together in front of workstands or storefront | Landscape | `1920 × 1080 px` (16:9) or `1600 × 1067 px` (3:2) | **Optional** (Recommended) | No |
| **Specialist Technician Action Shots** | Service Detail pages / Landing Highlights | Demonstrate technical depth | Close-up action shots (e.g., wheel building, suspension rebuild, brake bleed) showing focus and precision | Landscape | `1400 × 933 px` (3:2) | **Optional** | No |

---

### E. Branding & Marketing Assets

| Asset Name | Where Displayed | Purpose | Recommended Format & Specs | Mandatory / Optional | Existing Asset Status |
|---|---|---|---|---|---|
| **Primary Logo (Vector Source)** | Public website header, print QR stickers, invoices, future scaling | Crisp rendering at any size without pixelation | **SVG** (plus AI / EPS / PDF master), transparent background | **Mandatory** | **Missing** — only raster PNGs exist (`2137 × 736 px`). |
| **White / Light-Text Logo (for Dark Mode)** | Dark mode topbar (`app.topbar.ts`), Dark login card (`admin-login.component.ts`), Dark footer | High-contrast brand display on dark `#09090b` / `#121212` surfaces | SVG + optimized PNG (~600px wide, <50KB) | **Exists (Needs Optimization & SVG)** | **Exists:** `public/assets/images/logo.png` (`2137×736`, 394 KB — oversized for web; white text `FREEWHEEL FACTORY`). |
| **Dark-Text Logo (for Light Mode)** | Light mode topbar (`app.topbar.ts`), Light landing header, printed QR cards & invoices | High-contrast brand display on white/light backgrounds | SVG + optimized PNG (~600px wide, <50KB) | **Exists (Needs Optimization & SVG)** | **Exists:** `public/assets/images/logo-dark.png` (`2137×736`, 229 KB — dark navy text `FREEWHEEL FACTORY`). |
| **Square Brand Icon / Monogram Mark** | Topbar 40×40px logo slot, Mobile app icon, Browser Favicon, Apple Touch Icon, QR Sticker center/header | Prevents the wide 2.9:1 wordmark from shrinking to an illegible strip inside square containers | SVG + PNG (`512 × 512 px`, `192 × 192 px`, `180 × 180 px`, `32 × 32 px`, `.ico`) | **Mandatory** | **Missing** — generic `favicon.ico` only; topbar squeezes wide PNG into `40×40px`. |
| **Official Brand Color Palette** | `src/app/theme/bicycle-theme.preset.ts`, Tailwind tokens, Landing page | Ensure visual consistency across web, print, and shop signage | Exact HEX / RGB / CMYK codes (currently using `#ff6a00` orange, `#121212` charcoal, `#0f172a` navy inferred from logo) | **Mandatory** | **Inferred from Logo** — needs client sign-off. |
| **Brand Typography / Font Guidelines** | `src/index.html`, `src/styles.scss`, marketing headlines | Consistent typography across admin portal & public website | Primary heading font + body font names (or license/Google Font preference); currently defaults to system/PrimeNG font | **Optional** (Recommended) | **Missing** |
| **Social Media Open Graph / Share Banner** | WhatsApp, Facebook, LinkedIn, X/Twitter link previews (`og:image`) | Professional preview card when sharing website or QR links | Landscape `1200 × 630 px` (PNG/JPG, <300 KB) featuring logo + workshop shot + tagline | **Mandatory** (before public launch) | **Missing** |
| **Promotional / Seasonal Campaign Banners** | Public Landing Page / Booking promotions (e.g., Monsoon Service, Pre-Race Tune-up) | Support seasonal marketing campaigns | Landscape `1920 × 600 px` (desktop) & `1080 × 1080 px` (social) | **Optional** | **Missing** |
| **Partner Brand Logos & Certifications** | Public Landing Page ("Authorized Service / Brands We Service", replacing Sakai `peak-logo.svg`) | Build immediate trust with brand-conscious cyclists | Transparent SVG/PNG logos of brands serviced/authorized (e.g., Shimano, SRAM, Fox, RockShox, Trek, Specialized, Giant, etc. — **only brands client actually supports**) + mechanic cert badges | **Optional** (High Impact) | **Missing** (currently `peak-logo.svg` placeholder) |

---

### F. Image Collection Summary

Quantities below are recommended specifically for the actual application layout (Admin Portal + planned Public Website `/landing`, Services, About Us, Gallery, Contact).

| ID | Image / Asset Required | Category | Recommended Quantity | Priority | Status |
|---|---|---|---:|---|---|
| **IMG-001** | Primary Logo Vector Pack (SVG + Light/Dark PNGs + Square Monogram Icon + Favicon) | Branding | 1 set (4–5 files) | **Critical** | Partial (wide PNGs exist; SVG, square icon & favicon missing) |
| **IMG-002** | Social Media Share Banner (`og:image`, 1200×630) | Branding | 1 | **High** | Required |
| **IMG-003** | Workshop Hero Banner (wide editorial bay shot, 16:9) | Shop / Workshop | 1–2 | **Critical** | Required (replaces Sakai hero) |
| **IMG-004** | Shop Exterior & Main Storefront Signage | Shop / Workshop | 2 | **High** | Required |
| **IMG-005** | Complete Interior Workshop & Workstations | Shop / Workshop | 2–3 | **High** | Required |
| **IMG-006** | Mechanics Actively Servicing Bicycles (action shots) | Shop / Workshop | 3–4 | **High** | Required |
| **IMG-007** | Specialist Tools & Workshop Equipment close-ups | Shop / Workshop | 2–3 | **Medium** | Required |
| **IMG-008** | Customer Reception / Waiting & Display Area | Shop / Workshop | 1–2 | **Low** | Optional (if available) |
| **IMG-009** | Core Bicycle Category Photos (Road, MTB, Hybrid, Premium Performance) | Bicycles | 4–6 | **High** | Required |
| **IMG-010** | Optional Bicycle Category Photos (Gravel, E-Bike, BMX) | Bicycles | 1–3 | **Low** | Optional (confirm categories first) |
| **IMG-011** | Bicycle Components Macro & Before/After Service Shots | Bicycles | 4–6 | **Medium** | Required |
| **IMG-012** | Core Service Photography (General Service, Complete Overhaul, Drivetrain, Brakes, Wheel Truing, Tubeless, Assembly, Digital Inspection/QR) | Services | 8–10 | **High** | Required (for confirmed services) |
| **IMG-013** | Specialist Service Photography (Race Prep, Suspension Lab, 3D Bike Fit, E-Bike Diagnostics, Mobile Van, Detailing Spa) | Services | 0–6 | **Medium** | Optional (only for confirmed services) |
| **IMG-014** | Owner / Founder Portrait | Team | 1 | **High** | Required (for About Us) |
| **IMG-015** | Individual Mechanic / Staff Headshots + Full Team Group Photo | Team | 1 per staff + 1 group | **Medium** | Required (for About Us / optional for Admin) |
| **IMG-016** | Partner Brand Logos & Technician Certification Scans | Branding / Trust | 4–10 | **Medium** | Optional (if available) |

---

## 4. Complete Business Services Analysis

### Crucial Distinction in the Codebase
To avoid confusion during client discussions and backend configuration, the project contains **four distinct concepts** that must remain strictly separated:
1. **Ticket Statuses** (Workflow state from `GET /api/misc/statuses`): `New`, `Assigned`, `In Progress`, `Completed`, `Cancelled`. These are **NOT** business services.
2. **Ticket Priorities** (Urgency from `GET /api/misc/priorities`): `Low`, `Medium`, `High`, `Urgent` / `Critical`. These are **NOT** business services.
3. **Service Departments** (8 internal groupings in `FreewheelCatalogService`): `Bike Service`, `Performance & Race`, `Bike Fit & Ergonomics`, `Suspension Lab`, `Wheels & Tyres`, `Components & Drivetrain`, `Mobile & Event Support`, `Inspection & Digital`.
4. **Customer-Facing Service Offerings** (20 catalog items in `FreewheelCatalogService` + 7 legacy strings in `AppointmentFormComponent`).

### Complete Master Table of Services Found in the Application

All 20 services below are defined in `src/app/services/freewheel-catalog.service.ts` (mirroring `docs/FREEWHEEL_FACTORY_SERVICES_SPECIFICATION.md`). **Important:** The prices (`₹650`–`₹4,500`) and durations (`45`–`180 mins`) are **developer-seeded placeholder values in frontend code** and have **NOT** been verified by the client or stored in the backend database.

| Code / Service Name | Service Category (Department) | Description (from Codebase) | Service Image Required | Estimated Duration (Configured?) | Price (Configured?) | Supported Bicycle Types | Booking Availability | Backend Integration | Status |
|---|---|---|---|---|---|---|---|---|---|
| **FWF-01: General Bicycle Service** (`GEN-SVC`) | Bike Service | Complete inspection, torque calibration, brake & gear tuning, drivetrain cleaning and safety check. | General tune-up photo (`IMG-012`) | Hardcoded: `60 min` (Unconfirmed) | Hardcoded: `₹850` (Unconfirmed) | Road, Mountain, Hybrid, BMX, Gravel, Other | Admin ticket form (`udF6`) only; no public booking | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-02: Premium / Complete Service** (`PREM-SVC`) | Bike Service | Full drivetrain removal, ultrasonic parts immersion, precision wheel truing, bearing inspection, and digital report. | Full overhaul photo (`IMG-012`) | Hardcoded: `150 min` (Unconfirmed) | Hardcoded: `₹2,200` (Unconfirmed) | Road, Mountain, Hybrid, Gravel, Electric | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-03: Performance / Race Service** (`RACE-SVC`) | Performance & Race | Frictional loss reduction, suspension sag & damping setup, cockpit tuning, and pre-race certification. | Race service photo (`IMG-013`) | Hardcoded: `180 min` (Unconfirmed) | Hardcoded: `₹3,200` (Unconfirmed) | Road, Mountain, Gravel | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-04: Suspension Lab & Rebuild** (`SUSP-LAB`) | Suspension Lab | Dedicated suspension overhaul with SKF wiper seals, bath oil replacement, damper vacuum bleeding, and sag setup. | Fork/shock rebuild photo (`IMG-013`) | Hardcoded: `120 min` (Unconfirmed) | Hardcoded: `₹2,800` (Unconfirmed) | Mountain, Electric | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-05: Drivetrain & Electronic Shifting Service** (`DRIVE-SVC`) | Components & Drivetrain | Ultrasonic hot-melt chain waxing, cassette refresh, derailleur hanger alignment, and wireless shifting diagnostics. | Drivetrain/Di2 photo (`IMG-012`) | Hardcoded: `75 min` (Unconfirmed) | Hardcoded: `₹1,400` (Unconfirmed) | Road, Mountain, Gravel, Hybrid, Electric | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-06: Hydraulic & Mechanical Brake Service** (`BRAKE-SVC`) | Components & Drivetrain | Full hydraulic bleed, caliper piston deep cleaning, pad glaze removal, and precision rotor truing. | Brake bleed photo (`IMG-012`) | Hardcoded: `60 min` (Unconfirmed) | Hardcoded: `₹1,100` (Unconfirmed) | Road, Mountain, Gravel, Hybrid, Electric, BMX | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-07: Wheel Lab & Custom Wheel Building** (`WHEEL-LAB`) | Wheels & Tyres | Master wheel building based on rider weight, rim ERD, hub geometry, uniform tension balancing, and hub overhauls. | Wheel truing stand photo (`IMG-012`) | Hardcoded: `120 min` (Unconfirmed) | Hardcoded: `₹1,900` (Unconfirmed) | Road, Mountain, Gravel, BMX | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-08: Tyre & Tubeless Service Lab** (`TYRE-TUBE`) | Wheels & Tyres | Tubeless conversions, sealant recharge, rim-tape sealing, puncture repair, and casing optimization. | Tubeless setup photo (`IMG-012`) | Hardcoded: `45 min` (Unconfirmed) | Hardcoded: `₹650` (Unconfirmed) | Road, Mountain, Gravel, Electric, Hybrid | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-09: Professional 3D Bike Fitting** (`FIT-3D`) | Bike Fit & Ergonomics | 4-stage dynamic fit: biomechanical interview, 3D motion capture, millimeter adjustments, and Digital Bike Fit report. | 3D bike fit photo (`IMG-013`) | Hardcoded: `150 min` (Unconfirmed) | Hardcoded: `₹4,500` (Unconfirmed) | Road, Mountain, Gravel, Other | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; `BikeFitProfile` model unused | **Partial (Frontend Hardcoded)** |
| **FWF-10: Dedicated Cleat & Footbed Fitting** (`CLEAT-FIT`) | Bike Fit & Ergonomics | Foot arch profiling, metatarsal axis alignment, Q-factor adjustment, and tibial rotation compensation. | Cleat fitting photo (`IMG-013`) | Hardcoded: `45 min` (Unconfirmed) | Hardcoded: `₹1,200` (Unconfirmed) | Road, Mountain, Gravel | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-11: Bearing Overhaul & Press-Fit Service** (`BEAR-SVC`) | Components & Drivetrain | Precision bearing removal, ultrasonic cleaning, Enduro MAX bearing press-fit installation, and zero-play preload. | Bearing press photo (`IMG-012`) | Hardcoded: `90 min` (Unconfirmed) | Hardcoded: `₹1,600` (Unconfirmed) | Mountain, Road, Gravel, Electric | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-12: Component Installation & Custom Upgrades** (`COMP-INST`) | Components & Drivetrain | Precision installation of customer-supplied or upgraded parts with calibrated torque specs and cable routing. | Component install photo (`IMG-012`) | Hardcoded: `60 min` (Unconfirmed) | Hardcoded: `₹950` (Unconfirmed) | Road, Mountain, Gravel, Hybrid, Electric, BMX | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-13: E-Bike Diagnostics & Electrical Service** (`EBIKE-SVC`) | Components & Drivetrain | Error code scanning, battery capacity testing, wiring harness inspection, and heavy-duty mechanical maintenance. | E-bike diagnostic photo (`IMG-013`) | Hardcoded: `100 min` (Unconfirmed) | Hardcoded: `₹2,400` (Unconfirmed) | Electric | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-14: Bike Assembly & New Bike Setup** (`PRO-ASM`) | Bike Service | Complete unboxing, grease prep, precision cable routing, wheel tensioning, and digital assembly QC certificate. | New bike assembly photo (`IMG-012`) | Hardcoded: `110 min` (Unconfirmed) | Hardcoded: `₹1,800` (Unconfirmed) | Road, Mountain, Gravel, Hybrid, Electric, BMX, Other | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-15: Race Preparation Service (24–48h Pre-Race)** (`RACE-PREP`) | Performance & Race | Conducted 24–48 hours before racing. Rigorous 40-point inspection yielding official RACE READY - PASS or remedial advisory. | Pre-race check photo (`IMG-013`) | Hardcoded: `90 min` (Unconfirmed) | Hardcoded: `₹2,100` (Unconfirmed) | Road, Mountain, Gravel | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-16: Emergency / Doorstep & Roadside Rescue** (`MOBI-REC`) | Mobile & Event Support | Doorstep maintenance van equipped with professional stands, truing fixtures, compressor, and common spares. | Mobile workshop van photo (`IMG-013`) | Hardcoded: `60 min` (Unconfirmed) | Hardcoded: `₹1,500` (Unconfirmed) | Road, Mountain, Gravel, Hybrid, Electric, BMX | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-17: Bicycle Health Inspection & Digital Passport** (`PASSPORT-INSP`) | Inspection & Digital | Evaluates Frame, Fork, Shock, Wheels, Drivetrain, Brakes, and Bearings with a persistent Digital Bicycle Passport. | Inspection / QR scan photo (`IMG-012`) | Hardcoded: `45 min` (Unconfirmed) | Hardcoded: `₹900` (Unconfirmed) | Road, Mountain, Gravel, Hybrid, Electric, BMX, Other | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; Passport UI removed | **Partial (Frontend Hardcoded)** |
| **FWF-18: Pre-Owned Bicycle Inspection (Used Bike Authority)** (`USED-INSP`) | Inspection & Digital | Carbon frame ultrasound/tap test, component authenticity check, serial number audit, and fair market repair appraisal. | Inspection / frame audit photo (`IMG-012`) | Hardcoded: `75 min` (Unconfirmed) | Hardcoded: `₹1,750` (Unconfirmed) | Road, Mountain, Gravel, Electric | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-19: Advanced Diagnostic & Frame Alignment Lab** (`ADV-DIAG`) | Inspection & Digital | Advanced troubleshooting for persistent noises, misalignments, frame thread chasing, and telemetry analysis. | Diagnostic bench photo (`IMG-013`) | Hardcoded: `60 min` (Unconfirmed) | Hardcoded: `₹1,300` (Unconfirmed) | Road, Mountain, Gravel, Electric | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |
| **FWF-20: Bicycle Detailing & Ceramic Protective Spa** (`DETAIL-SPA`) | Inspection & Digital | 3-tier detailing: Express Wash, Deep Detail, or Showroom Ceramic Coating for carbon/alloy matte & gloss finishes. | Wash / ceramic detailing photo (`IMG-013`) | Hardcoded: `70 min` (Unconfirmed) | Hardcoded: `₹1,250` (Unconfirmed) | Road, Mountain, Gravel, Hybrid, Electric, BMX | Admin ticket form (`udF6`) only | Free-text string inside `Ticket.udF6`; no Services API | **Partial (Frontend Hardcoded)** |

*(Additional inconsistency: Unrouted `AppointmentFormComponent` defines a separate hardcoded list of 7 differently named services: `Hydraulic Disc Brake Bleeding & Tuning`, `Tubeless Conversion & Sealant Refill`, `Suspension Fork & Shock 50hr Service`, `Annual Comprehensive Pro Tune-up`, `E-Bike Motor & Battery Health Check`, `Custom Wheel Truing & Spoke Tensioning`, `Drivetrain Overhaul & Bottom Bracket Service`.)*

### Service Availability & Integration Breakdown

1. **Services Currently Available to Customers (Public Website):** **None.** The `/landing` page displays Sakai template SaaS plans (`Free $0/month`, `Startup $1/month`, `Enterprise $5/month`). No public bicycle service catalog or booking page is live.
2. **Services Available Only in the Admin / Staff Panel:** All **20 services** (`FWF-01` through `FWF-20`) appear exclusively inside the `"Requested Service(s) from Catalogue"` multi-select dropdown on `/services/new` (`ServiceFormComponent`), displaying hardcoded INR prices (`₹650`–`₹4,500`).
3. **Services Present in Backend Configuration but Not Displayed on Website:** **None.** The backend API (`swagger.json`) does **not** have a services catalog table or endpoint (`/api/services` does not exist). Only workflow lookup tables (`/api/misc/statuses`, `/api/misc/priorities`, `/api/misc/roles`, `/api/misc/groups`) exist on the backend.
4. **Services in Frontend Code Not Integrated with Backend Functionality:**
   - All **20 services** in `FreewheelCatalogService` (and their SOP checklists, base prices, durations, and `calculateQuote()` multipliers: `+25%` E-Bike, `+10%` Road Race, `+30%` Doorstep) live exclusively in TypeScript memory. When selected on `/services/new`, only their plain-text names are joined into a comma-separated string and sent in `Ticket.udF6`.
   - All **7 services** in `AppointmentFormComponent` are hardcoded and never reach a backend API.
5. **Services Documented / Modeled as Planned but Not Implemented in UI:**
   - **Digital Bicycle Passport Health Matrix** (`DigitalBicyclePassport` & `ComponentHealthItem` with `GOOD / ATTENTION_REQUIRED / REPLACE_OR_REPAIR` badges) — modeled in `cycle-management.models.ts`, explicitly removed during the Service Management redesign (`SERVICE_MANAGEMENT_REDESIGN.md`).
   - **3D Bike Fit Coordinate Report** (`BikeFitProfile` interface in `cycle-management.models.ts`) — model exists, zero UI or API.
   - **Technician SOP Checklists per Ticket** (`SOPCheckItem` in `cycle-management.models.ts`) — model exists, zero UI or API.
   - **Dynamic Quotation Calculator** (`FreewheelCatalogService.calculateQuote()`) — function exists, never called by any component.

---

## 5. Client Business Information Requirements

The codebase currently contains **zero verified client business details** — only conflicting placeholder brand names (`Freewheel Factory`, `Cycle Service Center`, `FREEWHEEL SERVICE CENTER`, `SAKAI`, `PrimeLand`), fake US phone numbers (`+1 (555) 789-0011`), mixed currencies (`₹` in `FreewheelCatalogService` vs. `$` in `ServiceJobsListComponent`, `InventoryListComponent`, `PaymentsListComponent`, and `PricingWidget`), and dummy addresses (`742 Evergreen Terrace`).

### 5.1 Business Details Required from Client
- [ ] **Official Legal & Brand Name** (Confirm exact name to standardize across browser title, topbar, login, public website, and QR stickers — e.g., *Freewheel Factory* vs. *Freewheel Service Center* vs. *Cycle Service Center*)
- [ ] **Brand Tagline / Positioning Statement** (short 5–10 word subtitle)
- [ ] **Complete Physical Shop Address** (building, street, landmark, area, city, state, PIN/postal code)
- [ ] **Google Maps Pin / Share URL & Embed Coordinates** (plus parking/drop-off instructions)
- [ ] **Primary Customer Service Phone Number** (with country code, e.g., `+91 ...`)
- [ ] **WhatsApp Business Number** (note: backend `POST /api/demo-requests` explicitly returns a `whatsAppUrl` field!)
- [ ] **Official Business Email Address** (for customer inquiries, bookings, and admin password-reset support)
- [ ] **Target Website Domain(s)** (e.g., public site domain vs. admin dashboard subdomain)
- [ ] **Official Operating Hours** (weekday and weekend opening/closing times)
- [ ] **Weekly Off Day / Holiday Schedule**
- [ ] **Year of Establishment & Branch/Hub Names** (confirm single workshop or multi-branch)
- [ ] **Official Social Media Handles** (Instagram, Facebook, YouTube, Strava Club, Google Business Profile link)

### 5.2 About the Business
- [ ] **Company Introduction** (2–3 sentences for Homepage & SEO meta description)
- [ ] **Brand Story / Founder Background** (why Freewheel Factory was started, cycling background)
- [ ] **Mission & Core Workshop Standards** (e.g., calibrated torque specs, genuine parts, transparent inspection)
- [ ] **Key Achievements / Milestones** (only verified numbers: years in business, bikes serviced, events supported, certifications earned)
- [ ] **Core Specializations** (e.g., road racing, MTB suspension, custom wheel building, bike fitting, commuter care — confirmed only)
- [ ] **Key Differentiators ("Why Choose Us")** (3–6 factual bullet points to replace the 9 Sakai placeholder feature cards)

### 5.3 Service Information
- [ ] **Confirmed Service Menu** (Client must review the 20 services in `FreewheelCatalogService` and mark each as **Offer Now**, **Coming Soon**, or **Do Not Offer**, and add any missing services)
- [ ] **Client-Facing Service Descriptions & Bullet Inclusions** (exact checklist of what is included vs. excluded per package)
- [ ] **Official Pricing & Currency** (confirm `INR ₹` or other currency; exact fixed price, "Starting from" price, or "Quote on Inspection"; clarify whether spare parts and GST/taxes are included or extra)
- [ ] **Estimated Turnaround Time / Service Duration** per service (e.g., same-day, 24 hours, 2–3 business days)
- [ ] **Supported Bicycle Brands** (e.g., Trek, Specialized, Giant, Cannondale, Scott, Canyon, Merida, Polygon, Firefox, etc., or "All Multi-Brand Bicycles")
- [ ] **Supported Bicycle Types** (confirm which of Road, Mountain, Gravel, Hybrid, Electric, BMX, Kids, Folding, Triathlon/TT are accepted)
- [ ] **Service Workmanship Warranty** (e.g., 7-day / 15-day / 30-day adjustment warranty and exclusions)
- [ ] **Service Terms & Conditions** (unclaimed bicycle storage policy, estimate approval threshold for extra parts, liability for pre-existing carbon/frame damage)

### 5.4 Trust, Certifications & Social Proof
- [ ] **Authorized Service Center / Dealer Partnerships** (Shimano Service Center, SRAM/RockShox, Fox, Bosch/Shimano STEPS, Park Tool, etc. — only genuinely held authorizations)
- [ ] **Technician Qualifications & Training Certificates** (e.g., Barnett Bicycle Institute, Cytech, Park Tool School, Shimano TEC, brand-specific suspension/fit certifications)
- [ ] **Verified Customer Testimonials** (3–6 real customer quotes with first/full name, bike/riding discipline, and permission to publish)
- [ ] **Google Reviews Rating & Link** (to embed or link from the landing page)

---

## 6. Appointment & Booking Requirements

### 6.1 Analysis of Existing Booking Subsystems
Two disconnected booking mechanisms were found in the codebase:
1. **Admin Appointments UI (Disabled & Local-Only):** `src/app/pages/appointments/appointments-list.component.ts` and `appointment-form.component.ts` are **commented out in `src/app/app.routes.ts` (lines 91–92)**. They read/write only to the empty in-memory `CycleDataService` and hardcode:
   - 6 time slots: `08:30 AM`, `09:30 AM`, `11:00 AM`, `01:30 PM`, `02:30 PM`, `04:00 PM`
   - Default date: `2026-09-21`
   - Default technician ID: `TECH-001`
   - 7 hardcoded service package strings (inconsistent with the 20-item `FreewheelCatalogService`)
   - Statuses: `Scheduled`, `Confirmed`, `In Service`, `Completed`, `Cancelled`, `No Show`
2. **Backend Demo Request / Lead Endpoint (Live in Swagger, Unused in UI):** `swagger.json` and `src/app/services/demo.service.ts` expose:
   - `POST /api/demo-requests` — accepts `{ name, phoneNumber, email, address }` and returns `{ id, message, whatsAppUrl }`
   - `GET /api/demo-requests` — lists requests with `{ id, name, phoneNumber, email, address, serviceCenterId, statusId, createdAt }`
   - This is currently **not connected to any frontend page** (neither `/landing` nor admin dashboard).

### 6.2 Client Information Required to Configure Booking Properly
| Configuration Area | Specific Questions / Data Needed from Client |
|---|---|
| **Booking Flow Type** | Should customers book exact **date + time slots** directly, or submit a **booking request** confirmed via WhatsApp/phone (leveraging `/api/demo-requests` + `whatsAppUrl`)? |
| **Bookable Services** | Which services can be booked online vs. require in-shop inspection first (e.g., suspension rebuild, used bike inspection, 3D bike fit)? |
| **Working Days & Closed Days** | Exact open days (e.g., Tue–Sun, Mon closed) and public holiday calendar. |
| **Booking Time Slots** | Drop-off windows (e.g., 30-min or 1-hour slots, morning/afternoon slots) and lunch breaks. |
| **Maximum Daily Capacity** | Maximum bikes accepted per day and per time slot (based on number of workstands/mechanics), plus separate limits for long jobs like 3D Bike Fit or Full Overhaul. |
| **Advance Booking Window** | Minimum lead time (e.g., 2 hours or 24 hours ahead; allow same-day walk-ins?) and maximum advance booking horizon (e.g., 14 or 30 days). |
| **Doorstep Pickup/Drop-Off or Mobile Van** | Does the shop offer bike pickup/drop-off or mobile van service? If yes: serviceable PIN codes/radius, fees, and slot rules. |
| **Cancellation & Rescheduling Policy** | Cutoff time for free cancellation/rescheduling (e.g., 12–24 hours prior), no-show handling, and whether any booking deposit is required for high-value slots (like 3D Bike Fit). |
| **Customer Notifications** | Preferred channels (WhatsApp, SMS, Email) and required triggers: Booking Received, Booking Confirmed, Reminder (24h before), Estimate Approval Request, Bike Ready for Pickup. |

### 6.3 Missing Functionality & API Dependencies
- **Missing Backend APIs:** `GET /api/appointments`, `POST /api/appointments`, `PUT /api/appointments/{id}`, `PATCH /api/appointments/{id}/status`, `GET /api/appointments/availability?date=...`, and conversion of an Appointment to a Service Ticket (`POST /api/tickets`).
- **Missing Public Booking UI:** No customer-facing booking form exists on `/landing` or `/book`.
- **Missing Notification Integration:** `WorkshopSettingsComponent` displays an `"SMS Completion Alerts"` toggle, and `BookDemoResponse` returns `whatsAppUrl`, but no automated SMS/WhatsApp/Email gateway is wired to ticket or booking transitions.
- **Hardcoded Bug in `AppointmentFormComponent`:** `date: ['2026-09-21']` and `technicianId: ['TECH-001']` are static placeholders; `technicianOptions` in `AppointmentsListComponent` is never populated (`[]`).

---

## 7. Admin & Operational Requirements

The table below analyzes every operational capability in the admin portal and clearly separates what the **client must supply** vs. what the **development/operations team configures internally**.

| Operational Area | Current Implementation & Limitations | Must Be Supplied by Client | Configured Internally by Dev / Ops Team |
|---|---|---|---|
| **Customer Management** (`/customers`, `/customers/:id`) | Lists via `GET /api/misc/customers`; creates via `POST /api/customers` (`name`, `phoneNumber`, `email`, `address`). **Missing:** Edit/Delete endpoints (`PUT/DELETE /api/customers/{id}`), in-page search, duplicate email/phone validation. | Required intake fields (e.g., WhatsApp number, alternate contact, club/company name), data privacy consent wording, any existing customer spreadsheet to migrate. | Backend CRUD endpoints (`PUT`/`DELETE`), unique phone/email indexing, table search & pagination, data import script. |
| **Bicycle Registration** (`/bicycles`, `/bicycles/:id`) | Admin table calls `GET /api/cycles` *(missing in `swagger.json`; returned HTTP 405 in audit)*. Create form collects Brand, Model, Type, Frame#, Serial#, Gear System, Color, Purchase Date, Notes, **but `CreateCycleRequest` only transmits `customerId`, `model`, `serialNumber`** (all other fields are silently discarded!). | Mandatory bicycle attributes mechanics need to record (e.g., frame size, wheel size, suspension model, e-bike serial, drivetrain spec) and standard bicycle categories. | Expand backend `Cycle` schema & `POST/GET/PUT /api/cycles` DTOs to persist all collected specs; fix `GET /api/cycles/{id}/service-info` 400 error on bikes without tickets. |
| **Technician Management** (`/technicians`, `/technicians/:id`) | UI calls `GET/POST/PUT/DELETE /api/users`. **Blocker:** `POST /api/users` throws `HTTP 500` in live audit; `GET/PUT/DELETE /api/users` missing from `swagger.json`; `saveUser()` falls back to hardcoded password `'Temporary123!'`. | Initial list of all staff/mechanics (full name, email, phone, job title, specialization, active status) and who gets Admin vs. Employee access. | Fix backend `POST /api/users` 500 crash & account activation flow (`/api/auth/activate`); implement `GET/PUT/DELETE /api/users`; remove hardcoded fallback password. |
| **Employee Groups & Roles** (`/api/misc/roles`, `/api/misc/groups`) | Backend currently has 2 roles (`Admin`, `Employee`) and groups (e.g., `Service Team`). `AdminLoginComponent` checks for `'Admin Team'` group while `AuthService` checks `'Admin'` role. | Confirm organizational roles (e.g., Owner/Admin, Service Advisor/Front Desk, Senior Mechanic, Junior Mechanic) and workshop groups/departments, plus permission rules (who can edit prices, delete records, view dashboard). | Align backend roles/groups seed data and unify frontend `AuthService` + `AdminLoginComponent` authorization checks. |
| **Service Management & Catalog** (`/services`, `/services/new`) | 20 hardcoded services in `FreewheelCatalogService` selectable in `udF6`. No admin CRUD to add/edit service packages, prices, or durations. | Confirmed service list, descriptions, pricing, durations, tax rules, and whether staff should be able to edit catalog prices via Admin UI. | Build backend `/api/services` CRUD (or finalize static config) and link selected services cleanly to tickets with pricing totals. |
| **Ticket Creation, Assignment & Status Tracking** (`/services`, `/services/new`, `/services/:id/edit`) | Live `GET/POST/PUT /api/tickets` with 9 core fields + `udF1`–`udF10`. **Gaps:** Filter bar on `/services` is commented out; `swagger.json` does not list `udF1`–`udF10` (must confirm live backend DTO); `udF5` photo upload not built; `getBicycleType()` mistakenly reads `udF1`. | Exact ticket workflow statuses (e.g., New → Inspected → Awaiting Approval → In Progress → Quality Check → Ready for Pickup → Delivered → Cancelled), priority definitions, standard accessories & component checklists. | Seed agreed statuses/priorities in backend DB; uncomment & restore `/services` filters; fix `udF1`/`udf1` bugs; add cloud storage for `udF5` intake photos. |
| **Service History** (`/customers/:id`, `/bicycles/:id`) | Pulls from `/api/tickets` and `/api/cycles/{id}/service-info`. Works for bikes with existing tickets; fails with HTTP 400 on bikes without tickets. | Confirm what history fields should be printed/shared with riders (date, services performed, parts replaced, next service due date/km, mechanic name). | Fix `/api/cycles/{id}/service-info` null-ticket handling; add printable/PDF service summary sheet. |
| **QR Code Generation & Bicycle Service Info** (Modals in `/services` & `/bicycles`) | Prints 3 cm × 3 cm sticker encoding `{apiUrl}/api/cycles/{cycleId}/service-info` with header `FREEWHEEL SERVICE CENTER`. **Critical UX Gap:** Scanning the QR hits a JWT-protected JSON API endpoint, not a mobile web page! | Confirm sticker physical size (3 cm × 3 cm thermal/vinyl label?), exact printed brand title/logo/phone, and whether scanning should open a **public customer-friendly service passport page** (showing bike model & service dates without exposing private phone/address). | Create a dedicated public frontend route (e.g., `/bike/:qrToken`) backed by an unauthenticated public endpoint using `qrToken` (not `cycleId` with JWT), masking sensitive PII. |
| **Admin Configuration / Settings** (`/settings` commented out) | `WorkshopSettingsComponent` has hardcoded US defaults and zero backend storage. | Workshop name, address, phone, operating hours, tax/GST number (if invoicing), SMS/WhatsApp/Email alert preferences. | Implement `/api/settings` backend persistence, re-enable `/settings` route for Admins, and wire password-change API for staff. |

---

## 8. Missing Information & Gap Analysis

### 8.1 Missing Images & Visual Assets
| # | Finding | Current Situation | What Is Missing | Why Required | Suggested Solution | Priority |
|---|---|---|---|---|---|---|
| **G-IMG-1** | **Sakai Template CDN Images on Public & Auth Pages** | `/landing`, `/auth/access`, and `/auth/error` load 9 external images from `primefaces.org/cdn/templates/sakai/...`. | All real Freewheel Factory workshop, hero, service, and brand images. | Shipping third-party template images destroys credibility and breaks if external CDN changes. | Collect `IMG-003`–`IMG-015` from client and host locally in `public/assets/images/`. | **Critical** |
| **G-IMG-2** | **Missing Vector Logo & Square Brand Icon** | Only wide `2137×736` PNGs (`logo.png`, `logo-dark.png`) exist; `app.topbar.ts` squishes them into `40×40px`. | Vector SVG logos, 1:1 square icon/monogram, high-res favicon/app icons, and OG share banner (`1200×630`). | Crisp brand display across topbar, mobile drawer, browser tabs, QR stickers, and WhatsApp/social previews. | Request master SVG + icon mark from client and optimize web PNGs (<50KB). | **Critical** |
| **G-IMG-3** | **No Intake Photo Upload Storage (`udF5`)** | `ServiceFormComponent` only accepts a manual URL string for `udF5`; View Details renders `<img [src]="ticket.udF5">`. | Cloud/file upload endpoint (e.g., S3/Cloudinary/Azure Blob) and image upload widget. | Recording bike intake condition photos protects the shop from pre-existing scratch/damage disputes. | Implement `POST /api/tickets/{id}/photos` with file storage and PrimeNG `FileUpload`. | **Medium** |

### 8.2 Missing Business Information
| # | Finding | Current Situation | What Is Missing | Why Required | Suggested Solution | Priority |
|---|---|---|---|---|---|---|
| **G-BIZ-1** | **Inconsistent Brand Naming Across App** | Logos say `FREEWHEEL FACTORY`; `index.html`/topbar/login say `Cycle Service Center`; QR prints say `FREEWHEEL SERVICE CENTER`; `/landing` says `SAKAI`; `/login` says `PrimeLand`. | Confirmed single official business name & tagline. | Brand confusion erodes customer trust and causes inconsistent printed labels/URLs. | Obtain client sign-off on exact brand name and standardize across all files. | **Critical** |
| **G-BIZ-2** | **No Real Contact Details, Address, or Hours** | Settings and placeholders contain fake US data (`+1 (555) 789-0011`, `742 Evergreen Terrace`, `Mon-Sat 8AM-7PM`). | Verified address, Google Maps pin, phone, WhatsApp, email, operating hours, weekly off day. | Customers cannot locate, call, or visit the workshop without accurate details. | Collect via Section C of the Client Checklist and bind dynamically. | **Critical** |
| **G-BIZ-3** | **Conflicting Currency Symbols (`₹` vs `$`)** | `FreewheelCatalogService` uses INR (`₹`); `ServiceJobsListComponent`, `InventoryListComponent`, `PaymentsListComponent`, and `PricingWidget` use USD (`$`). | Confirmed operating currency and tax/GST pricing policy. | Prevents billing errors and customer confusion. | Confirm currency (likely INR `₹`) and standardize Angular currency formatting globally. | **High** |

### 8.3 Missing Service Information
| # | Finding | Current Situation | What Is Missing | Why Required | Suggested Solution | Priority |
|---|---|---|---|---|---|---|
| **G-SVC-1** | **Unverified 20-Service Catalog & Placeholder Pricing** | `FreewheelCatalogService` hardcodes 20 advanced services (including 3D Bike Fit, Mobile Van, Ceramic Spa) with placeholder INR prices (`₹650`–`₹4,500`). | Client verification of which services are actually offered, real prices, real durations, and exact inclusions/exclusions. | Advertising unavailable services (e.g., 3D Bike Fit or Mobile Van) or wrong prices causes operational and legal issues. | Walk client through Section D checklist to approve/trim catalog before public display. | **Critical** |
| **G-SVC-2** | **Duplicate / Conflicting Service Lists** | `ServiceFormComponent` uses 20 `FreewheelCatalogService` items; `AppointmentFormComponent` uses 7 different hardcoded strings. | Single approved master service catalog. | Prevents mismatched reporting between bookings and workshop tickets. | Consolidate into a single backend-managed `/api/services` catalog. | **High** |

### 8.4 Missing Website Content
| # | Finding | Current Situation | What Is Missing | Why Required | Suggested Solution | Priority |
|---|---|---|---|---|---|---|
| **G-CNT-1** | **Unbuilt Public Website Pages** | `/landing` is 100% Sakai Lorem Ipsum; no About Us, Public Services, Service Details, Gallery, Contact, or Legal pages exist. | Brand story, About Us copy, service descriptions, FAQs, real testimonials, Privacy Policy, and Terms of Service. | Required to launch a customer-facing website for lead generation and online bookings. | Collect all copy from client, replace `/landing`, and add dedicated public routes. | **Critical** (for public site) |
| **G-CNT-2** | **Broken & Dead Footer Links** | `FooterWidget` contains non-functional links (`Investor Relations`, `Discord`, `Media Kit`) and broken route `/pages/landing`. | Real navigation links, social URLs, and legal policy pages. | Dead links damage professionalism and SEO. | Replace footer completely once client content and legal policies are received. | **High** |

### 8.5 Missing Backend Configuration
| # | Finding | Current Situation | What Is Missing | Why Required | Suggested Solution | Priority |
|---|---|---|---|---|---|---|
| **G-BCK-1** | **`POST /api/users` Returns HTTP 500** | Live audit (`Freewheel_Factory_Dashboard_Full_Audit_Report.md`) proved staff registration crashes with HTTP 500 (likely SMTP/email config or DB join bug). | Working SMTP / user creation & activation backend config. | Admin cannot onboard new mechanics or staff members. | Inspect Render server logs, fix exception handling & SMTP config in `CreateUserEndpoint`. | **Critical** |
| **G-BCK-2** | **`GET /api/cycles/{id}/service-info` Returns HTTP 400 on New Cycles** | Audit confirmed querying a bicycle before its first ticket returns HTTP 400. | Left-join / null-safe query for cycles with zero tickets. | Scanning QR or viewing a newly registered bicycle profile fails. | Update backend query to return `currentService: null` and `previousServices: []` with HTTP 200. | **High** |
| **G-BCK-3** | **Missing Unique Email / Phone Validation on Customers** | Audit confirmed `POST /api/customers` accepts duplicate customer emails (`HTTP 200`). | Database unique constraint / duplicate detection logic. | Causes duplicate customer profiles and fragmented service histories. | Add duplicate phone/email validation on backend and surface clear 409 Conflict UI warning. | **Medium** |
| **G-BCK-4** | **Swagger Contract Drift (`swagger.json` Outdated)** | Frontend calls `GET /api/cycles`, `GET/PUT/DELETE /api/users`, `GET /api/misc/customers/{id}/cycles`, and sends `udF1`–`udF10` — none of which are documented in `swagger.json`. | Synchronized OpenAPI spec matching live Render deployment. | Causes silent field drops and 404/405 runtime failures. | Regenerate `swagger.json` from live backend and align frontend DTOs. | **High** |

### 8.6 Missing API Integrations
| # | Finding | Current Situation | What Is Missing | Why Required | Suggested Solution | Priority |
|---|---|---|---|---|---|---|
| **G-API-1** | **Missing Edit/Delete Endpoints for Customers & Bicycles** | Only `POST /api/customers` and `POST /api/cycles` exist; `PUT`/`DELETE` return 404. | `PUT/DELETE /api/customers/{id}`, `GET/PUT/DELETE /api/cycles/{id}`. | Staff cannot fix typos in customer phone numbers/emails or update bike specs. | Implement full CRUD endpoints on backend and wire Edit actions in UI. | **High** |
| **G-API-2** | **Bicycle Registration Silently Drops 7+ Form Fields** | `BicyclesListComponent` collects Brand, Type, Frame#, Gear System, Color, Purchase Date, Notes — but `CreateCycleRequest` only sends `{ customerId, model, serialNumber }`. | Extended `Cycle` database columns and DTO fields. | Staff enters technical specs that immediately vanish on save. | Extend backend `Cycle` entity/DTO or remove unstored inputs until backend supports them. | **High** |
| **G-API-3** | **No Backend APIs for Appointments, Services Catalog, Inventory, Payments, or Settings** | UI modules exist on disk (commented out/unrouted) backed only by empty `CycleDataService`. | REST APIs for `/api/appointments`, `/api/services`, `/api/settings` (and `/api/inventory`, `/api/payments` if in scope). | Required to enable online booking, dynamic pricing, and invoicing. | Confirm phase scope with client; prioritize `/api/appointments` and `/api/services` first. | **High** |
| **G-API-4** | **Unused `/api/demo-requests` WhatsApp Booking Endpoint** | Backend & `DemoService` support `GET/POST /api/demo-requests` returning `whatsAppUrl`, but zero UI components call it. | Public booking/callback form and Admin Leads tab. | Quick win to capture customer inquiries with instant WhatsApp handoff today. | Confirm with client if WhatsApp booking requests should be surfaced on `/landing` and Admin. | **Medium** |

### 8.7 Missing Application Functionality
| # | Finding | Current Situation | What Is Missing | Why Required | Suggested Solution | Priority |
|---|---|---|---|---|---|---|
| **G-FNC-1** | **QR Code Links to Protected Raw JSON API** | QR stickers encode `https://c-api-7x7e.onrender.com/api/cycles/{cycleId}/service-info`, which requires JWT Bearer auth and returns raw JSON. | Public, mobile-friendly frontend route (`/bike/:qrToken`) backed by a token-based public endpoint. | A customer scanning their bike's QR sticker with a phone camera currently gets a `401 Unauthorized` error or raw JSON instead of a branded Service Passport. | Build a public Angular view `/bike/:qrToken` and public API returning non-PII bike & service history. | **Critical** |
| **G-FNC-2** | **Service Table Filters Disabled & Missing Table Search** | On `/services`, the filter toolbar HTML is commented out (`services-list.component.ts` L167–210); in-page search was removed across `/services` and `/customers`. | Restored status/technician/priority filters and record search on `/services` and `/customers`. | As ticket/customer counts grow into hundreds, staff cannot quickly find a customer or ticket by phone/name/ID. | Uncomment filter toolbar and add clean server/client search bars for data tables. | **High** |
| **G-FNC-3** | **Account Activation & Forgot Password Flows Missing** | Backend has `POST /api/auth/activate`, but no frontend route `/activate` exists; "Forgot?" on login shows a static message. | Account activation UI (`/activate?token=...`) and password reset flow. | Required for secure staff onboarding and self-service recovery. | Build `/activate` page wired to `POST /api/auth/activate` and add password reset API. | **Medium** |
| **G-FNC-4** | **Reports Dashboard Built but Unrouted** | `ReportsDashboardComponent` is wired to live `TicketService` data but has no route or menu item. | Route `/reports` + topbar menu link (plus date-range/export features if desired). | Gives owners visibility into ticket priority/status breakdowns. | Register `/reports` under `adminGuard` if approved by client. | **Low** |

### 8.8 UI/UX Improvements
| # | Finding | Current Situation | What Is Missing | Why Required | Suggested Solution | Priority |
|---|---|---|---|---|---|---|
| **G-UX-1** | **Logo Cramped in Topbar + Redundant Text** | `app.topbar.ts` forces `2137×736` horizontal logo into `40×40px` beside text saying `CYCLE SERVICE`. | Proper horizontal logo sizing (`height: 36px; width: auto`) OR square brand icon + `FREEWHEEL FACTORY` label. | Current logo is barely readable in the navbar. | Use square monogram icon next to text, or show wide wordmark cleanly without redundant text. | **High** |
| **G-UX-2** | **Misleading Hardcoded Fallback Specs & Field Bugs** | `services-list.component.ts` displays `'Hydraulic Disc'`, `'Shimano 12-Speed'`, `'700c'` when real bike specs are null; `getBicycleType()` returns `ticket.udF1` (Intake Condition!); `service-form.component.ts` looks up `field === 'udF1'` instead of `'udf1'`. | Accurate `—` fallbacks and corrected field bindings. | Showing false technical specs (e.g., saying a rim-brake bike has Hydraulic Disc) misleads mechanics. | Replace dummy fallbacks with `'Not specified'`/`'—'` and fix `getBicycleType()` and `udF1` lookup bugs. | **High** |
| **G-UX-3** | **Developer API Jargon Visible in User-Facing UI** | Pages display raw endpoint paths to staff (e.g., `"Live client directory powered by /api/misc/customers"`, `"API Live (POST /api/cycles)"`, `"Backend Source: GET /api/tickets"`). | Clean, non-technical business copy. | Looks unfinished to workshop staff and clients. | Replace developer debug labels with natural operational descriptions. | **Medium** |
| **G-UX-4** | **Leftover Sakai Demo Pages & Duplicate Assets** | Routes `/documentation`, `/crud`, `/empty`, `uikit/*` remain in app; `logo.png` & `logo-dark.png` are duplicated in both `public/assets/images/` and `src/assets/images/`. | Cleanup of template demo routes and unused files. | Reduces bundle bloat and prevents admins stumbling onto demo pages. | Remove Sakai demo routes/files and keep assets exclusively in `public/assets/images/`. | **Low** |

### 8.9 Mobile Responsiveness Issues
| # | Finding | Current Situation | What Is Missing | Why Required | Suggested Solution | Priority |
|---|---|---|---|---|---|---|
| **G-MOB-1** | **Wide 10-Column Data Table on Mobile (`/services`)** | `ServicesListComponent` uses `responsiveLayout="scroll"` across 10 columns, whereas `ServiceTodayJobsWidget` uses `responsiveLayout="stack"`. | Mobile card/stack layout or priority column hiding on `<768px`. | Mechanics using phones/tablets at the workstand struggle with horizontal table scrolling. | Use PrimeNG stacked responsive layout or mobile card view on small viewports. | **Medium** |
| **G-MOB-2** | **Fixed Grid Modals & Forms on Narrow Screens** | `bicycles-list.component.ts` Add Bike modal and `technicians-list.component.ts` Add/Edit modals use `grid-cols-2` without responsive `grid-cols-1 sm:grid-cols-2` breakpoints; `appointment-form.component.ts` uses `ml-8` indent on mobile. | Responsive single-column stacking below `640px`. | Two-column form inputs become cramped and hard to tap on 360px–390px phone screens. | Change `grid-cols-2` to `grid-cols-1 sm:grid-cols-2` and use `sm:ml-8` on forms. | **Medium** |
| **G-MOB-3** | **Desktop Topbar Crowding at Medium Viewports (992px–1150px)** | Topbar contains logo + text + menubar + search bar + theme button + avatar + user details + logout inside fixed 68px header; mobile menu only switches below `991px`. | Tighter breakpoint tuning or compact search toggle around `1024px–1150px`. | Prevents overlapping or cramped header elements on tablets/small laptops. | Test and refine `@media (max-width: 1120px)` rules in `app.topbar.ts`. | **Low** |

### 8.10 Security & Operational Considerations
| # | Finding | Current Situation | What Is Missing | Why Required | Suggested Solution | Priority |
|---|---|---|---|---|---|---|
| **G-SEC-1** | **CRITICAL: Client-Side Authentication Bypass Fallback** | In `src/app/common/services/auth.service.ts` (L97–151), **any** error from `POST /api/auth/login` (including invalid credentials or 400/401!) triggers `authenticateLocal()`, which logs in ANY username containing `"admin"` (with any 4+ char password) as **Admin**, and ANY other username as **User**! | Strict API-only authentication with zero offline bypass in production. | Anyone can enter `admin` + `1234` and bypass login into the Admin portal UI. | **Immediately remove `authenticateLocal()` fallback** from `AuthService` (or guard strictly behind a dev-only mock flag excluded from production builds). | **Critical** |
| **G-SEC-2** | **Publicly Exposed Test Endpoints in Backend Swagger** | `swagger.json` exposes `/api/test`, `/api/test/database`, `/api/test/jwt`, `/api/test/password-hash`, `/api/test/password-hash-temp` with no auth. | Removal or Development-environment gating of diagnostic endpoints. | Exposing DB connectivity and crypto test endpoints increases attack surface. | Restrict all `/api/test/*` routes and Swagger UI to Development environment only. | **Critical** |
| **G-SEC-3** | **Missing Auth Security Definition on `GET /api/tickets` & `GET /api/demo-requests`** | In `swagger.json`, `GET /api/tickets` and `GET /api/demo-requests` lack the `JWTBearerAuth` security block, risking unauthenticated exposure of customer PII (names, phones, emails, addresses). | Mandatory JWT authorization on all internal read endpoints. | Protects customer personal data from unauthorized scraping. | Enforce `[Authorize]` / FastEndpoints auth on `GET /api/tickets` and `GET /api/demo-requests` (admin/staff roles). | **Critical** |
| **G-SEC-4** | **Role vs. Group Authorization Mismatch & Unsafe Array Access** | `AuthService` accesses `response.roles[0].name` (throws if `roles` is empty) while `AdminLoginComponent` routes based on `groups` containing `'Admin Team'`. | Safe optional chaining and unified role check. | Causes legitimate admins to be misrouted or crash into the local fallback. | Standardize on `response.roles?.some(r => r.name?.toLowerCase() === 'admin')`. | **High** |
| **G-SEC-5** | **Hardcoded Default Staff Password (`Temporary123!`)** | `technicians-list.component.ts` (L618) submits `'Temporary123!'` if password field is left blank during user creation. | Mandatory strong password input or server-generated one-time activation token. | Predictable default passwords are a severe account-takeover risk. | Require explicit password validation or send secure activation link via `/api/auth/activate`. | **High** |
| **G-SEC-6** | **XSS Risk in QR Print Window (`services-list.component.ts`)** | `services-list.component.ts` (L1335) injects raw `cycleModel` directly into `printWindow.document.write(...)` without HTML escaping (unlike `bicycles-list.component.ts`, which properly uses `escapeHtml()`). | HTML sanitization/escaping before writing to print document. | Prevents HTML/script injection via crafted bicycle model names. | Reuse `escapeHtml()` helper in `ServicesListComponent.printQrCode()`. | **Medium** |
| **G-SEC-7** | **Legacy Unused Auth Headers (`Facility`, `TraderKey`, `storer`)** | `AuthService.getAuthHeaders()` references unrelated warehouse/WMS keys (`Facility`, `TraderKey`, `storer`). | Clean auth service focused solely on Cycle App JWT claims. | Reduces maintenance confusion and unused localStorage clutter. | Clean up legacy template keys from `AuthService`. | **Low** |

---

## 9. Final Client Requirements Checklist

This master checklist maps directly to the companion non-technical document `CLIENT_ASSET_COLLECTION_CHECKLIST.md`.

### A. Images & Photography
| Req ID | Requirement Description | Priority | Mandatory / Optional | Client Response / Status |
|---|---|---|---|---|
| **REQ-IMG-01** | Hero Workshop Banner photo (1–2 wide 16:9 high-res shots of the service bay) | Critical | Mandatory | Pending |
| **REQ-IMG-02** | Shop Exterior & Main Storefront photos (2 landscape shots showing entrance & signage) | High | Mandatory | Pending |
| **REQ-IMG-03** | Interior Workshop & Servicing Workstations (2–3 wide & medium landscape shots) | High | Mandatory | Pending |
| **REQ-IMG-04** | Mechanics Actively Working on Bicycles (3–4 candid action photos) | High | Mandatory | Pending |
| **REQ-IMG-05** | Specialist Tools & Workshop Equipment close-ups (2–3 shots) | Medium | Mandatory | Pending |
| **REQ-IMG-06** | Customer Reception / Waiting / Display Area photos (1–2 shots, if available) | Low | Optional | Pending |
| **REQ-IMG-07** | Core Bicycle Type Photos: Road, Mountain (MTB), Hybrid, High-End Performance (4–6 shots) | High | Mandatory | Pending |
| **REQ-IMG-08** | Additional Bicycle Type Photos: Gravel, E-Bike, BMX (only if supported by workshop) | Low | Optional | Pending |
| **REQ-IMG-09** | Bicycle Component Close-Ups & Before/After Service Photos (4–6 shots) | Medium | Optional (Recommended) | Pending |
| **REQ-IMG-10** | Service-Specific Photos for all client-confirmed core & specialist services (8–16 shots) | High | Mandatory | Pending |

### B. Logo & Branding
| Req ID | Requirement Description | Priority | Mandatory / Optional | Client Response / Status |
|---|---|---|---|---|
| **REQ-BRD-01** | Master Vector Logo files (SVG / AI / EPS) for both Light-on-Dark and Dark-on-Light versions | Critical | Mandatory | Partial (PNGs only) |
| **REQ-BRD-02** | Square Brand Icon / Monogram Logo (1:1 ratio, SVG/PNG) for topbar, favicon & mobile icon | Critical | Mandatory | Pending |
| **REQ-BRD-03** | Official Brand Color Palette confirmation (confirm `#ff6a00` orange + dark charcoal/navy or supply exact HEX codes) | High | Mandatory | Pending |
| **REQ-BRD-04** | Official Brand Typography / Font preferences (if any) | Low | Optional | Pending |
| **REQ-BRD-05** | Confirmation of exact brand name to display everywhere (Website, Admin Portal, QR Stickers) | Critical | Mandatory | Pending |
| **REQ-BRD-06** | Social Media / WhatsApp Link Preview Banner (`1200×630` or raw assets for designer to compose) | Medium | Mandatory (for launch) | Pending |

### C. Business Information
| Req ID | Requirement Description | Priority | Mandatory / Optional | Client Response / Status |
|---|---|---|---|---|
| **REQ-BIZ-01** | Official Registered Business Name, Tagline, and Year Established | Critical | Mandatory | Pending |
| **REQ-BIZ-02** | Complete Physical Workshop Address + Google Maps Share Link + Parking/Drop-Off notes | Critical | Mandatory | Pending |
| **REQ-BIZ-03** | Primary Phone Number, WhatsApp Business Number, and Official Business Email | Critical | Mandatory | Pending |
| **REQ-BIZ-04** | Website Domain Name(s) and Social Media Profile URLs (Instagram, Facebook, YouTube, Strava, Google) | High | Mandatory | Pending |
| **REQ-BIZ-05** | Opening & Closing Hours (Mon–Sun) and Weekly Off Day / Holiday Rules | Critical | Mandatory | Pending |
| **REQ-BIZ-06** | About Us Story: Company Introduction, Founder Story, Mission, Achievements, and "Why Choose Us" points | High | Mandatory (for public site) | Pending |

### D. Service Catalogue
| Req ID | Requirement Description | Priority | Mandatory / Optional | Client Response / Status |
|---|---|---|---|---|
| **REQ-SVC-01** | Confirmation of the 20 catalog services (mark each: Offer Now / Coming Soon / Not Offered) + any additional services | Critical | Mandatory | Pending |
| **REQ-SVC-02** | Approved Customer-Facing Descriptions & Checklist of Inclusions/Exclusions per service | High | Mandatory | Pending |
| **REQ-SVC-03** | Supported Bicycle Types (Road, MTB, Gravel, Hybrid, E-Bike, BMX, Kids) & Supported Brands | High | Mandatory | Pending |
| **REQ-SVC-04** | Standard Ticket Workflow Statuses, Intake Checklist Items, and Common Accessories List | High | Mandatory | Pending |
| **REQ-SVC-05** | Confirmation on Digital Bicycle Passport, 3D Bike Fit, Mobile Van, and Inventory/Payments scope (Phase 1 vs. Phase 2) | High | Mandatory | Pending |

### E. Team Information
| Req ID | Requirement Description | Priority | Mandatory / Optional | Client Response / Status |
|---|---|---|---|---|
| **REQ-TM-01** | Owner / Founder Name, Title, Short Bio, and Portrait Photo | High | Mandatory (for About Us) | Pending |
| **REQ-TM-02** | Staff & Technician Roster for Portal Setup (Full Name, Email, Phone, Role: Admin vs. Employee, Workshop Group) | Critical | Mandatory | Pending |
| **REQ-TM-03** | Public Team Profiles (Mechanic Names, Specializations, Years of Experience, Headshots, Group Photo) | Medium | Optional (Recommended) | Pending |

### F. Pricing & Booking Details
| Req ID | Requirement Description | Priority | Mandatory / Optional | Client Response / Status |
|---|---|---|---|---|
| **REQ-PRC-01** | Official Currency (`INR ₹` or other), Pricing per Service (Fixed / Starting From / On Inspection), and Tax/GST treatment | Critical | Mandatory | Pending |
| **REQ-PRC-02** | Estimated Turnaround Time / Duration for each confirmed service | High | Mandatory | Pending |
| **REQ-PRC-03** | Booking Workflow Preference (Instant Time-Slot Booking vs. WhatsApp/Callback Request) | High | Mandatory | Pending |
| **REQ-PRC-04** | Booking Time Slots, Maximum Daily Bike Capacity, Advance Notice Window, and Doorstep Pickup Rules (if any) | High | Mandatory (if booking enabled) | Pending |
| **REQ-PRC-05** | Customer Notification Preferences (WhatsApp, SMS, Email) and Alert Triggers | Medium | Mandatory | Pending |
| **REQ-PRC-06** | QR Sticker Requirements (confirm 3 cm × 3 cm print size, label text, and what customers see when scanning) | High | Mandatory | Pending |

### G. Certifications & Partnerships
| Req ID | Requirement Description | Priority | Mandatory / Optional | Client Response / Status |
|---|---|---|---|---|
| **REQ-CRT-01** | Authorized Brand Partnerships / Dealer Statuses + High-Res Partner Logos (only officially held) | Medium | Optional | Pending |
| **REQ-CRT-02** | Mechanic Certifications & Professional Training Credentials (names + certificate scans/badges) | Medium | Optional | Pending |

### H. Customer Testimonials & Reviews
| Req ID | Requirement Description | Priority | Mandatory / Optional | Client Response / Status |
|---|---|---|---|---|
| **REQ-REV-01** | 3–6 Verified Customer Testimonials (Name, Bike/Discipline, Quote, Permission to Publish) | Medium | Optional (Recommended) | Pending |
| **REQ-REV-02** | Google Business Profile Reviews Link (and current rating if to be featured) | Medium | Optional | Pending |

### I. Legal & Policy Information
| Req ID | Requirement Description | Priority | Mandatory / Optional | Client Response / Status |
|---|---|---|---|---|
| **REQ-LGL-01** | Service Workmanship Warranty Policy (duration, coverage, exclusions) | High | Mandatory | Pending |
| **REQ-LGL-02** | Appointment Cancellation, Rescheduling & No-Show Policy | High | Mandatory (if booking enabled) | Pending |
| **REQ-LGL-03** | Workshop Terms & Conditions (additional parts approval rule, unclaimed bicycle storage policy, liability terms) | High | Mandatory | Pending |
| **REQ-LGL-04** | Website Privacy Policy (handling of customer phone numbers, emails, addresses, and QR service history) | High | Mandatory (for public launch) | Pending |
| **REQ-LGL-05** | Tax / Billing Legal Info (Business Legal Entity Name, GSTIN/Tax ID, if generating invoices/receipts) | Medium | Optional (Mandatory if invoicing) | Pending |

---

## 10. Final Recommendations

### 10.1 Top 10 Items to Collect from the Client First
1. **Official Brand Name & Naming Sign-Off** (`Freewheel Factory` vs. `Cycle Service Center`) — resolves naming conflicts across titles, headers, login, and QR stickers.
2. **Master Vector Logo (SVG) + Square 1:1 Monogram Icon** — fixes the distorted topbar logo and prepares print/favicon assets.
3. **Confirmed Service Catalogue & Real Pricing** — review the 20 hardcoded services, remove unoffered ones, and supply real prices, durations, and currency.
4. **Core Contact & Location Info** — physical address, Google Maps pin, primary phone, WhatsApp Business number, official email, and operating hours.
5. **Initial Staff Roster & Roles** — names, emails, phones, and Admin vs. Employee permissions for workshop onboarding.
6. **QR Sticker & Public Scan Scope** — confirm whether customers scanning the 3 cm × 3 cm bike sticker should see a public service passport page (and which fields are visible).
7. **Workshop Hero, Storefront & Action Photography** (`IMG-003` to `IMG-006`) — mandatory to replace all Sakai template placeholders.
8. **Supported Bicycle Types & Core Service Photos** (`IMG-009`, `IMG-012`) — confirms whether E-Bikes, Gravel, BMX, Suspension, and 3D Bike Fit are in scope.
9. **Booking Flow & Capacity Rules** — choose between direct time-slot booking vs. WhatsApp request (`/api/demo-requests`), plus slots, daily limits, and cancellation policy.
10. **Warranty, Service Terms & Privacy Policy** — required before publishing the customer-facing site or collecting customer data online.

### 10.2 Images Required Before Website Development Can Be Completed
- **Blocking Launch:** Master SVG Logo + 1:1 Square Icon (`IMG-001`), Workshop Hero Banner (`IMG-003`), Shop Exterior (`IMG-004`), Workshop Interior & Workstations (`IMG-005`), Mechanics in Action (`IMG-006`), Core Bicycle Category Shots (`IMG-009`), Core Confirmed Service Photos (`IMG-012`), Owner Portrait (`IMG-014`), and Social Share Banner (`IMG-002`).
- **Can Be Added Post-Launch:** Waiting/lounge shots, before/after galleries, optional specialist services, partner logos, and group photos.

### 10.3 Content Required Before Launching the Public Website
- Approved Hero Headline, Tagline, and 3–6 "Why Choose Us" differentiators.
- About Us / Brand Story & Team Bios.
- Confirmed Services Menu with Descriptions, Inclusions, Pricing (or "Starting From"), and Turnaround Times.
- Verified Shop Address, Hours, Phone, WhatsApp, Email, and Social Links.
- Customer Testimonials (3–6) or Google Reviews link.
- Privacy Policy, Service Terms & Conditions, Warranty Policy, and Cancellation Policy.

### 10.4 Features Requiring Explicit Client Confirmation Before Further Development
1. **Public Website Scope:** Is this deployment strictly an **internal Admin/Staff Portal**, or should `/landing` be built into a full public customer website (Home, About, Services, Gallery, Contact, Online Booking)?
2. **Customer Portal Login (`/login`):** Do customers need email/password accounts, or is a **passwordless QR Service Passport + WhatsApp Booking** experience better?
3. **20-Service Advanced Lab Offerings:** Confirm whether **3D Bike Fitting**, **Mobile Workshop Van**, **E-Bike Diagnostics**, **Ultrasonic Waxing**, **Ceramic Coating**, and **Pre-Owned Carbon Audits** are active offerings.
4. **Phase 2 Operational Modules:** Confirm priority for **Appointments**, **Spare Parts Inventory**, **Payments & GST Invoicing**, **Digital Bicycle Passport Health Matrix**, and **Intake Photo Uploads**.
5. **Notification Channels:** Confirm whether WhatsApp Business, SMS, or Email automation is budgeted and desired.

### 10.5 Critical Technical Issues Requiring Immediate Developer Attention
1. **[P0 - Security] Remove `AuthService.authenticateLocal()` bypass** (`src/app/common/services/auth.service.ts`) so failed logins can never fall back to local Admin access.
2. **[P0 - Security] Lock down backend APIs:** Remove/gate `/api/test/*` endpoints in production and enforce JWT auth on `GET /api/tickets` and `GET /api/demo-requests`.
3. **[P0 - Backend] Fix `POST /api/users` HTTP 500 crash** and implement `GET/PUT/DELETE /api/users` so Admin can manage technicians reliably.
4. **[P0 - UX/Architecture] Build public QR Service Passport page** (`/bike/:qrToken` + public non-PII API) so scanning a 3 cm × 3 cm bike sticker works on any customer's phone without JWT errors.
5. **[P1 - Backend] Fix `GET /api/cycles/{id}/service-info` HTTP 400** on newly created cycles with zero tickets; add `GET/PUT/DELETE /api/cycles` and `PUT/DELETE /api/customers/{id}`; extend `CreateCycleRequest` so bike specs aren't silently dropped; add customer duplicate email/phone validation.
6. **[P1 - Frontend] Fix UI bugs & regressions:** Standardize role check between `AuthService` and `AdminLoginComponent`; remove hardcoded `'Temporary123!'` password; escape HTML in `ServicesListComponent.printQrCode()`; uncomment `/services` filters and restore table search; fix `getBicycleType()` (`udF1` bug), `udF1`/`udf1` lookup bug, and misleading hardcoded bike spec fallbacks; remove Sakai demo routes and raw `/api/...` debug strings from UI copy.

### 10.6 Recommended Implementation Order

| Phase | Focus | Key Deliverables | Client Dependencies |
|---|---|---|---|
| **Phase 1: Security, Stability & Admin Polish** *(Immediate)* | Make the existing Admin/Staff Portal production-safe and bug-free. | Remove local auth bypass; lock `/api/test/*` & `GET /api/tickets`; fix `POST /api/users` 500 & cycle 400; add Customer/Cycle `PUT` APIs; restore `/services` filters & search; fix brand name & logo sizing; remove Sakai demo routes. | Brand name sign-off, SVG + 1:1 square icon, initial staff roster, confirmed ticket statuses. |
| **Phase 2: Public QR Passport & Service Catalog Alignment** | Deliver real rider value from every serviced bike and align workshop services. | Build public `/bike/:qrToken` Service Passport page; sync backend `/api/services` catalog (or finalized frontend config) with real prices & currency; add intake photo upload (`udF5`). | Confirmed service catalog, real prices/durations, QR sticker rules, warranty disclaimer. |
| **Phase 3: Public Website & Booking Launch** | Replace `/landing` boilerplate with a conversion-ready customer website. | Build Home, About Us, Services, Gallery, Contact, and Legal pages; connect Booking / WhatsApp Request flow (using `/api/appointments` or `/api/demo-requests`). | All photography (`IMG-002`–`IMG-015`), business info, About Us copy, booking rules, testimonials, legal policies. |
| **Phase 4: Extended Workshop Operations** *(Post-Launch)* | Expand workshop automation and revenue tracking. | Enable Appointments calendar, Payments & Invoicing, Spare Parts Inventory, Reports (`/reports`), Automated WhatsApp/SMS alerts, and Digital Passport health scoring / 3D Fit records (if confirmed). | Tax/GST details, parts SKU list, notification gateway accounts (WhatsApp/SMS), reporting KPIs. |
