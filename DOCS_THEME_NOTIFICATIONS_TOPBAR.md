# Cycle Service Center Admin Portal - Theme, Notifications & Topbar Architecture Documentation

## 1. Overview & Objectives
This document details the enhancements made to the **Cycle Service Center Admin Portal** to ensure production-ready reliability, consistent theming, clean API notification handling, and optimal visual accessibility across all pages.

---

## 2. Global Theme Management & Persistence

### Root Cause Analysis of Previous Theme Issues
1. **Collision of State**: `ThemeService` and `LayoutService` both independently attempted to write classes to `document.documentElement`, causing race conditions where `LayoutService` forced `darkTheme: false` on startup.
2. **Theme Flash (FOUC)**: On cold start or page refresh, Angular rendering occurred before the theme class was determined, resulting in white flashes before applying dark mode.

### Solution Architecture
1. **Default Theme = DARK**:
   - Default theme is hardcoded to `'dark'`.
   - If no explicit user choice is found in storage, `'dark'` is automatically chosen.
2. **Storage Key**:
   - Standardized on `cycle-theme` with values `'dark'` or `'light'`.
   - Synchronized with legacy `bicycle_theme_settings` for full backward compatibility with the theme drawer.
3. **Zero Flash of Unstyled Content (FOUC)**:
   - Added an inline bootstrapping script inside `src/index.html` within the `<head>` tag.
   - Executes synchronously prior to DOM rendering, reading `localStorage.getItem('cycle-theme')` and setting `.app-dark`, `.dark`, `data-theme="dark"`, and `colorScheme="dark"`.
4. **Single Source of Truth (`ThemeService`)**:
   - `ThemeService` (`src/app/theme/theme.service.ts`) provides:
     - `initializeTheme()`: Applies saved or default theme.
     - `setTheme('dark' | 'light')`: Updates signals, DOM attributes, PrimeNG toggle, and `localStorage`.
     - `toggleTheme()`: Toggles cleanly between dark and light modes.
     - `isDark()`: Reactive computed signal for components and templates.
     - `getCurrentTheme()`: Returns current active theme string.
   - `LayoutService` (`src/app/layout/service/layout.service.ts`) delegates its dark-mode signal directly to `ThemeService`.

---

## 3. Topbar & Brand Logo Visibility

### Problem
- The original logo file `assets/images/logo.png` featured pure white typography (`#FFFFFF`).
- When the application was switched to Light Mode, the white logo text blended into the light topbar background, becoming completely unreadable.

### Solution
- **Dual Asset Strategy**:
  - `assets/images/logo.png`: Maintained with white lettering for Dark Mode.
  - `assets/images/logo-dark.png`: Created with high-contrast slate-dark typography (`#1e293b`) with brand orange bike accent stripes for Light Mode.
- **Dynamic Template Binding**:
  - In `src/app/layout/component/app.topbar.ts`, the logo image dynamically switches:
    ```html
    <img [src]="themeService.isDark() ? 'assets/images/logo.png' : 'assets/images/logo-dark.png'" alt="Cycle Service Center Logo" class="h-9 w-auto object-contain transition-all duration-200" />
    ```
- **Semantic Topbar Colors**:
  - Replaced hardcoded text/icon styles with semantic tokens (`text-surface-900 dark:text-surface-0`, `bg-surface-100 dark:bg-surface-800`).
  - Search box, navigation buttons, dropdown menus, and quick user icons remain crisp in both themes.

---

## 4. Centralized API Notification System

### Notification Architecture
- **Global Toast Container**:
  - Placed `<p-toast position="top-right" [baseZIndex]="9999"></p-toast>` in root `src/app/app.html`.
  - Root injection of `MessageService` in `src/app/app.config.ts`.
  - Child components no longer instantiate private `providers: [MessageService]`, preventing isolated toast instances and phantom notifications.
- **Service Implementation (`AppNotificationService`)**:
  - Location: `src/app/common/services/notification.service.ts`.
  - Built-in deduplication: 1500ms time window suppressing duplicate toasts.
  - Safe error parsing: Sanitizes server responses, suppressing technical PostgreSQL (`Npgsql`), SQL exceptions, and raw stack traces.

### Notification Rules & Operations Matrix

| Operation | Scenario | Notification Behavior | Example Toast |
| :--- | :--- | :--- | :--- |
| **GET (Data Lists)** | Success | ❌ **No Toast** | Silent display of data |
| **GET (Data Lists)** | Error | ✅ **Error Toast** | `❌ Unable to load service tickets. Please try again.` |
| **GET (Misc / Lookups)** | Success | ❌ **No Toast** | Silent population of select dropdowns |
| **GET (Misc / Lookups)** | Error | ✅ **Error Toast** | `❌ Unable to load service types. Please try again.` |
| **POST / CREATE** | Success | ✅ **Success Toast** | `✓ Service Ticket Created: Ticket #TK-84920 created successfully.` |
| **POST / CREATE** | Error | ✅ **Error Toast** | `❌ Unable to create service ticket: [Friendly Message]` |
| **PUT / PATCH / UPDATE** | Success | ✅ **Success Toast** | `✓ Customer Updated: Customer profile saved successfully.` |
| **PUT / PATCH / UPDATE** | Error | ✅ **Error Toast** | `❌ Unable to update customer: [Friendly Message]` |
| **DELETE** | Success | ✅ **Success Toast** | `✓ Bicycle Deleted: Bicycle #102 was removed successfully.` |
| **DELETE** | Error | ✅ **Error Toast** | `❌ Unable to delete bicycle: [Friendly Message]` |
| **AUTH (401 Expiry)** | Intercept | ✅ **Warning Toast** | `⚠️ Session Expired: Your session has expired. Please sign in again.` |

---

## 5. Summary of Files Changed

| File | Change Description |
| :--- | :--- |
| `src/index.html` | Added inline pre-render script to read `cycle-theme` and apply dark mode classes before DOM paint to eliminate theme flash. |
| `src/app/theme/theme.service.ts` | Upgraded into single source of truth for theme state, persistence to `cycle-theme`, and bidirectional sync. |
| `src/app/layout/service/layout.service.ts` | Delegated dark mode signals to `ThemeService` to eliminate conflicting effects. |
| `src/app/layout/component/app.floatingconfigurator.ts` | Wired theme toggle button directly to `ThemeService.toggleTheme()`. |
| `src/app/layout/component/app.topbar.ts` | Added reactive logo switching (`logo.png` vs `logo-dark.png`) and semantic theme tokens. |
| `src/assets/images/logo-dark.png` | Added light-mode compatible high-contrast brand logo asset. |
| `public/assets/images/logo-dark.png` | Added light-mode compatible brand logo asset to public assets. |
| `src/app/theme/theme-drawer.component.ts` | Updated CSS classes to use theme tokens (`surface-900`, `surface-200`, etc.). |
| `src/app/common/services/notification.service.ts` | Created `AppNotificationService` with deduplication, CRUD helpers, and error sanitization. |
| `src/app/app.config.ts` | Provided `MessageService` globally at the root application config. |
| `src/app/app.html` & `src/app/app.ts` | Configured root `<p-toast>` container. |
| `src/app/common/interceptors/auth.interceptor.ts` | Integrated session expired notifications on HTTP 401. |
| `src/app/services/misc.service.ts` | Added failure toasts for lookup APIs while keeping success silent. |
| `src/assets/styles.scss` | Added creative glassmorphism, accent indicators, and light/dark styling for `.p-toast`. |
| `src/app/pages/services-mgmt/services-list.component.ts` | Integrated `AppNotificationService`, removed local `MessageService` and `ToastModule`. |
| `src/app/pages/services-mgmt/service-form.component.ts` | Integrated `AppNotificationService`, removed local `MessageService` and `ToastModule`. |
| `src/app/pages/customers/customers-list.component.ts` | Integrated `AppNotificationService`, removed local `MessageService` and `ToastModule`. |
| `src/app/pages/bicycles/bicycles-list.component.ts` | Integrated `AppNotificationService`, removed local `MessageService` and `ToastModule`. |
| `src/app/pages/technicians/technicians-list.component.ts` | Integrated `AppNotificationService`, removed local `MessageService` and `ToastModule`. |
| `src/app/pages/appointments/appointments-list.component.ts`| Integrated `AppNotificationService`, removed local `MessageService` and `ToastModule`. |
| `src/app/pages/appointments/appointment-form.component.ts`| Integrated `AppNotificationService`, removed local `MessageService` and `ToastModule`. |
| `src/app/pages/service-jobs/service-jobs-list.component.ts`| Integrated `AppNotificationService`, removed local `MessageService` and `ToastModule`. |
| `src/app/pages/inventory/inventory-list.component.ts` | Integrated `AppNotificationService`, removed local `MessageService` and `ToastModule`. |
| `src/app/pages/payments/payments-list.component.ts` | Cleaned up unused local `MessageService` and `ToastModule`. |
| `src/app/pages/settings/workshop-settings.component.ts` | Integrated `AppNotificationService`, removed local `MessageService` and `ToastModule`. |

---

## 6. Build & Verification Results
- **Build Status**: Successful (`npx ng build --no-progress`).
- **Bundle Generation**: Completed with zero compiler errors and zero lint warnings.
- **Application Structure**: 100% preserved (all routing, forms, PrimeNG datatables, dialogs, and authentication flows remain intact).
