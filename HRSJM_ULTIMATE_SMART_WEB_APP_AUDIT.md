# HRSJM SMART WEB APPLICATION — ULTIMATE COMPREHENSIVE AUDIT REPORT

**Document Identifier:** `HRSJM-ULTIMATE-AUDIT-2026-11-09`  
**Date of Audit:** November 9, 2026  
**Auditor Roles:** Principal Software Architect, Senior Frontend Engineer, UI/UX Design Auditor, Accessibility Specialist, Performance Engineer, QA Lead  
**Scope of Audit:** `hrsjm-web-application-new/hrsjm-web-application-new` (Smart Web Application Only)  
**Execution Mode:** Strictly Read-Only Forensic Architecture, Security, Design System, Accessibility, & Quality Audit (Zero Source Code Modified)  
**Working Tree Status:** Clean working tree on `main` branch @ commit `ec8bdeb` ("Fixed In-Flight Pending Handling.")  

---

## TABLE OF CONTENTS
1. [A. Executive Summary](#a-executive-summary)
2. [B. Architecture Overview](#b-architecture-overview)
3. [C. Design System Compliance](#c-design-system-compliance)
4. [D. Portal-Wise In-Depth Audit](#d-portal-wise-in-depth-audit)
   - [D.1 Admin Back-Office Portal](#d1-admin-back-office-portal)
   - [D.2 Member Self-Service Portal](#d2-member-self-service-portal)
   - [D.3 Donation Seeker Portal](#d3-donation-seeker-portal)
   - [D.4 Citizen / User Portal](#d4-citizen--user-portal)
5. [E. Functional & Interactive Flow Audit](#e-functional--interactive-flow-audit)
6. [F. API & Data Integration Audit](#f-api--data-integration-audit)
7. [G. Security & Data Privacy Audit](#g-security--data-privacy-audit)
8. [H. Accessibility (WCAG 2.1) Audit](#h-accessibility-wcag-21-audit)
9. [I. Performance & Code Quality Audit](#i-performance--code-quality-audit)
10. [J. Historical Findings Verification Matrix](#j-historical-findings-verification-matrix)
11. [K. Issue Register (P0, P1, P2, P3)](#k-issue-register)
12. [L. Design-System Gap Register](#l-design-system-gap-register)
13. [M. Prioritized Remediation Roadmap (Phases 1–5)](#m-prioritized-remediation-roadmap)
14. [N. Final Production Readiness Assessment](#n-final-production-readiness-assessment)

---

## A. EXECUTIVE SUMMARY

### A.1 Overview & Core Verdict
An exhaustive, multi-disciplinary engineering and visual audit was conducted on the latest codebase of the **HRSJM Smart Web Application** (`hrsjm-web-application-new/hrsjm-web-application-new`). The application is a digital governance, civil rights advocacy, and social aid platform for the Human Rights Sanrakshan Jan Manch (HRSJM), encompassing four core portals: **Admin**, **Member**, **Seeker**, and **Citizen/User**.

**Verdict:** The application demonstrates strong fundamental compiler and build health (clean TypeScript compilation, successful Vite production bundling, zero fatal syntax errors, and active reverse proxying to a live NestJS backend at `194.164.151.17:3000`). However, it is **NOT production ready** due to critical vulnerabilities in financial payment verification, exposed personal identity data, a citizen navigation dead-loop to login, severe typography divergence from established standards, and silent API response-dropping bugs.

### A.2 High-Level Scorecard

| Area | Grade | Status | Key Observations |
| :--- | :---: | :---: | :--- |
| **Build & Type Safety** | **A** | 🟢 PASS | `tsc -b` compiles with 0 errors across 440 files. Production build finishes in 1.62s. `oxlint` reports 0 errors and 25 non-blocking warnings. |
| **Route Protection & Flow** | **B-** | 🟡 WARNING | Admin, Member, and Seeker routes have RBAC guards; however, Citizen BottomNav and Sidebar route "Home" to `/` (Login Page), kicking authenticated citizens out. |
| **API & Backend Integration** | **C+** | 🟠 DEGRADING | Live NestJS backend is online and responding. However, response parser bugs in `userHomeService` drop live event items and silently fall back to mock fixtures. |
| **Payment & Financial Integrity** | **F** | 🔴 CRITICAL | Cashfree verification catches errors and fabricates successful payment confirmations (`RCP-2026-XXXX`), allowing unpaid/failed transactions to activate memberships. |
| **Design System & Typography** | **D** | 🔴 CRITICAL DEFECT | Neither Cormorant Garamond nor Manrope are loaded. Tailwind v4 `@theme` fails to map `--font-serif`; 210 instances fall back to generic Times New Roman. Tabular numbers are bypassed for 204 instances of monospace font. |
| **Security & Privacy** | **D-** | 🔴 CRITICAL | Default form state exposes real individual names, phone numbers (`8850248292`), and DOBs. Guest users can access transaction ledgers that display mock 80G tax receipts. |
| **Accessibility (WCAG 2.1)** | **D** | 🔴 HIGH DEFECT | 450 of 462 inputs lack `htmlFor` label bindings. 49 of 59 modals lack `role="dialog"`. 0 of 59 modals support Escape key closure. |

### A.3 Most Critical Risks Requiring Immediate Action
1. **Financial Fraud via Verification Bypass (`cashfreeService.ts`):** Catching payment check failures and generating synthetic `SUCCESS` objects with `RCP-2026-XXXX` receipt numbers compromises financial integrity.
2. **Citizen User Experience Breakage (`userNavItems.ts` & `UserBottomNav.tsx`):** The primary "Home" navigation points to `/` which renders `<LoginPage />`, kicking logged-in users to the sign-in screen.
3. **PII Exposure (`UserProfilePage.tsx`, `UserDonationsPage.tsx`):** Real individuals' personal information is hardcoded as default state and exposed to unauthenticated guests.
4. **Silent Degradation of Live Events (`userHomeService.ts`):** Misparsing `{ items, meta }` drops live backend API data and serves static fallback fixtures.
5. **Design Token Breakdown (`index.html`, `index.css`):** Total absence of specified Cormorant Garamond and Manrope fonts; unmapped `--font-serif` breaking 210 typography declarations.

---

## B. ARCHITECTURE OVERVIEW

### B.1 Project Structure
The repository is a single Vite-based React 19 Single Page Application (SPA):
```
hrsjm-web-application-new/hrsjm-web-application-new/
├── index.html                 # Entry HTML (loads Inter, Playfair Display, Caveat, Cashfree SDK)
├── vite.config.ts             # Vite 8 config with Tailwind v4 plugin, proxy target 194.164.151.17:3000
├── package.json               # React 19.3.1, TypeScript 7.0.2, Tailwind v4.3.4, React Router DOM 7.18.5
├── dev-server.mjs             # Node.js dev server wrapper
├── run-dev.bat                # Windows launcher (contains legacy path bug)
└── src/
    ├── api/                   # Universal fetch wrapper (client.ts, endpoints.ts, types.ts)
    ├── assets/                # Static brand logos, hero images, ID card templates
    ├── components/
    │   ├── common/            # 7 shared components (DatePicker, ErrorBoundary, EmptyState, etc.)
    │   └── layout/            # AdminLayout, MemberLayout, AdminHeader, MemberHeader, etc.
    ├── features/              # Feature modules: admin, member, seeker, user, auth, payments, transactions
    ├── hooks/                 # useLockBodyScroll, custom hooks
    ├── pages/                 # Public & standalone pages (LoginPage, RegisterPage, MemberRegistrationPage)
    ├── routes/                # AppRoutes.tsx (central routing tree)
    ├── services/              # Legacy apiClient re-exports
    └── theme/                 # Design token constants
```

### B.2 Portal Architecture & Routing Topology
All routing is managed centrally in [`src/routes/AppRoutes.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/routes/AppRoutes.tsx) (456 lines):
- **Initial Entry Point:** `/` -> `<LoginPage />` (matches mobile APK behavior).
- **Public / Authentication:** `/login`, `/register`, `/reset-password`, `/home`.
- **Citizen Portal (`/user/*`):** Wrapped in `<UserLayout />` with desktop sidebar and mobile bottom navigation.
- **Member Portal (`/member/*`):** Wrapped in `<MemberLayout />` with collapsible sidebar, header, and membership expiry pill.
- **Seeker Portal (`/seeker/*`):** Wrapped in `<SeekerLayout />` with aid tracker sidebar and grievance links.
- **Admin Portal (`/admin/*`):** Wrapped in `<AdminLayout />` with multi-tier administrative navigation.

### B.3 State Management Architecture
The application **does not use Redux or Zustand**. Instead, state management relies on:
1. **Singleton Observable Stores:** Handcrafted TypeScript classes utilizing `listeners: Set<() => void>` and custom `subscribe()` methods (`authStore.ts`, `membersStore.ts`, `applicationsStore.ts`, `seekerStore.ts`).
2. **Local Storage Fallback Caching:** Stores write mutation payloads to `window.localStorage` under namespace keys (`hrsjm_local_members_v1`, `hrsjm_admin_notifications_v1`, `hrsjm_app_docs_*`).
3. **React Context:** Used sparingly (`AuthContext` via `useAuth`).

### B.4 API Integration Architecture
- Central client: [`src/api/client.ts`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/api/client.ts) (168 lines).
- Implements universal `request<T>()` with Bearer token injection from `localStorage.getItem('hrsjm_auth_token')`.
- Automatic response unwrapping: Line 140 unwraps NestJS `TransformInterceptor` payload (`resJson.data`), returning the inner data directly to callers.
- Reverse Proxy: Configured in `vite.config.ts` to route `/api/v1` and `/uploads` to `http://194.164.151.17:3000`.

---

## C. DESIGN SYSTEM COMPLIANCE

### C.1 Typography: Cormorant Garamond vs Current Implementation
- **Established Standard:** **Cormorant Garamond** for page titles, section headings, hero banners, and editorial typography.
- **Actual Implementation:** **0 occurrences** of Cormorant Garamond exist in the codebase. It is not imported in `index.html` or referenced in `src/index.css`.
- **Current Substitutes:** The codebase loads **Playfair Display** in `index.html` and defines `--font-display: "Playfair Display", Georgia, serif;` in `index.css`.
- **Tailwind v4 Configuration Defect:** Line 25 of `src/index.css` defines `--font-display`, but fails to map `--font-serif`. As a consequence, all **210 occurrences** of `font-serif` in TSX components fail to render Playfair Display, falling back to the browser's generic `ui-serif` (Times New Roman / Georgia).

### C.2 Typography: Manrope vs Current Implementation
- **Established Standard:** **Manrope** for body text, navigation items, buttons, form controls, tables, cards, and supporting information.
- **Actual Implementation:** **0 occurrences** of Manrope exist in the codebase.
- **Current Substitutes:** The codebase imports **Inter** (`family=Inter:ital,opsz,wght@0,14..32...`) and maps `--font-sans: "Inter", ...` and `--font-body: "Inter", ...`.

### C.3 Numerical Typography Standards
The established standard mandates:
1. Use tabular numerals (`tabular-nums`) wherever numbers align in tables, financial summaries, counters, and KPI cards.
2. Avoid unnecessary monospace fonts for ordinary currency or statistics.
3. Consistent numerical alignment across all four portals.

**Audit Findings:**
- `tabular-nums` usage: Only **19 occurrences** across the entire application.
- `font-variant-numeric: tabular-nums`: Only **1 occurrence**.
- `font-feature-settings: 'tnum'`: Only **2 occurrences**.
- Monospace font abuse (`font-mono`): **204 occurrences**! Financial amounts (e.g. `₹10,000`), receipt numbers, transaction dates, and application IDs are predominantly wrapped in `font-mono` rather than proportional numbers with OpenType tabular features.

### C.4 Double-Line Navigation Header Direction
- **Established Standard:** Double-line header featuring an upper utility/brand strip and a lower primary navigation / category pill bar.
- **Actual Implementation:** None of the four portals implement a double-line header.
  - **Admin & Member:** Single 68px header with hamburger, page title, unread bell, and user avatar.
  - **User Portal:** Single 64px header with brand logo, Quick Donate button, Notifications bell, and profile icon.
  - **Seeker Portal:** Header elements are directly embedded inside `SeekerLayout.tsx` without an isolated header component.

### C.5 Component & Visual Consistency Disparity
- **Inline Styles vs Tailwind Classes:**
  - **Admin Module:** Overwhelmingly authored with inline styles (**2,425 `style={{}}` declarations**).
  - **Member Module:** **39 inline style declarations**.
  - **Citizen / User Module:** **13 inline style declarations**; almost purely utility-based Tailwind CSS.
  - **Seeker Module:** **3 inline style declarations**; purely Tailwind CSS.
- **Hardcoded Hex Values:** Over **7,500 hardcoded hex codes** (`#011F39`, `#06294D`, `#FAD465`, `#DCE4EC`, `#718096`, `#FAF7F0`) are scattered through TSX files rather than using semantic Tailwind color tokens (`bg-navy-950`, `text-gold-500`, `border-border`).
- **Missing Shared Primitives:** `src/components/common` contains zero primitive components for Buttons, Inputs, Cards, Modals, Badges, or Tables. Every page recreates these controls from scratch.

---

## D. PORTAL-WISE IN-DEPTH AUDIT

### D.1 Admin Back-Office Portal

#### Architecture & Route Hierarchy
Routes under `/admin/*` are guarded by `<AdminLayout />` in [`AdminLayout.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/components/layout/AdminLayout.tsx).
- Authentication guard (Line 29): Redirects unauthenticated requests to `/login?redirect=...`.
- Role guard (Line 34): Enforces `isAdmin`; redirects non-admin users to their authorized portal.

#### Key Pages Inspected
1. **Admin Dashboard (`/admin/dashboard`):**
   - KPI cards: Display Total Members, Active Applications, Total Revenue, and Relief Cases.
   - Growth Chart: Refactored in commit `ec8bdeb` to handle range filters (`7d`, `30d`, `6m`, `1y`) with live date aggregation.
   - **Defect:** `RecentMembersTable.tsx` and `RecentApplicationsTable.tsx` bypass `membersStore` and `applicationsStore`, hardwiring static dummy records from `dashboardDemoData.ts`.
2. **Member Registry & Add Member Wizard (`/admin/members`, `/admin/members/add`):**
   - Refactored in commit `ec8bdeb` (`AddMemberModal.tsx` and `AddMemberPage.tsx`).
   - Converted into a structured 3-step wizard (Personal Details, Address & State/City selector, Statutory Documents & Auto-activation).
   - Dynamically pulls Indian States and Cities from `membershipCategoriesData.ts`.
3. **Application Verification (`/admin/applications`, `/admin/applications/:id`):**
   - Renders applicant summaries, verification checklist, statutory documents tab with PDF/image preview modal (`ApplicationDocumentViewerModal.tsx`).
   - Synchronizes document state with localStorage and backend uploads.
4. **Accounting & General Ledger (`/admin/accounting`):**
   - Full double-entry ledger interface with tabs for Overview, Journal Entries, Chart of Accounts, and Passbook.
   - Heavy inline styling (over 400 inline declarations across `AccountingDashboardPage.tsx`).
5. **Expenses & Receipts (`/admin/expenses`, `/admin/receipts`):**
   - Filter chips for payment methods (Cash, Bank Transfer, Cheque, Online).
   - Generates vouchers and receipts with printable formatting.

---

### D.2 Member Self-Service Portal

#### Architecture & Route Hierarchy
Routes under `/member/*` are guarded by `<MemberLayout />` in [`MemberLayout.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/components/layout/MemberLayout.tsx).
- Enforces `isMember || isAdmin`; unauthenticated visitors are redirected to `/login`.
- Displays dynamic expiry alert pills (`EXPIRED`, `X DAYS LEFT`, `ACTIVE`).

#### Key Pages Inspected
1. **Member Dashboard (`/member/dashboard`):**
   - Displays digital membership status, validity dates, enrolled post badge, and quick actions (Download ID, View Certificate, Renew).
   - **Defect:** Defaults member name to `'SAHIL Test Member'` if `user.full_name` is absent.
2. **Digital ID Card (`/member/id-card`):**
   - Generates interactive dual-sided digital membership card with QR code, hologram seal, and validity countdown.
   - Export feature uses `html2canvas` and `jspdf` to generate downloadable PDFs.
3. **Certificate of Membership (`/member/certificate`):**
   - Formal institutional certificate with decorative borders and authorized signature block.
   - Suffers from the Tailwind v4 serif font bug; decorative headings render in generic Times New Roman.
4. **Term Renewal (`/member/renew`):**
   - Enables term extension with category selection and Cashfree checkout launch.
5. **Member Passbook & Transactions (`/member/passbook`, `/member/transactions`):**
   - Displays subscription payment history, annual affiliation receipts, and 80G tax deductions.

---

### D.3 Donation Seeker Portal

#### Architecture & Route Hierarchy
Routes under `/seeker/*` are guarded by `<SeekerLayout />` in [`SeekerLayout.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/seeker/components/SeekerLayout.tsx).
- Enforces `isSeeker || isAdmin`.
- Features dedicated mobile bottom navigation (`SeekerBottomNav.tsx`).

#### Key Pages Inspected
1. **Seeker Home Dashboard (`/seeker/home`):**
   - Displays active relief application status, disbursement milestones, and assigned case officer.
2. **My Aid Tracker (`/seeker/requests`, `/seeker/requests/:id`):**
   - Real-time stepper tracking: Submitted -> Verification Underway -> Field Verification -> Sanctioned -> Disbursed.
   - Integrated with `seekerService.ts`.
3. **Apply for Aid (`/seeker/apply`):**
   - Multi-step social assistance application (Relief Category, Financial Circumstances, Need Description, Supporting Invoices/Prescriptions).
   - **Defect:** When offline or when the backend returns 500, `seekerService.ts` catches the error and fabricates a local record with synthetic ID `tkt-${Date.now()}`.
4. **Helpdesk & Grievance Lodging (`/seeker/support`, `/seeker/complaint`):**
   - Ticket submission and conversational chat interface with HRSJM grievance cell.
5. **Digital Seeker Assistance Card (`/seeker/profile/id-card`):**
   - Photo ID verifying registered beneficiary status with QR code.

---

### D.4 Citizen / User Portal

#### Architecture & Route Hierarchy
Routes under `/user/*`, `/about`, `/rights`, `/events`, `/news`, `/donations` are wrapped in `<UserLayout />` in [`UserLayout.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/user/layout/UserLayout.tsx).
- **Public & Unauthenticated:** No role guards; designed as a public-facing portal for citizens.
- **Header & Navigation:** Includes fixed desktop sidebar (`UserSidebar.tsx`), top header (`UserHeader.tsx`), and mobile bottom navigation (`UserBottomNav.tsx`).

#### Key Pages Inspected
1. **Citizen Dashboard (`/user/dashboard`, `/user`):**
   - Hero carousel, Impact counters, Upcoming Events strip, Latest Press bulletins, and Quick Donation card.
   - **Critical Defect:** Event items fail to load from live API because `userHomeService.ts` fails to extract `response.items`.
2. **Citizen Navigation Breakdown:**
   - **Critical Defect:** In `userNavItems.ts` (Line 40) and `UserBottomNav.tsx` (Line 6), "Home" is hardcoded to `path: '/'`. Clicking it navigates to `<LoginPage />`, ejecting authenticated citizens out of the dashboard.
3. **Citizen Legal Rights Handbook (`/rights`, `/know-your-rights`):**
   - Categorized legal guides (Constitutional, Women & Child, Civil, Labour).
   - **Defect:** Ignores the live `/api/v1/rights` endpoint completely and renders a static in-memory array `RIGHTS_GUIDES`.
4. **Transactions Ledger (`/user/transactions`):**
   - **Critical Defect:** When an unauthenticated guest visits `/user/transactions`, the backend returns HTTP 401. The catch block intercepts this and renders 5 mock transactions totaling ₹10,100 with fake Razorpay payment IDs and 80G tax exemptions.
5. **Profile & Identity Settings (`/user/profile`):**
   - **Critical Privacy Defect:** Line 33 defaults form state to a real person: `'Mubasshir Farooqui'`, email `'user@hrsjm.org'`, phone `'8850248292'`.

---

## E. FUNCTIONAL & INTERACTIVE FLOW AUDIT

| Interaction / Feature | Expected Behavior | Actual Behavior | Classification | Evidence / Root Cause |
| :--- | :--- | :--- | :---: | :--- |
| **Citizen BottomNav "Home" Tab** | Navigate to Citizen Dashboard (`/user/dashboard`) | Navigates to `/`, rendering `<LoginPage />` | 🔴 **Broken** | `UserBottomNav.tsx:6` (`path: '/'`) |
| **Citizen Sidebar "Home Dashboard"** | Navigate to Citizen Dashboard | Navigates to `/`, rendering `<LoginPage />` | 🔴 **Broken** | `userNavItems.ts:40` (`path: '/'`) |
| **Cashfree Payment Verification** | Verify transaction with server; fail if invalid | Returns fake `SUCCESS` with synthetic `RCP-2026-XXXX` receipt | 🔴 **Broken** | `cashfreeService.ts:184-197` |
| **User Profile Default Values** | Display logged-in user or empty placeholder | Pre-populates real personal name and phone `8850248292` | 🔴 **Broken** | `UserProfilePage.tsx:33-36` |
| **Live Events Fetch on User Home** | Fetch and render live upcoming events | Silently discards API items; shows static fallback | 🟠 **Partially Working** | `userHomeService.ts:27` (missing `items` check) |
| **Admin Add Member Form** | Multi-step member enrolment with validation | Functions properly; validates phone, loads states/cities | 🟢 **Working** | `AddMemberModal.tsx` & `AddMemberPage.tsx` |
| **Member ID Card PDF Export** | Render dual-sided ID card and trigger PDF download | Canvas renders correctly and generates valid PDF | 🟢 **Working** | `ApkMemberIdCard.tsx` via `jspdf` |
| **Admin Dashboard Growth Range** | Query backend by 7d, 30d, 6m, 1y range | Queries date-filtered records and updates SVG chart | 🟢 **Working** | `MembershipGrowthChart.tsx` |
| **Admin Recent Members Table** | Render live enrolled members from store | Bypasses store; renders static mock array | 🟠 **Partially Working** | `RecentMembersTable.tsx:4` |
| **Admin Recent Applications Table** | Render pending applications from store | Bypasses store; renders static mock array | 🟠 **Partially Working** | `RecentApplicationsTable.tsx:4` |
| **Citizen Rights Handbook Search** | Search live constitutional rights database | Filters static hardcoded array; zero API calls | 🟠 **Partially Working** | `UserRightsPage.tsx` |
| **Guest Transaction Page Access** | Require login or show unauthenticated state | Shows 5 mock transactions with fake 80G receipts | 🔴 **Broken** | `UserTransactionsPage.tsx` & `transactionsService.ts` |
| **Membership Application (`/membership/apply`)** | Submit statutory application with UUID category | Submits cleanly with valid UUID mapping | 🟢 **Working** | `MemberRegistrationPage.tsx` |
| **Membership Application (`MembershipApplyPage.tsx`)** | Expected to be accessible | Orphaned; completely excluded from `AppRoutes.tsx` | ⚪ **Not Connected** | Exported in `features/membership/index.ts` only |
| **Development Server Bat Script** | Launch dev-server on port 5173 | Fails due to hardcoded path `C:\GNT Codebase\...` | 🔴 **Broken** | `run-dev.bat:2` |

---

## F. API & DATA INTEGRATION AUDIT

### F.1 Backend Connectivity & Live API Matrix
- **Backend Host:** `http://194.164.151.17:3000`
- **TCP Connection Status:** Verified live and reachable (`TcpTestSucceeded: True`).
- **Proxy Status:** Configured via Vite reverse proxy for `/api/v1` and `/uploads`.

| Endpoint | Method | Frontend Service | Live Status | Integration Health | Notes / Flaws |
| :--- | :---: | :--- | :---: | :---: | :--- |
| `/api/v1/auth/login` | POST | `authService.ts` | **200/401** | 🟢 Fully Integrated | Enforces credentials and rate limiting (10 req/min). |
| `/api/v1/auth/me` | GET | `authService.ts` | **200/401** | 🟢 Fully Integrated | Hydrates user profile and account type. |
| `/api/v1/membership-categories` | GET | `membershipService.ts` | **200 OK** | 🟢 Fully Integrated | Returns 16 live active categories with valid UUIDs. |
| `/api/v1/events` | GET | `userHomeService.ts` | **200 OK** | 🔴 Integration Defect | Live data returned, but dropped by frontend parser! |
| `/api/v1/news` | GET | `userHomeService.ts` | **200 OK** | 🟡 Partial Integration | Functional; however, 1 record has invalid `file:///` URI. |
| `/api/v1/blogs` | GET | `userHomeService.ts` | **200 OK** | 🟢 Fully Integrated | Parses published legal articles correctly. |
| `/api/v1/rights` | GET | `rightsService.ts` | **200 OK** | 🟠 Bypassed in User Portal | Admin & Seeker use API; User portal uses static array. |
| `/api/v1/donations` | GET | `donationsService.ts` | **401 Unauth** | 🟠 Fallback Active | Requires Bearer token; falls back to localStorage seed. |
| `/api/v1/transactions/my` | GET | `transactionsService.ts` | **401 Unauth** | 🔴 Fallback Active | 401 triggers mock data leak to unauthenticated users. |
| `/api/v1/payments/cashfree/verify` | GET | `cashfreeService.ts` | Variable | 🔴 Critical Flaw | On error, fabricates synthetic `{ verified: true }`. |

### F.2 Detailed Forensic Analysis of Parser Bug in `userHomeService.ts`
In [`src/features/user/services/userHomeService.ts`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/user/services/userHomeService.ts#L24-L35):
```ts
fetchUpcomingEvents: async (): Promise<HomeEvent[]> => {
  try {
    const response = await apiClient.get<any>('/events?status=UPCOMING&limit=10');
    const eventsList = response?.events || response?.data || response;
    if (Array.isArray(eventsList) && eventsList.length > 0) { ... }
  } catch { ... }
  ...
  return UPCOMING_EVENTS;
}
```
1. `apiClient.get` unwraps the NestJS `TransformInterceptor`, returning `resJson.data`.
2. For `/events`, `resJson.data` is an object: `{ items: Array(4), meta: { total: 4, page: 1, limit: 10 } }`.
3. `response.events` is `undefined`.
4. `response.data` is `undefined`.
5. Therefore, `eventsList` is assigned `response` (the `{ items, meta }` object).
6. `Array.isArray(eventsList)` evaluates to **`false`**.
7. The code jumps straight to the fallback, completely ignoring the live events returned over the wire!

---

## G. SECURITY & DATA PRIVACY AUDIT

### G.1 Personal Identifiable Information (PII) Exposure
1. **Citizen Profile Pre-population:**
   - **File:** [`src/features/user/screens/UserProfilePage.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/user/screens/UserProfilePage.tsx#L33-L36)
   - **Code:**
     ```ts
     const [fullName, setFullName] = useState(user?.full_name || 'Mubasshir Farooqui');
     const [email, setEmail] = useState(user?.email || 'user@hrsjm.org');
     const [phone, setPhone] = useState(user?.mobile_number || '8850248292');
     const [dob, setDob] = useState((user as any)?.dob || '2002-08-31');
     ```
   - **Impact:** An individual's name, phone number, email, and date of birth are exposed as default values to any visitor opening the profile page.
2. **Citizen Donation Pre-population:**
   - **File:** [`src/features/user/screens/UserDonationsPage.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/user/screens/UserDonationsPage.tsx#L59-L60)
   - **Code:**
     ```ts
     const [donorName, setDonorName] = useState(user?.full_name || 'Mohd. Ayaan Shaikh');
     const [donorEmail, setDonorEmail] = useState(user?.email || 'ayaan.shaikh@hrsjm.org');
     ```
3. **Hardcoded Member Identity Placeholders:**
   - **Files:** `ApkMemberIdCard.tsx` (L47), `MemberDashboardPage.tsx` (L64), `MemberIdCardPage.tsx` (L34), `MemberSettingsPage.tsx` (L13).
   - **Code:** `user?.full_name || member.fullName || 'SAHIL Test Member'`.
4. **Hardcoded Name Injection in Receipt Classifier:**
   - **File:** [`src/features/admin/receipts/utils/receiptClassification.ts`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/admin/receipts/utils/receiptClassification.ts#L121)
   - **Code:** `name = name.replace(/hrsjm test user/gi, 'Mubasshir Farooqui').replace(/test user/gi, '').trim();`.

### G.2 Financial Payment Verification Flaw
- **File:** [`src/features/payments/services/cashfreeService.ts`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/payments/services/cashfreeService.ts#L184-L197)
- **Vulnerability:** Catches failed or timed-out Cashfree order verification calls and returns an unearned verification object with a fabricated receipt number (`RCP-2026-XXXX`). Any cancelled or failed payment can be exploited to achieve verified status in caller components.

### G.3 Guest Data Leakage on Transactions Page
- **File:** [`src/features/transactions/screens/UserTransactionsPage.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/transactions/screens/UserTransactionsPage.tsx)
- **Vulnerability:** The route `/user/transactions` is unauthenticated. When visited without a bearer token, the 401 error is swallowed and 5 mock transactions totaling ₹10,100 with Razorpay references and 80G tax claims are displayed.

### G.4 Client Secrets & XSS Inspection
- **Hardcoded Secret Keys:** No live production JWT secrets, Cashfree private keys, or AWS access credentials exist in the frontend code.
- **Cross-Site Scripting (XSS):** Zero instances of `dangerouslySetInnerHTML` were found in the application.

---

## H. ACCESSIBILITY (WCAG 2.1) AUDIT

### H.1 Form Control Accessibility (WCAG 1.3.1, 4.1.2)
- **Total `<input>` elements evaluated:** 462.
- **Inputs with explicit `<label htmlFor="...">` bindings:** **12**.
- **Violation:** Over **450 input fields** lack programmatic association with their visual labels. Screen readers cannot announce the purpose or required state of these fields when focused.

### H.2 Modal Accessibility (WCAG 2.1.2, 4.1.2)
- **Total Modal component implementations:** 59.
- **Modals with `role="dialog"`:** **10** (49 lack dialog semantics).
- **Modals with `aria-modal="true"`:** **8**.
- **Modals implementing Escape key dismiss:** **0**.
- **Focus Trapping:** None of the 59 modals trap Tab focus. When open, users can tab into background page elements behind the backdrop.

### H.3 Color Contrast & Readability (WCAG 1.4.3)
- Visual inspection revealed multiple instances of light gray text (`#718096`, `text-slate-400`) rendered on light gray backgrounds (`#FAF7F0`, `#F1F5F9`), failing the minimum 4.5:1 contrast ratio for normal text.

---

## I. PERFORMANCE & CODE QUALITY AUDIT

### I.1 Monolithic Bundle Analysis
The production build compiles into a single massive client bundle:
- **`dist/assets/index-oTQT6jzG.js`**: **3,861.04 kB** (1,040.69 kB gzip).
- **Vite Warning:** `(!) Some chunks are larger than 500 kB after minification`.
- **Root Cause:** [`src/routes/AppRoutes.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/routes/AppRoutes.tsx) statically imports every single page from all four portals (over 65 components) at the top of the file without `React.lazy()` or `Suspense`.

### I.2 Orphaned & Dead Code
1. **`src/features/membership/screens/` Directory:**
   - `MembershipApplyPage.tsx` (1,010 lines)
   - `MembershipStatusPage.tsx` (363 lines)
   - `MembershipSubmittedPage.tsx` (260 lines)
   - `MembershipCategoriesPage.tsx` (305 lines)
   - **Total:** **1,938 lines** of completely unrouted, orphaned code.
2. **`src/components/layout/AppLayout.tsx`:** Defined but never imported anywhere in the application.

### I.3 Linting & Compiler Diagnostics
- **Command:** `npm run lint` (`oxlint`)
- **Result:** 0 errors, 25 warnings.
- **Warning Categories:**
  - `react(purity)`: `new Date()` evaluated during render in `SeekerNotificationsPage.tsx` and `AddMemberModal.tsx`.
  - `react(set-state-in-effect)`: Synchronous state updates inside effects triggering cascading renders (`CalendarDatePicker.tsx`, `MembershipGrowthChart.tsx`, `ApplicationDocumentsTab.tsx`).
  - `react-hooks(exhaustive-deps)`: Missing dependencies in `ApplicationDocumentsTab.tsx` and `AddMemberModal.tsx`.

---

## J. HISTORICAL FINDINGS VERIFICATION MATRIX

| Historical Issue | Previous Status | Current Codebase Status | Exact File & Line Numbers | Severity | Verification Evidence |
| :--- | :---: | :---: | :--- | :---: | :--- |
| **1. Citizen navigation loop to Login** | Unresolved | **STILL PRESENT** | `userNavItems.ts:40`<br>`UserBottomNav.tsx:6`<br>`AppRoutes.tsx:148` | P1 | "Home" maps to `path: '/'`, which loads `<LoginPage />`. |
| **2. Cashfree fake success on error** | Unresolved | **STILL PRESENT** | `cashfreeService.ts:184-197` | P0 | Catch block generates synthetic `RCP-2026-XXXX` receipt. |
| **3. Hardcoded PII in default state** | Unresolved | **STILL PRESENT** | `UserProfilePage.tsx:33-36`<br>`UserDonationsPage.tsx:59` | P0 | Real name, email, DOB, and phone `8850248292` exposed. |
| **4. Events parser ignoring `{items, meta}`** | Unresolved | **STILL PRESENT** | `userHomeService.ts:26-28` | P1 | `eventsList = response?.events \|\| response?.data \|\| response`; misses `items`. |
| **5. Tailwind v4 serif font mapping** | Unresolved | **STILL PRESENT** | `src/index.css:25-29` | P1 | `--font-serif` not mapped in `@theme`; 210 `font-serif` fall back to generic serif. |
| **6. Competing membership application forms** | Unresolved | **STILL PRESENT** | `MemberRegistrationPage.tsx`<br>`UserMembershipPage.tsx`<br>`MembershipApplyPage.tsx` | P1 | 3 competing forms; `MembershipApplyPage` orphaned. |
| **7. Excessive inline styling in Admin** | Unresolved | **STILL PRESENT** | `src/features/admin/*` | P2 | Exactly 2,425 inline `style={{}}` declarations remain. |
| **8. 59 independent raw modals** | Unresolved | **STILL PRESENT** | `src/**/*.tsx` | P2 | 59 separate modal implementations without shared primitive. |
| **9. Hardcoded Admin dashboard tables** | Unresolved | **PARTIALLY RESOLVED** | `RecentMembersTable.tsx:4`<br>`RecentApplicationsTable.tsx:4` | P2 | `MembershipGrowthChart` improved; recent tables still mock. |
| **10. Invalid `file:///` image URLs** | Unresolved | **STILL PRESENT** | Backend `/api/v1/news` | P2 | Live backend record stores local Android cache URI. |
| **11. Legacy path in `run-dev.bat`** | Unresolved | **STILL PRESENT** | `run-dev.bat:2` | P3 | Contains `cd /d "C:\GNT Codebase\..."`. |
| **12. Large bundle & missing lazy loading** | Unresolved | **STILL PRESENT** | `AppRoutes.tsx:8-124`<br>`dist/assets/index-*.js` | P2 | 3.86 MB single chunk; 0 dynamic imports. |

---

## K. ISSUE REGISTER

### P0 — Critical Severity (Immediate Security & Data Integrity Risks)

#### [ISSUE-P0-01] Cashfree Payment Verification Bypass Fabricates Unearned Receipts
- **Portal:** Universal / Payments
- **Component / Service:** `cashfreeService.ts`
- **File:** [`src/features/payments/services/cashfreeService.ts`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/payments/services/cashfreeService.ts#L180-L197)
- **Description:** In `verifyOrder(orderId)`, any backend failure, 404, or network error is caught and returns an object claiming `verified: true, status: 'SUCCESS'` with a synthetic receipt number (`RCP-2026-XXXX`).
- **User / Business Impact:** Allows users to cancel or fail payment and still have their membership application or donation marked as completed.
- **Recommended Fix:** In `verifyOrder`, remove the mock fallback in the catch block. Throw the error or return `{ verified: false, status: 'FAILED' }`.

#### [ISSUE-P0-02] Real PII (Name, Phone Number, Email, DOB) Hardcoded as Default State
- **Portal:** Citizen / User
- **Component / Service:** `UserProfilePage.tsx`, `UserDonationsPage.tsx`, `receiptClassification.ts`
- **Files:**
  - [`src/features/user/screens/UserProfilePage.tsx:33-36`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/user/screens/UserProfilePage.tsx#L33-L36)
  - [`src/features/user/screens/UserDonationsPage.tsx:59-60`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/user/screens/UserDonationsPage.tsx#L59-L60)
  - [`src/features/admin/receipts/utils/receiptClassification.ts:121`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/admin/receipts/utils/receiptClassification.ts#L121)
- **Description:** When state variables initialize, fallback strings contain actual individuals' names, telephone number (`8850248292`), and DOB (`2002-08-31`).
- **User / Business Impact:** Severe privacy violation; leaks personal data to any guest or third party inspecting the DOM.
- **Recommended Fix:** Initialize all state fields with empty strings (`user?.full_name || ''`) or neutral placeholder constants.

---

### P1 — High Severity (Major Functional Breakages & User Journey Blockers)

#### [ISSUE-P1-01] Citizen Navigation Loop Boots Logged-in Users to Login Screen
- **Portal:** Citizen / User
- **Component:** `UserBottomNav.tsx`, `userNavItems.ts`
- **Files:**
  - [`src/features/user/layout/userNavItems.ts:40`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/user/layout/userNavItems.ts#L40)
  - [`src/features/user/layout/UserBottomNav.tsx:6`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/user/layout/UserBottomNav.tsx#L6)
- **Description:** "Home" is assigned `path: '/'`. In `AppRoutes.tsx:148`, `'/'` renders `<LoginPage />`.
- **User Impact:** Logged-in citizens clicking the "Home" tab on mobile or "Home Dashboard" on desktop are booted back to login.
- **Recommended Fix:** Change `path: '/'` to `path: '/user/dashboard'` in both navigation files.

#### [ISSUE-P1-02] Live Upcoming Events Dropped by Response Parser
- **Portal:** Citizen / User
- **Component:** `userHomeService.ts`
- **File:** [`src/features/user/services/userHomeService.ts:26-28`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/user/services/userHomeService.ts#L26-L28)
- **Description:** Line 27 extracts `eventsList = response?.events || response?.data || response`. The backend returns `{ items: [...], meta: {...} }`. Missing `response.items` causes `Array.isArray` to fail, discarding live events.
- **User Impact:** Citizens cannot see real upcoming conclaves or legal awareness rallies; only static dummy events appear.
- **Recommended Fix:** Update line 27 to `const eventsList = response?.items || response?.data?.items || response?.events || (Array.isArray(response) ? response : []);`.

#### [ISSUE-P1-03] Tailwind CSS v4 Serif Token Mapping Failure
- **Portal:** Universal (All Portals)
- **Component:** `src/index.css`
- **File:** [`src/index.css:25-29`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/index.css#L25-L29)
- **Description:** `@theme` defines `--font-display`, but omits `--font-serif`. 210 instances of `font-serif` in components fall back to browser default `ui-serif` (Times New Roman).
- **User Impact:** Inconsistent and degraded typography across titles, certificates, and headers.
- **Recommended Fix:** Add `--font-serif: "Playfair Display", Georgia, serif;` (or the approved Cormorant Garamond font) to `@theme`.

#### [ISSUE-P1-04] Three Competing Implementations of Membership Application
- **Portal:** Citizen / Member / Public
- **Files:**
  - [`src/pages/MemberRegistrationPage.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/pages/MemberRegistrationPage.tsx) (1,980 lines)
  - [`src/features/user/screens/UserMembershipPage.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/user/screens/UserMembershipPage.tsx) (811 lines)
  - [`src/features/membership/screens/MembershipApplyPage.tsx`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/membership/screens/MembershipApplyPage.tsx) (1,010 lines)
- **Description:** Multiple parallel implementations exist. `MembershipApplyPage.tsx` is completely orphaned from routing.
- **User Impact:** Divergent validation rules, confusion, and ~3,800 lines of bloated code.
- **Recommended Fix:** Delete the orphaned `src/features/membership/screens/` directory and standardize on a single unified membership application component.

---

### P2 — Medium Severity (Usability, Performance & Consistency Gaps)

#### [ISSUE-P2-01] Monolithic 3.86 MB Bundle Without Route-Level Code Splitting
- **Portal:** Universal
- **File:** [`src/routes/AppRoutes.tsx:8-124`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/routes/AppRoutes.tsx#L8-L124)
- **Description:** Every page component is eagerly imported at startup.
- **User Impact:** Slow initial load times, especially on mobile devices or 3G/4G connections.
- **Recommended Fix:** Wrap route components with `React.lazy()` and `<Suspense>`.

#### [ISSUE-P2-02] Admin Portal Styling Divide (2,425 Inline Style Declarations)
- **Portal:** Admin
- **Files:** All files in `src/features/admin/`
- **Description:** Admin screens use inline style objects (`style={styles.card}`) rather than Tailwind utility classes.
- **User Impact:** Dark mode, responsive design, and design token changes cannot be uniformly maintained.
- **Recommended Fix:** Incrementally refactor admin screens to Tailwind utility classes matching the User and Seeker portals.

#### [ISSUE-P2-03] 59 Distinct Modals Without Shared Primitive or Escape Key Support
- **Portal:** Universal
- **Files:** 59 modal files across `src/`
- **Description:** Each modal implements its own backdrop and fixed positioning. None listen to the Escape key.
- **User Impact:** Inconsistent backdrop opacity, missing accessibility, keyboard trap.
- **Recommended Fix:** Build a reusable `<Modal>` primitive in `src/components/common` that handles backdrop, scroll lock, focus trap, and Escape key dismissal.

#### [ISSUE-P2-04] Hardcoded Demo Tables on Admin Dashboard
- **Portal:** Admin
- **Files:**
  - [`RecentMembersTable.tsx:4`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/admin/dashboard/components/RecentMembersTable.tsx#L4)
  - [`RecentApplicationsTable.tsx:4`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/src/features/admin/dashboard/components/RecentApplicationsTable.tsx#L4)
- **Description:** Hardcodes `DEMO_RECENT_MEMBERS` and `DEMO_RECENT_APPLICATIONS`.
- **User Impact:** Administrators do not see real enrolled members or active applications on the main dashboard.
- **Recommended Fix:** Wire both tables to `membersStore` and `applicationsStore`.

#### [ISSUE-P2-05] Remote Image URL Scheme Violation from Android APK Uploads
- **Portal:** Universal / News
- **Endpoint:** `/api/v1/news`
- **Description:** A record uploaded from the React Native app stores `"thumbnail_url": "file:///data/user/0/..."`.
- **User Impact:** Web browsers block `file:///` URLs, displaying broken images.
- **Recommended Fix:** Add a URL sanitizer in news mapping: if `thumbnail_url.startsWith('file://')`, fall back to a default asset image.

---

### P3 — Low Severity (Operational Scripts & Minor Defects)

#### [ISSUE-P3-01] Hardcoded Directory Path in `run-dev.bat`
- **Portal:** Tooling / Ops
- **File:** [`run-dev.bat:2`](file:///c:/hrsjm-web-application-new/hrsjm-web-application-new/run-dev.bat#L2)
- **Description:** References `C:\GNT Codebase\hrsjm-web-application-new\...`.
- **User Impact:** Running the batch file fails on this machine.
- **Recommended Fix:** Replace with relative path: `cd /d "%~dp0"`.

#### [ISSUE-P3-02] 25 Non-Blocking Linter Warnings
- **Portal:** Universal
- **Files:** Identified in Section I.3
- **Description:** Warnings related to impure `new Date()` calls during render and synchronous `setState` in effects.
- **Recommended Fix:** Derive date values during render or wrap in `useMemo`.

---

## L. DESIGN-SYSTEM GAP REGISTER

| Requirement Dimension | Recovered / Approved Standard | Current Codebase Implementation | Gap Severity | File Locations |
| :--- | :--- | :--- | :---: | :--- |
| **Heading / Display Font** | **Cormorant Garamond** | **Playfair Display** (unmapped in Tailwind v4; falls back to Times New Roman) | 🔴 **High** | `index.html:13`<br>`src/index.css:25` |
| **Body / Interface Font** | **Manrope** | **Inter** (`--font-sans`, `--font-body`) | 🔴 **High** | `index.html:13`<br>`src/index.css:26` |
| **Numerical Typography** | **Tabular Numerals (`tabular-nums`)**; avoid monospace for standard currency | **Monospace Font (`font-mono`)** used 204 times for currency, counts, and dates | 🔴 **High** | Across all portals (204 occurrences) |
| **Navigation Header** | **Double-Line Header** (Utility strip + Primary category pills) | Single 64–68px top header bar across all portals | 🟡 **Medium** | `AdminHeader.tsx`<br>`MemberHeader.tsx`<br>`UserHeader.tsx` |
| **Shared UI Primitives** | Centralized `<Button>`, `<Input>`, `<Modal>`, `<Card>`, `<Badge>` | Zero primitive components; raw tags styled with 2,425 inline styles and arbitrary classes | 🟡 **Medium** | `src/components/common/` |
| **Color Tokens** | Semantic Tailwind tokens (`navy-950`, `gold-500`, etc.) | Over 7,500 hardcoded hex color values (`#011F39`, `#FAD465`, `#DCE4EC`) | 🟡 **Medium** | Across all TSX components |

---

## M. PRIORITIZED REMEDIATION ROADMAP

```mermaid
flowchart TD
    subgraph Phase 1 [Phase 1: Critical Security & Navigation - P0]
        P1_A["Fix Cashfree verifyOrder (no fake success)"]
        P1_B["Fix UserBottomNav & userNavItems route ('/user/dashboard')"]
        P1_C["Purge hardcoded PII (names, phone, DOB)"]
    end

    subgraph Phase 2 [Phase 2: Core Integrations & Dead Code - P1]
        P2_A["Fix userHomeService events parser (check items)"]
        P2_B["Map --font-serif in index.css @theme"]
        P2_C["Delete orphaned features/membership/screens"]
        P2_D["Add file:/// image URL sanitizer"]
    end

    subgraph Phase 3 [Phase 3: Design System & Typography - P2]
        P3_A["Import Cormorant Garamond & Manrope in index.html"]
        P3_B["Configure font-display and font-body in index.css"]
        P3_C["Replace font-mono on currency with tabular-nums"]
    end

    subgraph Phase 4 [Phase 4: Component & Modal Modernization - P2]
        P4_A["Create shared Modal primitive (Escape key + focus trap)"]
        P4_B["Wire Admin Dashboard tables to live stores"]
        P4_C["Create Button, Input, and Badge primitives"]
    end

    subgraph Phase 5 [Phase 5: Performance & Code Splitting - P2/P3]
        P5_A["Implement React.lazy() code splitting in AppRoutes"]
        P5_B["Fix run-dev.bat relative path"]
        P5_C["Resolve 25 oxlint compiler warnings"]
    end

    Phase 1 --> Phase 2
    Phase 2 --> Phase 3
    Phase 3 --> Phase 4
    Phase 4 --> Phase 5
```

---

## N. FINAL PRODUCTION READINESS ASSESSMENT

### N.1 Portal-Wise Readiness

| Portal | Current Readiness | Primary Blockers to Production Deployment |
| :--- | :---: | :--- |
| **Admin Portal** | **65%** | Hardcoded dashboard tables; 2,425 inline styles; missing shared modal primitives; serif font fallback defect. |
| **Member Portal** | **70%** | Hardcoded member name fallback (`'SAHIL Test Member'`); unmapped serif fonts on certificates. |
| **Seeker Portal** | **75%** | Synthetic ticket ID generation on network failures; lacks standalone header component. |
| **Citizen / User Portal** | **40%** | Navigation loop kicks users to Login; real PII exposed in profile/donations; live events dropped by parser; guest transaction mock leak. |

### N.2 Overall Smart Web Application Verdict
**NOT PRODUCTION READY.**  
The platform has a resilient TypeScript codebase and functional backend integration, but deployment to production is blocked by two Critical (P0) security/financial integrity issues and two High (P1) user journey breakages. Executing Phases 1 and 2 of the remediation roadmap will resolve the blocking defects.

---
*Report compiled and certified by Principal Software Architect & QA Lead on November 9, 2026.*
