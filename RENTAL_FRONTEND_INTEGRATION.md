# Rental Management System - Frontend Integration Guide

**API Base URL:** `/api/v1/rentals`

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Data Types & Enums](#data-types--enums)
3. [Equipment Management](#equipment-management)
4. [Persons Management](#persons-management)
5. [Sponsors Management](#sponsors-management)
6. [Rental Contracts](#rental-contracts)
7. [Rental Operations](#rental-operations)
8. [Statistics & Dashboard](#statistics--dashboard)
9. [Error Handling](#error-handling)
10. [Example Frontend Code](#example-frontend-code)

---

## Authentication & Authorization

All endpoints require authentication via JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>'
}
```

**Required Roles:**
- Most endpoints require `OWNER` or `STAFF` role
- Some admin operations require `OWNER` role
- All requests are scoped to the user's branch (multi-tenant)

---

## Data Types & Enums

### Equipment Category
```javascript
const EquipmentCategory = {
  SURVEY: "Survey",
  GPS: "GPS",
  DRONE: "Drone",
  LEVEL: "Level",
  THEODOLITE: "Theodolite",
  TOTAL_STATION: "Total Station",
  OTHER: "Other"
}
```

### Equipment Condition
```javascript
const EquipmentCondition = {
  NEW: "New",
  GOOD: "Good",
  NEEDS_SERVICE: "Needs Service"
}
```

### Equipment Status
```javascript
const EquipmentStatus = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  RENTED: "Rented",
  OVERDUE: "Overdue",
  MAINTENANCE: "Maintenance"
}
```

### Rental Status
```javascript
const RentalStatus = {
  RESERVED: "Reserved",    // Booked but not yet picked up
  ACTIVE: "Active",        // Currently rented out
  OVERDUE: "Overdue",      // Past expected return date
  RETURNED: "Returned",    // Successfully returned
  DAMAGED: "Damaged"       // Returned with damage
}
```

### Person Role
```javascript
const PersonRole = {
  TECHNICIAN: "Technician",
  CUSTODIAN: "Custodian",
  MANAGER: "Manager"
}
```

### Sponsor Type
```javascript
const SponsorType = {
  COMPANY: "Company",
  NGO: "NGO",
  INDIVIDUAL: "Individual"
}
```

### Overdue Reason
```javascript
const OverdueReason = {
  CUSTOMER_DELAYED: "Customer delayed",
  PROJECT_EXTENDED: "Project extended",
  WEATHER_CONDITIONS: "Weather conditions",
  EQUIPMENT_ISSUE: "Equipment issue",
  COMMUNICATION_FAILURE: "Communication failure",
  OTHER: "Other"
}
```

---

## Equipment Management

### 1. Create Equipment

**Endpoint:** `POST /api/v1/rentals/equipment`

**Request Body:**
```json
{
  "name": "Survey Equipment Set 1",
  "brand": "Leica",
  "model": "TS09",
  "serial_number": "SN-001-2026",
  "category": "Survey",
  "rental_rate_per_day": 150000,
  "deposit_amount": 500000,
  "condition": "Good",
  "sponsor_id": null,
  "responsible_person_id": 1,
  "images": ["https://example.com/equipment1.jpg"],
  "notes": "High precision surveying equipment"
}
```

**Required Fields:**
- `name` (string, 2-200 chars) - Equipment name
- `serial_number` (string, 1-100 chars) - Unique identifier
- `category` (enum) - Equipment category
- `rental_rate_per_day` (float, > 0) - Daily rental rate in TZS
- `deposit_amount` (float, ≥ 0) - Security deposit in TZS

**Optional Fields:**
- `brand`, `model` - Manufacturer details
- `condition` - Default: "Good"
- `sponsor_id` - If equipment is sponsored
- `responsible_person_id` - Person responsible
- `images` - Up to 5 image URLs
- `notes` - Additional information

**Response:** `201 Created`
```json
{
  "id": 1,
  "branch_id": 1,
  "name": "Survey Equipment Set 1",
  "brand": "Leica",
  "model": "TS09",
  "serial_number": "SN-001-2026",
  "category": "Survey",
  "rental_rate_per_day": 150000,
  "deposit_amount": 500000,
  "condition": "Good",
  "status": "Available",
  "sponsor_id": null,
  "responsible_person_id": 1,
  "images": ["https://example.com/equipment1.jpg"],
  "notes": "High precision surveying equipment",
  "created_at": "2026-01-15T10:30:00",
  "updated_at": "2026-01-15T10:30:00",
  "sponsor": null,
  "responsible_person": {...}
}
```

---

### 2. List Equipment

**Endpoint:** `GET /api/v1/rentals/equipment`

**Query Parameters:**
```
?category=Survey
&condition=Good
&status=Available
&search=Leica
&page=1
&limit=20
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Survey Equipment Set 1",
    "category": "Survey",
    "status": "Available",
    "rental_rate_per_day": 150000,
    ...
  }
]
```

---

### 3. Get Equipment Details

**Endpoint:** `GET /api/v1/rentals/equipment/{equipment_id}`

**Response:** `200 OK` - Full equipment object

---

### 4. Update Equipment

**Endpoint:** `PUT /api/v1/rentals/equipment/{equipment_id}`

**Request Body (all optional):**
```json
{
  "name": "Updated Name",
  "category": "GPS",
  "condition": "Needs Service",
  "status": "Maintenance",
  "rental_rate_per_day": 175000
}
```

**Response:** `200 OK` - Updated equipment object

---

## Persons Management

### 1. Create Person

**Endpoint:** `POST /api/v1/rentals/persons`

**Request Body:**
```json
{
  "full_name": "John Mwangi",
  "role": "Technician",
  "phone": "+255722123456",
  "identification": "ID-123456",
  "notes": "Senior technician with 5 years experience"
}
```

**Required Fields:**
- `full_name` (string, 2-200 chars)
- `role` (enum: Technician, Custodian, Manager)

**Optional Fields:**
- `phone` (max 20 chars)
- `identification` (max 100 chars)
- `notes` (max 1000 chars)

**Response:** `201 Created`
```json
{
  "id": 1,
  "branch_id": 1,
  "full_name": "John Mwangi",
  "role": "Technician",
  "phone": "+255722123456",
  "identification": "ID-123456",
  "notes": "Senior technician with 5 years experience",
  "is_active": true,
  "created_at": "2026-01-15T10:30:00",
  "updated_at": "2026-01-15T10:30:00"
}
```

---

### 2. List Persons

**Endpoint:** `GET /api/v1/rentals/persons`

**Query Parameters:**
```
?role=Technician
&search=John
&page=1
&limit=20
```

**Response:** `200 OK` - Array of person objects

---

### 3. Get Person Details

**Endpoint:** `GET /api/v1/rentals/persons/{person_id}`

**Response:** `200 OK` - Full person object

---

### 4. Update Person

**Endpoint:** `PUT /api/v1/rentals/persons/{person_id}`

**Request Body (all optional):**
```json
{
  "full_name": "Updated Name",
  "role": "Manager",
  "phone": "+255722987654",
  "is_active": false
}
```

**Response:** `200 OK` - Updated person object

---

## Sponsors Management

### 1. Create Sponsor

**Endpoint:** `POST /api/v1/rentals/sponsors`

**Request Body:**
```json
{
  "name": "ABC Survey Company Ltd",
  "type": "Company",
  "contact_person": "Mr. Kamau",
  "phone": "+255754123456",
  "email": "info@abcsurvey.co.tz",
  "agreement_reference": "AGR-2026-001",
  "notes": "Main equipment sponsor for 2026"
}
```

**Required Fields:**
- `name` (string, 2-200 chars)
- `type` (enum: Company, NGO, Individual)

**Optional Fields:**
- `contact_person` (max 200 chars)
- `phone` (max 20 chars)
- `email` (must be valid format if provided)
- `agreement_reference` (max 100 chars)
- `notes` (max 1000 chars)

**Response:** `201 Created`
```json
{
  "id": 1,
  "branch_id": 1,
  "name": "ABC Survey Company Ltd",
  "type": "Company",
  "contact_person": "Mr. Kamau",
  "phone": "+255754123456",
  "email": "info@abcsurvey.co.tz",
  "agreement_reference": "AGR-2026-001",
  "notes": "Main equipment sponsor for 2026",
  "is_active": true,
  "created_at": "2026-01-15T10:30:00",
  "updated_at": "2026-01-15T10:30:00"
}
```

---

### 2. List Sponsors

**Endpoint:** `GET /api/v1/rentals/sponsors`

**Query Parameters:**
```
?type=Company
&search=ABC
&page=1
&limit=20
```

**Response:** `200 OK` - Array of sponsor objects

---

### 3. Get Sponsor Details

**Endpoint:** `GET /api/v1/rentals/sponsors/{sponsor_id}`

**Response:** `200 OK` - Full sponsor object

---

### 4. Update Sponsor

**Endpoint:** `PUT /api/v1/rentals/sponsors/{sponsor_id}`

**Request Body (all optional):**
```json
{
  "contact_person": "Updated Contact",
  "phone": "+255755987654"
}
```

**Response:** `200 OK` - Updated sponsor object

---

## Rental Contracts

### 1. Create Rental Contract

**Endpoint:** `POST /api/v1/rentals/rentals`

**Request Body:**
```json
{
  "equipment_id": 1,
  "customer_name": "Jane Kipchoge",
  "customer_phone": "+255723456789",
  "customer_identification": "ID-654321",
  "start_date": "2026-01-20",
  "expected_return_date": "2026-01-25",
  "rate_per_day": 150000,
  "deposit_paid": 500000,
  "notes": "Project at Site B, contact: 0788123456"
}
```

**Required Fields:**
- `equipment_id` (int) - ID of equipment to rent
- `customer_name` (string, 2-200 chars)
- `customer_phone` (string, 10-20 chars)
- `start_date` (date, YYYY-MM-DD format)
- `expected_return_date` (date, YYYY-MM-DD format, must be ≥ start_date)

**Optional Fields:**
- `customer_identification` (max 100 chars)
- `rate_per_day` (float, > 0) - Override equipment rate
- `deposit_paid` (float, ≥ 0) - Override equipment deposit
- `notes` (max 2000 chars)

**Response:** `201 Created`
```json
{
  "id": 1,
  "branch_id": 1,
  "equipment_id": 1,
  "customer_name": "Jane Kipchoge",
  "customer_phone": "+255723456789",
  "customer_identification": "ID-654321",
  "start_date": "2026-01-20",
  "expected_return_date": "2026-01-25",
  "actual_return_date": null,
  "rate_per_day": 150000,
  "deposit_paid": 500000,
  "status": "Active",
  "overdue_reason": null,
  "damage_notes": null,
  "notes": "Project at Site B...",
  "created_by_user_id": 1,
  "created_at": "2026-01-15T10:30:00",
  "updated_at": "2026-01-15T10:30:00",
  "is_overdue": false,
  "days_rented": 5,
  "total_revenue": 750000,
  "equipment": {...}
}
```

---

### 2. List Rental Contracts

**Endpoint:** `GET /api/v1/rentals/rentals`

**Query Parameters:**
```
?status=Active
&search=Jane
&page=1
&limit=20
```

**Response:** `200 OK` - Array of rental contract objects

---

### 3. Get Active Rentals

**Endpoint:** `GET /api/v1/rentals/rentals/active`

Returns only rentals with status "Active" or "Reserved"

**Query Parameters:**
```
?page=1
&limit=20
```

**Response:** `200 OK` - Array of active rental objects

---

### 4. Get Overdue Rentals

**Endpoint:** `GET /api/v1/rentals/rentals/overdue`

Returns only rentals with status "Overdue"

**Query Parameters:**
```
?page=1
&limit=20
```

**Response:** `200 OK` - Array of overdue rental objects

---

### 5. Get Rental Details

**Endpoint:** `GET /api/v1/rentals/rentals/{rental_id}`

**Response:** `200 OK` - Full rental contract object

---

### 6. Update Rental

**Endpoint:** `PUT /api/v1/rentals/rentals/{rental_id}`

**Request Body (all optional):**
```json
{
  "expected_return_date": "2026-01-28",
  "notes": "Extended rental period - project delayed"
}
```

**Response:** `200 OK` - Updated rental contract object

---

## Rental Operations

### 1. Return Equipment

**Endpoint:** `POST /api/v1/rentals/rentals/{rental_id}/return`

**Request Body:**
```json
{
  "actual_return_date": "2026-01-25",
  "condition_on_return": "Good",
  "damage_notes": null,
  "overdue_reason": null
}
```

**Required Fields:**
- `actual_return_date` (date, YYYY-MM-DD format)
- `condition_on_return` (enum: New, Good, Needs Service)

**Optional Fields:**
- `damage_notes` (max 2000 chars) - Description of damage if any
- `overdue_reason` (enum) - Reason if returned late

**Response:** `200 OK` - Updated rental contract with status "Returned"

---

### 2. Mark Equipment as Overdue

**Endpoint:** `POST /api/v1/rentals/rentals/{rental_id}/overdue-reason`

**Request Body:**
```json
{
  "overdue_reason": "Customer delayed",
  "notes": "Customer requested extension but didn't return on time"
}
```

**Required Fields:**
- `overdue_reason` (enum)

**Optional Fields:**
- `notes` (max 1000 chars)

**Response:** `200 OK` - Rental contract with status updated to "Overdue"

---

## Statistics & Dashboard

### 1. Get Rental Statistics

**Endpoint:** `GET /api/v1/rentals/rentals/stats/summary`

Returns key performance indicators for the rental system

**Response:** `200 OK`
```json
{
  "active_rentals": 5,
  "overdue_rentals": 2,
  "reserved_rentals": 3,
  "total_equipment": 15,
  "available_equipment": 8,
  "utilization_rate": 46.7,
  "revenue_today": 450000,
  "revenue_this_month": 3250000
}
```

**Fields Explanation:**
- `active_rentals` - Currently rented or reserved equipment
- `overdue_rentals` - Equipment past expected return date
- `reserved_rentals` - Booked but not yet picked up
- `total_equipment` - All equipment in the system
- `available_equipment` - Equipment available for rent
- `utilization_rate` - Percentage of equipment in use (%)
- `revenue_today` - Revenue from today's rentals (TZS)
- `revenue_this_month` - Revenue for current month (TZS)

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "detail": "Expected return date must be after start date"
}
```

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden**
```json
{
  "detail": "Not authorized for this operation"
}
```

**404 Not Found**
```json
{
  "detail": "Equipment not found"
}
```

**422 Unprocessable Entity**
```json
{
  "detail": [
    {
      "loc": ["body", "rental_rate_per_day"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

---

## Example Frontend Code

### 1. Create Equipment (React Example)

```javascript
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api/v1/rentals';

async function createEquipment(token, equipmentData) {
  try {
    const response = await axios.post(
      `${API_BASE}/equipment`,
      {
        name: equipmentData.name,
        brand: equipmentData.brand,
        model: equipmentData.model,
        serial_number: equipmentData.serialNumber,
        category: equipmentData.category,
        rental_rate_per_day: equipmentData.ratePerDay,
        deposit_amount: equipmentData.depositAmount,
        condition: equipmentData.condition || "Good",
        responsible_person_id: equipmentData.responsiblePersonId,
        notes: equipmentData.notes
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating equipment:', error.response?.data);
    throw error;
  }
}
```

---

### 2. Create Rental Contract (React Example)

```javascript
async function createRentalContract(token, rentalData) {
  try {
    const response = await axios.post(
      `${API_BASE}/rentals`,
      {
        equipment_id: rentalData.equipmentId,
        customer_name: rentalData.customerName,
        customer_phone: rentalData.customerPhone,
        customer_identification: rentalData.customerId,
        start_date: rentalData.startDate, // "2026-01-20"
        expected_return_date: rentalData.expectedReturnDate, // "2026-01-25"
        rate_per_day: rentalData.ratePerDay,
        deposit_paid: rentalData.depositPaid,
        notes: rentalData.notes
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating rental:', error.response?.data);
    throw error;
  }
}
```

---

### 3. Return Equipment (React Example)

```javascript
async function returnEquipment(token, rentalId, returnData) {
  try {
    const response = await axios.post(
      `${API_BASE}/rentals/${rentalId}/return`,
      {
        actual_return_date: returnData.returnDate, // "2026-01-25"
        condition_on_return: returnData.condition, // "Good"
        damage_notes: returnData.damageNotes,
        overdue_reason: returnData.overdueReason
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error returning equipment:', error.response?.data);
    throw error;
  }
}
```

---

### 4. Get Dashboard Statistics (React Example)

```javascript
async function getDashboardStats(token) {
  try {
    const response = await axios.get(
      `${API_BASE}/rentals/stats/summary`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error.response?.data);
    throw error;
  }
}

// Usage in React component
function DashboardWidget({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats(token).then(setStats).catch(console.error);
  }, [token]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <h3>Active Rentals</h3>
        <p>{stats.active_rentals}</p>
      </div>
      <div className="stat-card">
        <h3>Overdue</h3>
        <p>{stats.overdue_rentals}</p>
      </div>
      <div className="stat-card">
        <h3>Revenue This Month</h3>
        <p>TZS {stats.revenue_this_month.toLocaleString()}</p>
      </div>
    </div>
  );
}
```

---

### 5. List Equipment with Filtering (React Example)

```javascript
async function listEquipment(token, filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 20);

    const response = await axios.get(
      `${API_BASE}/equipment?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error listing equipment:', error.response?.data);
    throw error;
  }
}

// Usage
const equipment = await listEquipment(token, {
  category: 'Survey',
  status: 'Available',
  page: 1,
  limit: 10
});
```

---

### 6. Form Validation Example

```javascript
const validateRentalForm = (data) => {
  const errors = {};

  // Required fields
  if (!data.customerName || data.customerName.length < 2) {
    errors.customerName = 'Name must be at least 2 characters';
  }

  if (!data.customerPhone || data.customerPhone.length < 10) {
    errors.customerPhone = 'Phone must be at least 10 characters';
  }

  // Date validation
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.expectedReturnDate);

  if (isNaN(startDate.getTime())) {
    errors.startDate = 'Invalid start date';
  }

  if (isNaN(endDate.getTime())) {
    errors.expectedReturnDate = 'Invalid return date';
  }

  if (startDate >= endDate) {
    errors.expectedReturnDate = 'Return date must be after start date';
  }

  // Rate validation
  if (!data.ratePerDay || data.ratePerDay <= 0) {
    errors.ratePerDay = 'Rate must be greater than 0';
  }

  if (data.depositPaid && data.depositPaid < 0) {
    errors.depositPaid = 'Deposit cannot be negative';
  }

  return errors;
};
```

---

## Best Practices

1. **Always include JWT token** in Authorization header
2. **Validate dates** before sending to backend (YYYY-MM-DD format)
3. **Handle errors gracefully** and display user-friendly messages
4. **Cache equipment list** to reduce API calls
5. **Use pagination** for lists (limit results to 20-50 items)
6. **Validate form inputs** before submission
7. **Show loading states** during API calls
8. **Refresh dashboard stats** periodically (e.g., every 5 minutes)
9. **Confirm delete operations** before executing
10. **Track overdue rentals** and send reminders to customers

---

## Quick Reference - All Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/equipment` | Create equipment |
| GET | `/equipment` | List equipment |
| GET | `/equipment/{id}` | Get equipment details |
| PUT | `/equipment/{id}` | Update equipment |
| POST | `/persons` | Create person |
| GET | `/persons` | List persons |
| GET | `/persons/{id}` | Get person details |
| PUT | `/persons/{id}` | Update person |
| POST | `/sponsors` | Create sponsor |
| GET | `/sponsors` | List sponsors |
| GET | `/sponsors/{id}` | Get sponsor details |
| PUT | `/sponsors/{id}` | Update sponsor |
| POST | `/rentals` | Create rental |
| GET | `/rentals` | List rentals |
| GET | `/rentals/active` | Get active rentals |
| GET | `/rentals/overdue` | Get overdue rentals |
| GET | `/rentals/{id}` | Get rental details |
| PUT | `/rentals/{id}` | Update rental |
| POST | `/rentals/{id}/return` | Return equipment |
| POST | `/rentals/{id}/overdue-reason` | Mark as overdue |
| GET | `/rentals/stats/summary` | Get dashboard stats |

