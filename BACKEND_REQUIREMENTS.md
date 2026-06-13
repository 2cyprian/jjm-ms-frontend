# Backend Changes Required for New Dashboard

## 📊 API Endpoints Needed

### 1. Dashboard Statistics Endpoint
**GET /api/dashboard/stats**

**Response:**
```json
{
  "totalRevenue": 42850.00,
  "revenueChange": 12.4,
  "totalOrders": 1284,
  "ordersChange": 8.1,
  "totalExpenses": 18240.00,
  "expensesChange": -4.2,
  "lowStockItems": 0,
  "dailyFootfall": 0,
  "footfallChange": 0,
  "rentalIncome": 0
}
```

**Implementation:**
- Calculate total revenue from orders table (status = 'completed')
- Calculate revenue change: (current_period - previous_period) / previous_period * 100
- Count orders from orders table
- Sum expenses from expenses table
- Count low stock items where quantity < reorder_level
- Implement for date ranges: today, last_7_days, last_30_days, last_90_days

---

### 2. Revenue vs Expenses Chart Data
**GET /api/dashboard/revenue-expenses?months=6**

**Response:**
```json
[
  { "month": "Jan", "revenue": 35000, "expenses": 8000 },
  { "month": "Feb", "revenue": 42000, "expenses": 9500 },
  { "month": "Mar", "revenue": 51000, "expenses": 10200 },
  { "month": "Apr", "revenue": 48000, "expenses": 11000 },
  { "month": "May", "revenue": 61000, "expenses": 12500 },
  { "month": "Jun", "revenue": 68000, "expenses": 13200 }
]
```

**Implementation:**
- Group orders by month, sum revenue
- Group expenses by month, sum total
- Support configurable number of months (default 6)
- Support date range filtering

---

### 3. Top Services Revenue
**GET /api/dashboard/top-services?limit=5**

**Response:**
```json
[
  { "name": "Branding", "revenue": 14200, "percentage": 85, "order_count": 12 },
  { "name": "Large Format", "revenue": 11800, "percentage": 72, "order_count": 8 },
  { "name": "Digital Printing", "revenue": 8450, "percentage": 55, "order_count": 15 },
  { "name": "Packaging", "revenue": 5200, "percentage": 40, "order_count": 6 },
  { "name": "Direct Mail", "revenue": 3200, "percentage": 25, "order_count": 4 }
]
```

**Implementation:**
- Join orders with services table
- Sum revenue per service
- Calculate percentage: (service_revenue / total_revenue) * 100
- Order by revenue DESC
- Support date range filtering

---

### 4. Expenses Breakdown
**GET /api/dashboard/expenses-breakdown**

**Response:**
```json
{
  "breakdown": [
    { "category": "Logistics", "amount": 8191, "percentage": 45 },
    { "category": "Materials", "amount": 5472, "percentage": 30 },
    { "category": "Overhead", "amount": 4554, "percentage": 25 }
  ],
  "total": 18217
}
```

**Implementation:**
- Group expenses by category (expense_type or category field)
- Sum amounts per category
- Calculate percentage of total
- Support date range filtering

---

### 5. Recent Orders
**GET /api/dashboard/recent-orders?limit=10**

**Response:**
```json
[
  {
    "id": "EMZ-9042",
    "service": "Large Format Vinyl",
    "client": "Apex Tech",
    "amount": 1240.00,
    "status": "Completed",
    "date": "2024-05-20"
  },
  {
    "id": "EMZ-9041",
    "service": "Brand Kit Package",
    "client": "Lumina Studio",
    "amount": 3500.00,
    "status": "In Production",
    "date": "2024-05-19"
  },
  {
    "id": "EMZ-9040",
    "service": "Exhibition Banner",
    "client": "Global Events",
    "amount": 2100.00,
    "status": "Pending",
    "date": "2024-05-18"
  }
]
```

**Implementation:**
- Join orders with clients and services
- Return most recent orders
- Support pagination
- Support date range filtering

---

### 6. Rental Income
**GET /api/dashboard/rental-income?period=current_month**

**Response:**
```json
{
  "rentalIncome": 12500.00,
  "activeRentals": 8,
  "pendingReturns": 2
}
```

**Implementation:**
- Sum rental payments from rentals table
- Filter by status (active, completed)
- Support period: today, current_month, custom_range

---

## 📋 Database Schema Requirements

### Orders Table
```sql
- id, order_number, client_id, service_id, amount, status, created_at, updated_at
- Need: status filtering (Completed, In Production, Pending)
```

### Expenses Table
```sql
- id, category, amount, date, description, created_at
- Need: category field (Logistics, Materials, Overhead)
```

### Services Table
```sql
- id, name, price (or use from orders)
- Need: service_name for grouping revenue
```

### Rentals Table
```sql
- id, customer_name, equipment_id, start_date, expected_return_date, 
  deposit_paid, status, created_at
- Need: rental income calculation
```

---

## 🔧 Implementation Notes

### Date Range Support
Add query parameter `date_range` to all endpoints:
```
?date_range=today
?date_range=last_7_days
?date_range=last_30_days
?date_range=last_90_days
?date_range=custom&start_date=2024-05-01&end_date=2024-05-31
```

### Performance Optimization
- Cache expensive queries (revenue calculations) with 5-10 minute TTL
- Use database aggregations instead of application-level calculations
- Index frequently queried columns: created_at, status, category, service_id

### Error Handling
- Return 400 if date_range is invalid
- Return 404 if no data exists for period
- Return meaningful error messages for failed queries

---

## 🎯 Frontend-Backend Contract

Frontend will pass:
- `date_range` (query param)
- `start_date`, `end_date` (for custom ranges)
- `limit` (for pagination)

Backend will return:
- Standardized response format with `success`, `data`, `message`
- Consistent date formats (ISO 8601)
- Calculated percentages and trends
