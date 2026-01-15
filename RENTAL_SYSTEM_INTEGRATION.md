# Survey Equipment Rental Management System
## Complete Integration Guide

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Business Rules](#business-rules)
6. [Edge Cases](#edge-cases)
7. [Security & Authorization](#security--authorization)
8. [Frontend Implementation Guide](#frontend-implementation-guide)
9. [Image Upload Handling](#image-upload-handling)
10. [Dashboard Integration](#dashboard-integration)
11. [Testing Guide](#testing-guide)
12. [Deployment Checklist](#deployment-checklist)
13. [New Module Overview](#new-module-overview)

---

## System Overview

### Purpose
Enterprise-grade rental management system for high-value survey equipment (GPS units, drones, theodolites, total stations, levels). Optimized for weak internet connectivity, audit requirements, and real-world operational complexities.

### Key Features
- ✅ Multi-image equipment documentation (1-5 photos per equipment)
- ✅ Sponsor and responsible person tracking
- ✅ Automated overdue detection (server-side)
- ✅ Revenue calculation (server-side)
- ✅ Deposit management
- ✅ Equipment condition tracking
- ✅ Audit trail for all transactions
- ✅ Role-based access control
- ✅ Dashboard KPIs separate from sales metrics
- ✅ Graceful offline handling

---

## Architecture

### Multi-Tenant Design
```
Branch (Tenant)
├── Equipment (many)
├── Persons (many)
├── Sponsors (many)
└── Rental Contracts (many)
    └── Links Equipment + Customer + Dates
```

### Data Flow
```
1. Staff creates Equipment → Status: Available
2. Customer requests rental → Create RentalContract
3. System validates:
   - Equipment exists & available
   - Dates are valid
   - Rates/deposits captured
4. Equipment status → Rented
5. Backend calculates overdue daily
6. Staff processes return → Equipment status updated
7. Revenue finalized
```

### Business Logic Location
❌ **NEVER in Frontend:**
- Overdue calculation
- Revenue calculation
- Status transitions
- Deposit logic

✅ **Always in Backend:**
- All financial calculations
- Status validation
- Date math
- Audit logging

---

## Database Schema

### Table: `persons`
Tracks technicians, custodians, and managers responsible for equipment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Unique ID |
| branch_id | INTEGER | FK → branches, NOT NULL | Tenant isolation |
| full_name | VARCHAR | NOT NULL, INDEXED | Person's full name |
| role | VARCHAR | NOT NULL, INDEXED | Technician/Custodian/Manager |
| phone | VARCHAR | NULL | Contact number |
| identification | VARCHAR | NULL | ID/Passport number |
| notes | TEXT | NULL | Additional info |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_persons_branch_role` (branch_id, role)
- `idx_persons_active` (is_active)

---

### Table: `sponsors`
Organizations or individuals that sponsor equipment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Unique ID |
| branch_id | INTEGER | FK → branches, NOT NULL | Tenant isolation |
| name | VARCHAR | NOT NULL, INDEXED | Sponsor name |
| type | VARCHAR | NOT NULL, INDEXED | Company/NGO/Individual |
| contact_person | VARCHAR | NULL | Primary contact |
| phone | VARCHAR | NULL | Contact phone |
| email | VARCHAR | NULL | Contact email |
| agreement_reference | VARCHAR | NULL | Contract/agreement number |
| notes | TEXT | NULL | Additional info |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_sponsors_branch_type` (branch_id, type)
- `idx_sponsors_active` (is_active)

---

### Table: `equipment`
Survey equipment available for rental.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Unique ID |
| branch_id | INTEGER | FK → branches, NOT NULL | Tenant isolation |
| name | VARCHAR | NOT NULL, INDEXED | Equipment name |
| brand | VARCHAR | NULL | Brand/manufacturer |
| model | VARCHAR | NULL | Model number |
| serial_number | VARCHAR | UNIQUE, NOT NULL, INDEXED | Serial number (global unique) |
| category | VARCHAR | NOT NULL, INDEXED | Survey/GPS/Drone/Level/Theodolite/Total Station/Other |
| rental_rate_per_day | FLOAT | NOT NULL | Daily rate in TZS |
| deposit_amount | FLOAT | NOT NULL | Security deposit in TZS |
| condition | VARCHAR | DEFAULT 'Good' | New/Good/Needs Service |
| status | VARCHAR | DEFAULT 'Available', NOT NULL, INDEXED | Available/Reserved/Rented/Overdue/Maintenance |
| sponsor_id | INTEGER | FK → sponsors, NULL | Sponsor if applicable |
| responsible_person_id | INTEGER | FK → persons, NULL | Person responsible |
| images | JSON | NULL | Array of image URLs [url1, url2, ...] |
| notes | TEXT | NULL | Additional info |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Business Rules:**
- `serial_number` must be globally unique across ALL branches
- `status` transitions managed by rental operations
- `images` max 5 URLs

**Indexes:**
- `idx_equipment_serial` (serial_number) - UNIQUE
- `idx_equipment_branch_status` (branch_id, status)
- `idx_equipment_category` (category)

---

### Table: `rental_contracts`
Tracks equipment rentals to customers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Unique ID |
| branch_id | INTEGER | FK → branches, NOT NULL | Tenant isolation |
| equipment_id | INTEGER | FK → equipment, NOT NULL | Equipment being rented |
| customer_name | VARCHAR | NOT NULL, INDEXED | Customer name |
| customer_phone | VARCHAR | NOT NULL | Customer phone |
| customer_identification | VARCHAR | NULL | Customer ID/passport |
| start_date | DATE | NOT NULL, INDEXED | Rental start date |
| expected_return_date | DATE | NOT NULL, INDEXED | Expected return date |
| actual_return_date | DATE | NULL | Actual return date (NULL if not returned) |
| rate_per_day | FLOAT | NOT NULL | Rate snapshot at rental time |
| deposit_paid | FLOAT | NOT NULL | Deposit amount paid |
| status | VARCHAR | DEFAULT 'Active', NOT NULL, INDEXED | Reserved/Active/Overdue/Returned/Damaged |
| overdue_reason | VARCHAR | NULL | Reason if overdue |
| damage_notes | TEXT | NULL | Damage description if any |
| notes | TEXT | NULL | Additional notes |
| created_by_user_id | INTEGER | FK → users, NOT NULL | User who created rental |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Computed Fields (NOT stored):**
- `is_overdue`: `today > expected_return_date AND status NOT IN ('Returned', 'Damaged')`
- `days_rented`: `(actual_return_date OR today) - start_date + 1`
- `total_revenue`: `days_rented * rate_per_day`

**Business Rules:**
- `rate_per_day` and `deposit_paid` snapshot from equipment at rental creation (can be overridden)
- `overdue_reason` REQUIRED if `actual_return_date > expected_return_date`
- Status transitions:
  - `Reserved` → Future start date
  - `Active` → Currently rented
  - `Overdue` → Past expected return, not returned
  - `Returned` → Successfully returned
  - `Damaged` → Returned with damage

**Indexes:**
- `idx_rental_branch_status` (branch_id, status)
- `idx_rental_dates` (expected_return_date, actual_return_date)
- `idx_rental_customer` (customer_name)

---

## API Documentation

### Base URL
```
http://your-domain.com/api/v1/rentals
```

All endpoints require authentication via JWT token in `Authorization: Bearer <token>` header.

---

### 👤 Person Endpoints

#### POST /persons
Create a new person.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "role": "Technician",  // Technician, Custodian, Manager
  "phone": "+255712345678",
  "identification": "ID-12345",  // Optional
  "notes": "GPS specialist"  // Optional
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "branch_id": 1,
  "full_name": "John Doe",
  "role": "Technician",
  "phone": "+255712345678",
  "identification": "ID-12345",
  "notes": "GPS specialist",
  "is_active": true,
  "created_at": "2026-01-13T10:30:00Z",
  "updated_at": "2026-01-13T10:30:00Z"
}
```

---

#### GET /persons
List all persons.

**Query Parameters:**
- `active_only` (boolean, default: `true`) - Filter active persons
- `role` (string, optional) - Filter by role

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "branch_id": 1,
    "full_name": "John Doe",
    "role": "Technician",
    ...
  }
]
```

---

#### GET /persons/{person_id}
Get person details.

**Response:** `200 OK` (same structure as POST response)

**Errors:**
- `404` - Person not found

---

#### PUT /persons/{person_id}
Update person details.

**Request Body:** (all fields optional)
```json
{
  "full_name": "John Smith",
  "role": "Manager",
  "phone": "+255712345679",
  "is_active": false
}
```

---

### 🏢 Sponsor Endpoints

#### POST /sponsors
Create a new sponsor.

**Request Body:**
```json
{
  "name": "ACME Survey Corp",
  "type": "Company",  // Company, NGO, Individual
  "contact_person": "Jane Smith",  // Optional
  "phone": "+255712345678",  // Optional
  "email": "jane@acme.com",  // Optional
  "agreement_reference": "AGR-2024-001",  // Optional
  "notes": "5-year sponsorship"  // Optional
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "branch_id": 1,
  "name": "ACME Survey Corp",
  "type": "Company",
  "contact_person": "Jane Smith",
  "phone": "+255712345678",
  "email": "jane@acme.com",
  "agreement_reference": "AGR-2024-001",
  "notes": "5-year sponsorship",
  "is_active": true,
  "created_at": "2026-01-13T10:30:00Z",
  "updated_at": "2026-01-13T10:30:00Z"
}
```

---

#### GET /sponsors
List all sponsors.

**Query Parameters:**
- `active_only` (boolean, default: `true`)
- `type` (string, optional) - Filter by type

---

#### GET /sponsors/{sponsor_id}
Get sponsor details.

---

#### PUT /sponsors/{sponsor_id}
Update sponsor details.

---

### 🔧 Equipment Endpoints

#### POST /equipment
Create new equipment.

**Request Body:**
```json
{
  "name": "Trimble GPS R10",
  "brand": "Trimble",  // Optional
  "model": "R10",  // Optional
  "serial_number": "SN-12345-UNIQUE",  // Required, globally unique
  "category": "GPS",  // Survey, GPS, Drone, Level, Theodolite, Total Station, Other
  "rental_rate_per_day": 50000.00,
  "deposit_amount": 500000.00,
  "condition": "Good",  // New, Good, Needs Service
  "sponsor_id": 1,  // Optional
  "responsible_person_id": 2,  // Optional
  "images": [  // Optional, max 5
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "notes": "Recently calibrated"  // Optional
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "branch_id": 1,
  "name": "Trimble GPS R10",
  "brand": "Trimble",
  "model": "R10",
  "serial_number": "SN-12345-UNIQUE",
  "category": "GPS",
  "rental_rate_per_day": 50000.00,
  "deposit_amount": 500000.00,
  "condition": "Good",
  "status": "Available",
  "sponsor_id": 1,
  "responsible_person_id": 2,
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "notes": "Recently calibrated",
  "created_at": "2026-01-13T10:30:00Z",
  "updated_at": "2026-01-13T10:30:00Z",
  "sponsor": { ... },  // Nested sponsor object
  "responsible_person": { ... }  // Nested person object
}
```

**Errors:**
- `400` - Serial number already exists
- `404` - Sponsor or person not found (if IDs provided)

---

#### GET /equipment
List all equipment.

**Query Parameters:**
- `status` (string, optional) - Filter by status
- `category` (string, optional) - Filter by category
- `available_only` (boolean, default: `false`) - Show only available

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Trimble GPS R10",
    "status": "Available",
    ...
  }
]
```

---

#### GET /equipment/{equipment_id}
Get equipment details with nested relationships.

---

#### PUT /equipment/{equipment_id}
Update equipment details.

**Request Body:** (all fields optional)
```json
{
  "name": "Trimble GPS R10 V2",
  "condition": "Needs Service",
  "status": "Maintenance",
  "rental_rate_per_day": 55000.00,
  "images": ["new-url1.jpg", "new-url2.jpg"]
}
```

---

### 📋 Rental Contract Endpoints

#### POST /rentals
Create a new rental.

**Request Body:**
```json
{
  "equipment_id": 5,
  "customer_name": "ABC Construction Ltd",
  "customer_phone": "+255712345678",
  "customer_identification": "ID-67890",  // Optional
  "start_date": "2026-01-15",
  "expected_return_date": "2026-01-20",
  "rate_per_day": 50000.00,  // Optional, overrides equipment rate
  "deposit_paid": 500000.00,  // Optional, overrides equipment deposit
  "notes": "Urgent project"  // Optional
}
```

**Business Logic:**
- Equipment must be `Available` or `Reserved`
- If `start_date > today`, status → `Reserved`, equipment → `Reserved`
- If `start_date <= today`, status → `Active`, equipment → `Rented`
- `rate_per_day` and `deposit_paid` default to equipment values

**Response:** `201 Created`
```json
{
  "id": 1,
  "branch_id": 1,
  "equipment_id": 5,
  "customer_name": "ABC Construction Ltd",
  "customer_phone": "+255712345678",
  "customer_identification": "ID-67890",
  "start_date": "2026-01-15",
  "expected_return_date": "2026-01-20",
  "actual_return_date": null,
  "rate_per_day": 50000.00,
  "deposit_paid": 500000.00,
  "status": "Active",
  "overdue_reason": null,
  "damage_notes": null,
  "notes": "Urgent project",
  "created_by_user_id": 3,
  "created_at": "2026-01-13T10:30:00Z",
  "updated_at": "2026-01-13T10:30:00Z",
  "is_overdue": false,
  "days_rented": 1,
  "total_revenue": 50000.00,
  "equipment": { ... }
}
```

**Errors:**
- `404` - Equipment not found
- `400` - Equipment not available
- `400` - Invalid dates (return before start)

---

#### GET /rentals
List all rentals.

**Query Parameters:**
- `status` (string, optional) - Filter by status
- `show_overdue` (boolean, default: `false`) - Show only overdue
- `customer_name` (string, optional) - Search by name

**Response:** `200 OK` (array of rental objects)

---

#### GET /rentals/active
List all active rentals (not yet returned).

Includes `Reserved`, `Active`, and `Overdue` statuses.

---

#### GET /rentals/overdue
List all overdue rentals.

Backend calculates: `today > expected_return_date AND status NOT IN ('Returned', 'Damaged')`

---

#### GET /rentals/{rental_id}
Get rental details with computed fields.

---

#### PUT /rentals/{rental_id}
Update rental (extend dates, add notes).

**Request Body:**
```json
{
  "expected_return_date": "2026-01-25",  // Extend rental
  "notes": "Customer requested extension"
}
```

**Does NOT handle returns** - use `POST /rentals/{id}/return` instead.

---

#### POST /rentals/{rental_id}/return
Process equipment return.

**Request Body:**
```json
{
  "actual_return_date": "2026-01-21",
  "condition_on_return": "Good",  // New, Good, Needs Service
  "damage_notes": "Minor scratch on casing",  // Optional, required if damaged
  "overdue_reason": "Customer delayed"  // Required if actual > expected
}
```

**Business Logic:**
1. Validates rental not already returned
2. Checks if overdue → requires `overdue_reason`
3. Updates rental status:
   - `Returned` if no damage
   - `Damaged` if damage notes provided
4. Updates equipment:
   - Condition set to `condition_on_return`
   - Status → `Available` (if good) or `Maintenance` (if damaged/needs service)
5. Finalizes revenue calculation

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "Returned",
  "actual_return_date": "2026-01-21",
  "is_overdue": true,
  "days_rented": 6,
  "total_revenue": 300000.00,
  ...
}
```

**Errors:**
- `404` - Rental not found
- `400` - Rental already returned
- `400` - Missing overdue_reason for late return

---

#### POST /rentals/{rental_id}/overdue-reason
Set overdue reason while rental is still active.

**Request Body:**
```json
{
  "overdue_reason": "Weather conditions",
  "notes": "Heavy rains delayed fieldwork"  // Optional
}
```

**Business Logic:**
- Allows setting reason before equipment is returned
- Auto-updates status to `Overdue` if past expected date
- Updates equipment status to `Overdue`

---

### 📊 Statistics Endpoints

#### GET /rentals/stats/summary
Get rental KPIs for dashboard.

**Response:** `200 OK`
```json
{
  "active_rentals": 12,
  "overdue_rentals": 3,
  "reserved_rentals": 2,
  "total_equipment": 45,
  "available_equipment": 30,
  "utilization_rate": 26.67,  // Percentage
  "revenue_today": 600000.00,  // TZS
  "revenue_this_month": 8500000.00  // TZS
}
```

**Calculation Details:**
- `active_rentals`: Currently rented equipment (Active + Overdue statuses)
- `overdue_rentals`: Rentals past expected return date and not returned
- `utilization_rate`: `(active_rentals / total_equipment) * 100`
- `revenue_today`: Sum of `rate_per_day` for all active rentals
- `revenue_this_month`: Sum of revenue for all rentals overlapping current month

---

#### GET /rentals/stats/top-equipment
Get most frequently rented equipment.

**Query Parameters:**
- `limit` (integer, default: 10, max: 50) - Number of items to return

**Response:** `200 OK`
```json
[
  {
    "equipment_id": 5,
    "equipment_name": "Trimble GPS R10",
    "brand": "Trimble",
    "category": "GPS",
    "rental_count": 45,
    "total_revenue": 2250000.00
  },
  ...
]
```

---

## Business Rules

### Equipment Status Lifecycle
```
[Available] ──rental created──> [Reserved/Rented]
                                       │
                                       ├──overdue──> [Overdue]
                                       │
                                       └──returned──> [Available]
                                                           or
                                                      [Maintenance]
```

### Rental Status Lifecycle
```
[Reserved] ──start date reached──> [Active]
                                       │
                                       ├──overdue──> [Overdue]
                                       │
                                       └──returned──> [Returned]
                                                           or
                                                      [Damaged]
```

### Financial Rules

#### Revenue Recognition
- **Accrual:** Daily rate × days rented
- **Days calculation:** `(return_date - start_date) + 1` (minimum 1 day)
- **Partial days:** Rounded to full days
- **Month boundaries:** Revenue attributed to rental period, not payment date

#### Deposit Handling
- Captured at rental creation
- Amount stored in rental record
- Return logic outside system scope (manual process)

### Overdue Logic

**Server-side calculation (NEVER in frontend):**
```python
def is_overdue(rental, today):
    if rental.status in ['Returned', 'Damaged']:
        return False
    return today > rental.expected_return_date
```

**Frontend displays only:**
- Overdue badge (boolean from API)
- Days overdue (computed by backend)
- Overdue reason (from database)

---

## Edge Cases

### 1. Early Return
**Scenario:** Customer returns equipment before expected date.

**Handling:**
- `actual_return_date < expected_return_date` is allowed
- Revenue calculated for actual days only
- No penalty or bonus
- Equipment immediately available for next rental

**Example:**
```
Expected: Jan 10 - Jan 20 (10 days × 50,000 = 500,000)
Actual:   Jan 10 - Jan 15 (5 days × 50,000 = 250,000)
Final Revenue: 250,000 TZS
```

---

### 2. Late Return (Overdue)
**Scenario:** Customer returns equipment after expected date.

**Handling:**
- `actual_return_date > expected_return_date` triggers overdue
- `overdue_reason` REQUIRED at return
- Revenue for all days charged (no penalty logic in system)
- Equipment status updated normally
- Overdue count affects KPIs

**Example:**
```
Expected: Jan 10 - Jan 15 (5 days × 50,000 = 250,000)
Actual:   Jan 10 - Jan 20 (10 days × 50,000 = 500,000)
Overdue: 5 days
Final Revenue: 500,000 TZS (no penalty, just extended days)
```

**Business Decision Required:**
- Penalty rates (if any) implemented as manual process or future feature
- Late fees handled outside system

---

### 3. Rental Extension
**Scenario:** Customer requests to extend rental before return.

**Handling:**
- Use `PUT /rentals/{id}` to update `expected_return_date`
- No fee for extension (business logic outside system)
- Equipment remains `Rented`
- Revenue calculation adjusted automatically

---

### 4. Damaged Equipment
**Scenario:** Equipment returned with damage.

**Handling:**
- At return, provide `damage_notes`
- Rental status → `Damaged`
- Equipment status → `Maintenance`
- Equipment condition → `Needs Service`
- Deposit forfeit/penalty handled outside system

**Example Return:**
```json
{
  "actual_return_date": "2026-01-20",
  "condition_on_return": "Needs Service",
  "damage_notes": "Screen cracked, GPS antenna bent",
  "overdue_reason": null  // Only if also late
}
```

---

### 5. Back-to-Back Rentals
**Scenario:** Equipment reserved for next customer before current rental ends.

**Handling:**
- System DOES NOT support automatic back-to-back scheduling
- Equipment must return to `Available` before next rental
- Manual coordination required
- Future enhancement: reservation queue

**Workaround:**
1. Current rental returns → Equipment `Available`
2. Immediately create next rental → Equipment `Rented`
3. Gap of minutes/hours acceptable

---

### 6. Forgotten Return Processing
**Scenario:** Equipment physically returned but staff forgot to process in system.

**Handling:**
- Rental remains `Active` or `Overdue`
- Equipment shows as `Rented` in system
- Manual correction required:
  - Use `POST /rentals/{id}/return` with correct `actual_return_date`
  - System accepts past dates
  - Revenue calculated correctly for actual period

**Prevention:**
- Dashboard shows overdue count prominently
- Regular reconciliation of physical vs. system inventory

---

### 7. Equipment Maintenance Mid-Rental
**Scenario:** Equipment breaks while rented.

**Handling:**
- Rental processing not affected
- Equipment status updates after return
- If customer reports issue:
  - Add to rental `notes`
  - Upon return, set `condition_on_return = "Needs Service"`
  - Equipment → `Maintenance`

---

### 8. Lost Equipment
**Scenario:** Equipment not returned, customer unreachable.

**Handling:**
- Rental remains `Overdue` indefinitely
- Manual resolution required:
  - Escalate to management
  - Legal/insurance process outside system
  - Eventually mark as `Returned` with notes explaining loss
  - Equipment status → `Maintenance` (removed from circulation)

---

### 9. Rate Changes
**Scenario:** Equipment rate increases after rental created.

**Handling:**
- Rental uses **snapshot** of rate at creation time
- Rate stored in `rental_contracts.rate_per_day`
- Changing equipment rate does NOT affect existing rentals
- Ensures financial consistency

---

### 10. Customer Data Errors
**Scenario:** Wrong phone number or name entered.

**Handling:**
- Use `PUT /rentals/{id}` to update customer info
- **NOT IMPLEMENTED** in current API (status quo: immutable)
- Business decision: allow corrections within first day?
- Workaround: Add correction to `notes` field

---

## Security & Authorization

### Authentication
All endpoints require valid JWT token:
```
Authorization: Bearer <token>
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **OWNER** | Full access to all rental operations |
| **MANAGER** | Create rentals, process returns, view all data |
| **STAFF** | Create rentals, view rentals, limited edit |

**Implementation:**
```python
from app.utils.auth import get_current_user, require_owner

# All rentals endpoints use get_current_user (authenticated user)
# Financial/admin endpoints use require_owner (owner-only)
```

### Data Isolation

**Multi-Tenant Security:**
- All queries filtered by `branch_id`
- Users can ONLY access their branch's data
- Equipment serial numbers globally unique across branches (audit requirement)

**Sensitive Data:**
- Customer identification: logged but not exposed in lists
- Sponsor agreements: access restricted
- Deposit amounts: visible only to owner/manager

### Audit Trail

**Every rental tracks:**
- `created_by_user_id`: Who created the rental
- `created_at`: When created
- `updated_at`: Last modification timestamp

**Future Enhancement:**
- Full change log table
- Before/after snapshots
- User action history

---

## Frontend Implementation Guide

### Technology Stack
- **Framework:** React / Vue / Angular
- **State Management:** Redux / Vuex / NgRx
- **UI Library:** Material-UI / Ant Design / TailwindCSS
- **Form Handling:** React Hook Form / Formik
- **Image Upload:** react-dropzone / vue-dropzone

### Component Structure

```
rentals/
├── components/
│   ├── PersonForm.jsx          # Person create/edit
│   ├── SponsorForm.jsx         # Sponsor create/edit
│   ├── EquipmentForm.jsx       # Equipment create/edit (with images)
│   ├── RentalForm.jsx          # Create rental
│   ├── RentalReturnModal.jsx  # Process return
│   ├── OverdueReasonModal.jsx # Set overdue reason
│   ├── EquipmentCard.jsx      # Equipment display
│   ├── RentalCard.jsx         # Rental display
│   └── ImageUploader.jsx      # Multi-image uploader
├── pages/
│   ├── PersonsPage.jsx        # List + create persons
│   ├── SponsorsPage.jsx       # List + create sponsors
│   ├── EquipmentPage.jsx      # List + create equipment
│   ├── RentalsPage.jsx        # List rentals
│   ├── ActiveRentalsPage.jsx # Active rentals view
│   └── OverdueRentalsPage.jsx# Overdue rentals view
└── services/
    └── rentalsApi.js          # API client
```

### Form Guidelines

#### Equipment Form (Most Complex)

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Equipment Information                       │
│ ─────────────────────────────────────────── │
│ Name: [_______________] *                   │
│ Brand: [______________]                     │
│ Model: [______________]                     │
│ Serial Number: [______] * (globally unique)│
│ Category: [Dropdown] *                      │
│                                             │
│ Financial Information                       │
│ ─────────────────────────────────────────── │
│ Rental Rate (TZS/day): [_____] *           │
│ Deposit Amount (TZS): [_____] *            │
│                                             │
│ Operational Information                     │
│ ─────────────────────────────────────────── │
│ Condition: [Dropdown] (Good default)        │
│ Sponsor: [Dropdown] (Optional)             │
│ Responsible Person: [Dropdown] (Optional)  │
│                                             │
│ Images (Optional)                           │
│ ─────────────────────────────────────────── │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐            │
│ │ + │ │img│ │img│ │ + │ │   │            │
│ └───┘ └───┘ └───┘ └───┘ └───┘            │
│ Drag & drop or click to upload (max 5)    │
│                                             │
│ Notes                                       │
│ ─────────────────────────────────────────── │
│ [Text area for additional info]            │
│                                             │
│ [Cancel] [Save Equipment]                  │
└─────────────────────────────────────────────┘
```

**Validation:**
- Required fields: name, serial_number, category, rental_rate, deposit
- Serial number: unique check (API error handling)
- Images: max 5, show preview, allow removal
- Currency: display with TZS symbol, format with commas

**UX Tips:**
- Autofocus on `name` field
- Disable submit until required fields valid
- Show loading spinner during save
- Success toast notification
- Error messages inline below fields

---

#### Rental Form

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Create Rental                               │
│ ─────────────────────────────────────────── │
│ Equipment: [Dropdown - Available only] *    │
│ ┌────────────────────────────────────────┐ │
│ │ Trimble GPS R10                        │ │
│ │ Rate: 50,000 TZS/day                   │ │
│ │ Deposit: 500,000 TZS                   │ │
│ │ [View Details]                         │ │
│ └────────────────────────────────────────┘ │
│                                             │
│ Customer Information                        │
│ ─────────────────────────────────────────── │
│ Name: [_______________] *                   │
│ Phone: [______________] *                   │
│ ID/Passport: [________]                    │
│                                             │
│ Rental Period                               │
│ ─────────────────────────────────────────── │
│ Start Date: [Date Picker] *                 │
│ Expected Return: [Date Picker] *            │
│ Duration: 5 days (calculated)               │
│                                             │
│ Financial Summary                           │
│ ─────────────────────────────────────────── │
│ Daily Rate: 50,000 TZS                      │
│ Estimated Cost: 250,000 TZS                 │
│ Deposit Required: 500,000 TZS               │
│ ─────────────────────────                  │
│ Total to Collect: 750,000 TZS              │
│                                             │
│ ☐ Override rate/deposit (advanced)         │
│                                             │
│ Notes                                       │
│ ─────────────────────────────────────────── │
│ [Text area]                                 │
│                                             │
│ [Cancel] [Create Rental]                   │
└─────────────────────────────────────────────┘
```

**Business Logic:**
- ✅ Calculate duration (days between dates)
- ✅ Display estimated cost (read-only, informational)
- ❌ **DO NOT** store estimated cost (backend calculates final)
- ❌ **DO NOT** calculate overdue (backend only)

---

#### Rental Return Modal

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Return Equipment                            │
│ ─────────────────────────────────────────── │
│ Equipment: Trimble GPS R10                  │
│ Customer: ABC Construction Ltd              │
│ Expected Return: Jan 15, 2026               │
│                                             │
│ Return Information                          │
│ ─────────────────────────────────────────── │
│ Actual Return Date: [Date Picker] *         │
│ ⚠️ LATE by 2 days                          │
│                                             │
│ Equipment Condition: [Dropdown] *           │
│ ○ New                                       │
│ ● Good                                      │
│ ○ Needs Service                            │
│                                             │
│ [Conditional: If "Needs Service"]          │
│ Damage Description: [Text area] *           │
│                                             │
│ [Conditional: If late]                     │
│ Overdue Reason: [Dropdown] *                │
│ ▼ Customer delayed                         │
│                                             │
│ Final Revenue                               │
│ ─────────────────────────────────────────── │
│ Days Rented: 7 (calculated by API)         │
│ Total: 350,000 TZS                         │
│ Deposit to Return: 500,000 TZS             │
│                                             │
│ [Cancel] [Process Return]                  │
└─────────────────────────────────────────────┘
```

**Validation:**
- Required: actual_return_date, condition_on_return
- If late: overdue_reason required
- If "Needs Service": damage_notes required

---

### Dashboard Integration

#### Rental KPI Cards

```jsx
// RentalStatsCards.jsx
import { Card, Grid, Typography } from '@mui/material';
import { Inventory, Assignment, Warning, TrendingUp } from '@mui/icons-material';

export function RentalStatsCards({ stats }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Assignment color="primary" />
              <Typography variant="h6" ml={2}>Active Rentals</Typography>
            </Box>
            <Typography variant="h3">{stats.active_rentals}</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Warning color="error" />
              <Typography variant="h6" ml={2}>Overdue</Typography>
            </Box>
            <Typography variant="h3" color="error">{stats.overdue_rentals}</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Inventory color="success" />
              <Typography variant="h6" ml={2}>Available</Typography>
            </Box>
            <Typography variant="h3">{stats.available_equipment}</Typography>
            <Typography variant="caption">of {stats.total_equipment} total</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <TrendingUp color="primary" />
              <Typography variant="h6" ml={2}>Utilization</Typography>
            </Box>
            <Typography variant="h3">{stats.utilization_rate}%</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
```

#### Revenue Display

**Separate from Sales Revenue:**
```jsx
// DashboardRevenue.jsx
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    <Card>
      <CardHeader title="Sales Revenue" />
      <CardContent>
        <Typography variant="h4">
          {formatCurrency(salesStats.revenue_today)} TZS
        </Typography>
        <Typography variant="caption">Today</Typography>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={6}>
    <Card>
      <CardHeader title="Rental Revenue" />
      <CardContent>
        <Typography variant="h4" color="primary">
          {formatCurrency(rentalStats.revenue_today)} TZS
        </Typography>
        <Typography variant="caption">Today</Typography>
      </CardContent>
    </Card>
  </Grid>
</Grid>
```

---

## Image Upload Handling

### Frontend Implementation

#### Image Uploader Component

```jsx
// ImageUploader.jsx
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, IconButton, Grid, Typography } from '@mui/material';
import { Delete, AddPhotoAlternate } from '@mui/icons-material';
import imageCompression from 'browser-image-compression';

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 2;

export function ImageUploader({ images, onChange }) {
  const [previews, setPreviews] = useState(images || []);
  
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg'
    };
    
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Compression failed:', error);
      return file;
    }
  };
  
  const onDrop = async (acceptedFiles) => {
    if (previews.length + acceptedFiles.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    
    const newImages = [];
    for (const file of acceptedFiles) {
      const compressed = await compressImage(file);
      const url = URL.createObjectURL(compressed);
      newImages.push({ file: compressed, url });
    }
    
    const updated = [...previews, ...newImages];
    setPreviews(updated);
    onChange(updated.map(img => img.url)); // Pass URLs to parent
  };
  
  const removeImage = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onChange(updated.map(img => img.url));
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: MAX_IMAGES - previews.length,
    disabled: previews.length >= MAX_IMAGES
  });
  
  return (
    <Box>
      <Grid container spacing={2}>
        {previews.map((img, index) => (
          <Grid item key={index}>
            <Box position="relative" width={120} height={120}>
              <img src={img.url} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
              <IconButton
                size="small"
                onClick={() => removeImage(index)}
                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper' }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
        
        {previews.length < MAX_IMAGES && (
          <Grid item>
            <Box
              {...getRootProps()}
              sx={{
                width: 120,
                height: 120,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.400',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
            >
              <input {...getInputProps()} />
              <AddPhotoAlternate color="action" />
              <Typography variant="caption" align="center">
                {isDragActive ? 'Drop here' : 'Add image'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      <Typography variant="caption" color="textSecondary" mt={1}>
        {previews.length} of {MAX_IMAGES} images • Max {MAX_SIZE_MB}MB each
      </Typography>
    </Box>
  );
}
```

### Backend Storage Strategy

**Option 1: Cloud Storage (Recommended)**
```python
# app/services/image_svc.py
import boto3
from datetime import datetime
import hashlib

s3_client = boto3.client('s3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY'),
    aws_secret_access_key=os.getenv('AWS_SECRET_KEY'),
    region_name='us-east-1'
)

def upload_equipment_image(file_data, equipment_id):
    """Upload image to S3 and return URL"""
    # Generate unique filename
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    hash = hashlib.md5(file_data[:1024]).hexdigest()[:8]
    filename = f"equipment/{equipment_id}/{timestamp}_{hash}.jpg"
    
    # Upload
    s3_client.put_object(
        Bucket='your-bucket-name',
        Key=filename,
        Body=file_data,
        ContentType='image/jpeg',
        ACL='public-read'
    )
    
    # Return public URL
    return f"https://your-bucket-name.s3.amazonaws.com/{filename}"
```

**Option 2: Local Storage (Development)**
```python
# app/routers/upload.py (extend existing)
import os
import shutil
from fastapi import File, UploadFile

@router.post("/equipment-images")
async def upload_equipment_image(file: UploadFile = File(...)):
    """Upload equipment image"""
    # Save to local directory
    upload_dir = "static/equipment_images"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    return {"url": f"/static/equipment_images/{file.filename}"}
```

### Image Upload Flow

```
1. User selects/drops images in frontend
   ↓
2. Frontend compresses images (browser-image-compression)
   ↓
3. POST each image to /equipment-images endpoint
   ↓
4. Backend uploads to storage (S3/local)
   ↓
5. Backend returns public URL
   ↓
6. Frontend collects URLs in array
   ↓
7. Submit equipment form with image URLs in `images` field
```

---

## Testing Guide

### Unit Tests

```python
# tests/test_rentals.py
import pytest
from datetime import date, timedelta
from app.routers.rentals import check_overdue, calculate_rental_days, calculate_rental_revenue

def test_overdue_detection():
    # Mock rental
    rental = type('obj', (object,), {
        'status': 'Active',
        'expected_return_date': date(2026, 1, 10)
    })
    
    today = date(2026, 1, 15)
    assert check_overdue(rental, today) == True
    
    today = date(2026, 1, 5)
    assert check_overdue(rental, today) == False
    
    rental.status = 'Returned'
    assert check_overdue(rental, today) == False

def test_rental_days_calculation():
    rental = type('obj', (object,), {
        'start_date': date(2026, 1, 10),
        'actual_return_date': None
    })
    
    # Active rental
    today = date(2026, 1, 15)
    assert calculate_rental_days(rental, today) == 6  # 10-15 inclusive
    
    # Returned rental
    rental.actual_return_date = date(2026, 1, 12)
    assert calculate_rental_days(rental, today) == 3  # 10-12 inclusive

def test_revenue_calculation():
    rental = type('obj', (object,), {
        'start_date': date(2026, 1, 10),
        'actual_return_date': date(2026, 1, 15),
        'rate_per_day': 50000.0
    })
    
    revenue = calculate_rental_revenue(rental, date(2026, 1, 15))
    assert revenue == 300000.0  # 6 days × 50,000
```

### Integration Tests

```python
# tests/test_rental_api.py
from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

def test_create_rental_flow():
    # 1. Create equipment
    equipment_data = {
        "name": "Test GPS",
        "serial_number": "TEST-001",
        "category": "GPS",
        "rental_rate_per_day": 50000,
        "deposit_amount": 500000
    }
    response = client.post("/api/v1/rentals/equipment", json=equipment_data, headers=auth_headers)
    assert response.status_code == 201
    equipment_id = response.json()["id"]
    
    # 2. Create rental
    rental_data = {
        "equipment_id": equipment_id,
        "customer_name": "Test Customer",
        "customer_phone": "+255712345678",
        "start_date": "2026-01-10",
        "expected_return_date": "2026-01-15"
    }
    response = client.post("/api/v1/rentals/rentals", json=rental_data, headers=auth_headers)
    assert response.status_code == 201
    rental = response.json()
    assert rental["status"] == "Active"
    assert rental["rate_per_day"] == 50000
    
    # 3. Process return
    return_data = {
        "actual_return_date": "2026-01-16",
        "condition_on_return": "Good",
        "overdue_reason": "Customer delayed"
    }
    response = client.post(f"/api/v1/rentals/rentals/{rental['id']}/return", json=return_data, headers=auth_headers)
    assert response.status_code == 200
    returned = response.json()
    assert returned["status"] == "Returned"
    assert returned["is_overdue"] == True
    assert returned["days_rented"] == 7
```

### Manual Testing Checklist

- [ ] Create person (all roles)
- [ ] Create sponsor (all types)
- [ ] Create equipment with 5 images
- [ ] Create equipment with duplicate serial number (should fail)
- [ ] Create rental for available equipment
- [ ] Create rental for unavailable equipment (should fail)
- [ ] List active rentals
- [ ] List overdue rentals
- [ ] Extend rental (update expected return date)
- [ ] Set overdue reason while rental active
- [ ] Return rental on time (no overdue reason)
- [ ] Return rental late (overdue reason required)
- [ ] Return rental with damage
- [ ] View rental statistics (dashboard KPIs)
- [ ] View top rented equipment
- [ ] Test with weak internet (image upload)
- [ ] Test authorization (staff vs owner access)

---

## Deployment Checklist

### Pre-Deployment

- [ ] **Database Migration:**
  ```bash
  # Run migration to create tables
  alembic upgrade head
  # OR
  python -c "from app.models import Base; from app.database import engine; Base.metadata.create_all(bind=engine)"
  ```

- [ ] **Environment Variables:**
  ```bash
  # .env file
  DATABASE_URL=postgresql://user:pass@localhost/dbname
  AWS_ACCESS_KEY=your-key  # For image uploads
  AWS_SECRET_KEY=your-secret
  S3_BUCKET_NAME=your-bucket
  ```

- [ ] **Image Storage Setup:**
  - S3 bucket created and configured
  - CORS policy set for frontend domain
  - Public read access for uploaded images

- [ ] **Test Data:**
  - Create 5 persons with different roles
  - Create 3 sponsors
  - Create 10 equipment items
  - Create 5 test rentals
  - Test overdue detection

### Post-Deployment

- [ ] **API Documentation:**
  - Visit `/docs` endpoint
  - Verify all rental endpoints listed
  - Test endpoints via Swagger UI

- [ ] **Dashboard Integration:**
  - Rental KPIs display correctly
  - Separate from sales metrics
  - Overdue count accurate

- [ ] **Performance:**
  - Image uploads complete in <5s (with compression)
  - List endpoints return in <500ms
  - Dashboard loads in <2s

- [ ] **Security:**
  - All endpoints require authentication
  - Branch isolation working
  - Owner-only endpoints restricted

### Monitoring

- [ ] **Set Up Alerts:**
  - High overdue count (>10%)
  - Revenue drop below threshold
  - Equipment utilization <20%
  - Failed image uploads

- [ ] **Log Analysis:**
  - Track rental creation rate
  - Monitor return processing time
  - Watch for validation errors

---

## Professional Verification Required

⚠️ **IMPORTANT:** The following aspects of this system require professional review before production use:

### 1. Revenue Recognition (Accountant)
- [ ] Verify daily accrual method complies with accounting standards
- [ ] Confirm revenue attribution across month boundaries
- [ ] Review partial day handling (currently rounds to full days)
- [ ] Validate financial reporting requirements

### 2. Penalties & Deposits (Finance)
- [ ] Define penalty structure for late returns (not implemented)
- [ ] Establish deposit forfeit conditions
- [ ] Set damage cost assessment process
- [ ] Review credit/payment terms

### 3. Liability & Damage (Lawyer)
- [ ] Review rental agreement terms
- [ ] Define equipment loss procedures
- [ ] Establish damage liability limits
- [ ] Verify insurance requirements

### 4. Asset Responsibility (Operations Manager)
- [ ] Confirm equipment maintenance schedules
- [ ] Define responsible person duties
- [ ] Establish physical inventory reconciliation process
- [ ] Review equipment retirement criteria

---

## Support & Maintenance

### Common Issues

**Issue:** Images not uploading
- Check S3 credentials
- Verify CORS configuration
- Confirm bucket permissions
- Test with smaller images

**Issue:** Overdue count incorrect
- Verify system date/time correct
- Check timezone configuration (Africa/Dar_es_Salaam)
- Review rental expected_return_date values

**Issue:** Equipment shows as unavailable
- Check equipment status in database
- Verify no active rentals exist
- Review recent rental returns

### Database Maintenance

```sql
-- Find rentals overdue >30 days
SELECT * FROM rental_contracts
WHERE expected_return_date < CURRENT_DATE - INTERVAL '30 days'
AND status NOT IN ('Returned', 'Damaged');

-- Equipment utilization report
SELECT 
  e.name,
  COUNT(r.id) AS rental_count,
  SUM(COALESCE(r.actual_return_date, CURRENT_DATE) - r.start_date) AS total_days_rented
FROM equipment e
LEFT JOIN rental_contracts r ON e.id = r.equipment_id
GROUP BY e.id
ORDER BY rental_count DESC;

-- Revenue by month
SELECT 
  DATE_TRUNC('month', start_date) AS month,
  SUM((COALESCE(actual_return_date, CURRENT_DATE) - start_date + 1) * rate_per_day) AS revenue
FROM rental_contracts
GROUP BY month
ORDER BY month DESC;
```

---

## Conclusion

This rental management system is designed for **production-grade operation** with emphasis on:

✅ **Reliability:** All business logic server-side  
✅ **Auditability:** Complete transaction history  
✅ **Scalability:** Multi-tenant architecture  
✅ **Usability:** Optimized for weak internet  
✅ **Security:** Role-based access control  
✅ **Maintainability:** Clean separation of concerns  

**Next Steps:**
1. Review with stakeholders
2. Get professional verification (accountant, lawyer, operations)
3. Complete frontend implementation
4. Run full testing suite
5. Deploy to staging environment
6. Train staff on system usage
7. Monitor first week of operations
8. Iterate based on feedback

---

# New Module Overview

## Module name: Rentals / Equipment Rentals / Survey Equipment Module

### Purpose:
- Add new business capability without increasing cognitive load
- Integrate into reporting, permissions, and dashboards

### Core entities:
- Equipment
- Rental
- Customer
- Sponsor
- Person-in-charge

### Navigation & Placement (Critical)
- **Decide and justify:**
  - Where this module appears in the sidebar/menu
  - Whether it is:
    - Top-level module
    - Sub-module of an existing section
  - How users mentally “discover” it
- **Challenge bad choices:**
  - If placed wrong → users won’t use it
  - If too prominent → it disrupts existing workflows

### Pages to Add (Do NOT Duplicate Existing Ones)
- **Module Dashboard**
  - KPIs relevant only to this module
  - Avoid copying the main system dashboard
- **Listing Pages**
  - Tables/cards consistent with existing system
  - Reuse table components if available
  - Filters relevant to the module only
- **Create / Edit Flows**
  - Multi-step if data is complex
  - Inline validation
  - Image upload (device photo, document proof)
- **Detail View**
  - Read-only summary
  - Action buttons shown based on role & status

### Form Design Rules
- Reuse existing form components
- Respect existing validation patterns
- Never introduce new form UX without reason
- **Edge cases:**
  - Partial submissions
  - Draft vs published records
  - Editing locked/active records

### Role & Permission Awareness
- Assume roles already exist:
  - Admin
  - Manager
  - Staff
  - Viewer
- **Frontend must:**
  - Hide actions user cannot perform
  - Show disabled states with explanation
  - Never rely on backend errors as UX

### State & Integration
- Plug into existing global state (auth, theme, settings)
- Do NOT introduce new global state unless unavoidable
- Follow existing API error and loading patterns
- **Performance concerns:**
  - Module should not slow down unrelated pages
  - Lazy-load module routes if possible

### UX Consistency Checklist
- Before finalizing UI, verify:
  - Buttons behave the same as elsewhere
  - Icons, spacing, modals match existing style
  - Empty states follow system language
  - Success/error messages feel native

### Deliverables
- Provide:
  - New routes added (without touching existing ones)
  - Component reuse vs new components (justify each new one)
  - Navigation update plan
  - User flow diagrams (existing → new module)
  - Risks introduced by this module and how to mitigate them

### Explicit Anti-Patterns to Avoid
- ❌ Rebuilding tables/forms already in the system
- ❌ New color schemes or typography
- ❌ Breaking existing permissions
- ❌ Forcing users to “relearn” the app
