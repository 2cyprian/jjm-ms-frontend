# Service & Expense Engine Integration Guide

**Last Updated:** Jan 2025  
**Sprint Coverage:** Sprint 1 (Service Engine) + Sprint 3 (Expense Engine)  
**Target Market:** Tanzania (Printing, Branding, Stationary services)

---

## 1. Overview

The **Service & Expense Engine** is a configurable, multi-tenant system for managing service-based businesses. It combines:

- **Service Engine (Sprint 1)**: Dynamic service creation, form-based order capture, 4 pricing models, quotation generation
- **Expense Engine (Sprint 3)**: Manual expense tracking, recurring expense automation, financial reporting

### Integration Pattern

```
Customer Order (Service) → Service Order Created → Link Expense to Order → Generate Reports
```

### Core Entities

| Entity | Purpose | Linkage |
|--------|---------|---------|
| **Service** | Service template (Printing, Branding, Stationary) | - |
| **ServiceOrder** | Customer order with form responses | service_id |
| **ExpenseCategory** | Operational cost categories | branch_id |
| **Expense** | One-time operational cost | branch_id, **service_order_id** (optional) |
| **RecurringExpense** | Automated monthly/weekly costs | branch_id, category_id |

---

## 2. Common Workflows

### Workflow A: Service Order + Material Expense

Scenario: Printing shop receives order for 100 business cards, must track ink/paper cost

**Step 1: Create Service**
```bash
curl -X POST http://localhost:8000/api/v1/services \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": 1,
    "name": "Business Card Printing",
    "category": "printing",
    "field_schema": {
      "quantity": {"type": "number", "label": "Quantity", "unit": "cards"},
      "material": {"type": "text", "label": "Paper Type"}
    },
    "pricing_config": {
      "model": "per_quantity",
      "base_price": 500,
      "unit": "per 10 cards"
    },
    "status": "active"
  }'
```

**Response** (excerpt):
```json
{
  "id": "service-uuid-123",
  "branch_id": 1,
  "name": "Business Card Printing",
  "category": "printing"
}
```

**Step 2: Create Service Order**
```bash
curl -X POST http://localhost:8000/api/v1/service-orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "service-uuid-123",
    "branch_id": 1,
    "customer_name": "John Doe",
    "customer_phone": "+255712345678",
    "customer_email": "john@example.com",
    "items_json": {
      "quantity": 100,
      "material": "Premium White Cardstock"
    }
  }'
```

**Response** (excerpt):
```json
{
  "id": "order-uuid-456",
  "order_number": "ORD-20250115-001",
  "service_id": "service-uuid-123",
  "total_price": 5000,
  "status": "pending"
}
```

**Step 3: Record Material Cost**
```bash
curl -X POST http://localhost:8000/api/v1/expenses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": 1,
    "category_id": "cat-paper-uuid",
    "amount": 800,
    "description": "Paper for order ORD-20250115-001",
    "expense_date": "2025-01-15T10:30:00Z",
    "service_order_id": "order-uuid-456",
    "receipt_number": "RECEIPT-001"
  }'
```

**Response**:
```json
{
  "id": "expense-uuid-789",
  "branch_id": 1,
  "service_order_id": "order-uuid-456",
  "amount": 800,
  "status": "recorded"
}
```

**Step 4: Track Profit**
- Order Revenue: 5,000 TZS
- Material Cost: 800 TZS
- Net Margin: 4,200 TZS (84%)

---

### Workflow B: Monthly Expense Report with Service Linking

Scenario: Manager wants to see expenses for January and identify high-cost orders

**Step 1: Set Up Recurring Expenses** (one-time setup)
```bash
curl -X POST http://localhost:8000/api/v1/recurring-expenses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": 1,
    "category_id": "cat-rent-uuid",
    "name": "Shop Rent",
    "amount": 2000000,
    "frequency": "monthly",
    "start_date": "2025-01-01",
    "day_of_month": 1
  }'
```

**Step 2: Get Monthly Report**
```bash
curl -X GET "http://localhost:8000/api/v1/expenses/reports/monthly?branch_id=1&month=1&year=2025" \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "branch_id": 1,
  "month": 1,
  "year": 2025,
  "total_expenses": 3500000,
  "daily_breakdown": [
    {
      "date": "2025-01-01",
      "total": 2000000,
      "category_breakdown": {
        "Rent": 2000000
      }
    },
    {
      "date": "2025-01-15",
      "total": 800,
      "category_breakdown": {
        "Paper": 800
      }
    }
  ],
  "category_breakdown": {
    "Rent": 2000000,
    "Paper": 800,
    "Ink": 450000
  }
}
```

**Step 3: Filter by Service Order**
```bash
curl -X GET "http://localhost:8000/api/v1/expenses?branch_id=1&service_order_id=order-uuid-456" \
  -H "Authorization: Bearer <token>"
```

Returns all expenses linked to that specific order.

---

## 3. API Endpoints Reference

### Service Engine

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/api/v1/services` | Create service | ServiceCreate |
| GET | `/api/v1/services` | List services | Query: branch_id, category |
| GET | `/api/v1/services/{id}` | Get service details | - |
| PUT | `/api/v1/services/{id}` | Update service | ServiceUpdate |
| POST | `/api/v1/service-orders` | Create order | ServiceOrderCreate |
| GET | `/api/v1/service-orders` | List orders | Query: branch_id, status |
| GET | `/api/v1/service-orders/{id}` | Get order details | - |
| PUT | `/api/v1/service-orders/{id}` | Update order fields | ServiceOrderUpdate |
| PATCH | `/api/v1/service-orders/{id}/status` | Transition order status | {"status": "approved"} |
| POST | `/api/v1/services/calculate-price` | Calculate order price | PricingCalculateRequest |
| POST | `/api/v1/services/generate-quotation` | Get text quotation | {"service_id", "items_json"} |

### Expense Engine

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/api/v1/expenses/categories` | Create category | ExpenseCategoryCreate |
| GET | `/api/v1/expenses/categories` | List categories | Query: branch_id |
| POST | `/api/v1/expenses` | Record expense | ExpenseCreate |
| GET | `/api/v1/expenses` | List expenses | Query: branch_id, category_id, service_order_id, date_from, date_to |
| GET | `/api/v1/expenses/{id}` | Get expense details | - |
| PUT | `/api/v1/expenses/{id}` | Update expense | ExpenseUpdate |
| DELETE | `/api/v1/expenses/{id}` | Soft-delete expense | - |
| POST | `/api/v1/recurring-expenses` | Create recurring | RecurringExpenseCreate |
| GET | `/api/v1/recurring-expenses` | List recurring | Query: branch_id, is_active |
| PUT | `/api/v1/recurring-expenses/{id}` | Update recurring | RecurringExpenseUpdate |
| GET | `/api/v1/expenses/reports/daily` | Daily summary | Query: branch_id, date, category_id |
| GET | `/api/v1/expenses/reports/monthly` | Monthly summary | Query: branch_id, month, year |
| GET | `/api/v1/expenses/reports/category` | Category breakdown | Query: branch_id, date_from, date_to |

---

## 4. Data Models

### Service (Input)
```python
{
  "branch_id": 1,                    # Multi-tenant isolation
  "name": "Business Card Printing",
  "category": "printing",            # "printing" | "branding" | "stationary"
  "field_schema": {
    "quantity": {"type": "number", "label": "Qty", "unit": "cards"},
    "material": {"type": "text", "label": "Material Type"},
    "finish": {"type": "select", "options": ["matte", "glossy", "embossed"]}
  },
  "pricing_config": {
    "model": "per_quantity",         # "fixed" | "per_quantity" | "formula" | "per_area"
    "base_price": 500,
    "unit": "per 10 cards"
  },
  "status": "active"
}
```

### ServiceOrder (Output)
```json
{
  "id": "uuid",
  "order_number": "ORD-20250115-001",
  "service_id": "uuid",
  "branch_id": 1,
  "customer_name": "John Doe",
  "customer_phone": "+255712345678",
  "customer_email": "john@example.com",
  "items_json": {
    "quantity": 100,
    "material": "Premium White",
    "finish": "glossy"
  },
  "total_price": 5000,
  "status": "pending",               # pending→approved→processing→completed→delivered
  "payment_status": "unpaid",        # unpaid | partial | paid
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Expense (Linked to Order)
```json
{
  "id": "uuid",
  "branch_id": 1,
  "category_id": "uuid",
  "amount": 800,
  "description": "Paper for order ORD-20250115-001",
  "expense_date": "2025-01-15T10:30:00Z",
  "receipt_number": "RCP-001",
  "service_order_id": "order-uuid-456",    # ← Links to ServiceOrder
  "payment_method": "cash",
  "status": "recorded",                    # recorded | cancelled
  "created_by_user_id": 5,
  "created_at": "2025-01-15T11:00:00Z"
}
```

### RecurringExpense
```json
{
  "id": "uuid",
  "branch_id": 1,
  "category_id": "uuid",
  "name": "Shop Rent",
  "amount": 2000000,
  "frequency": "monthly",                 # daily | weekly | bi-weekly | monthly | quarterly | annually
  "start_date": "2025-01-01",
  "end_date": null,
  "day_of_month": 1,
  "is_active": true,
  "created_by_user_id": 5,
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## 5. Key Integration Points

### 1. Service Order → Expense Linking

**Use Case**: Track material/resource costs per order

```python
# When recording material cost for an order
expense = Expense(
    branch_id=order.branch_id,
    category_id=paper_category_id,
    amount=800,
    service_order_id=order.id,      # ← Link established
    description=f"Materials for {order.order_number}"
)
db.add(expense)
db.commit()
```

**Query Orders by Cost**:
```python
# Find orders with most expenses
expensive_orders = db.query(ServiceOrder).join(Expense).group_by(ServiceOrder.id)\
    .add_columns(func.sum(Expense.amount).label('total_cost'))\
    .filter(ServiceOrder.branch_id == branch_id)\
    .order_by(desc('total_cost')).limit(10).all()
```

### 2. Multi-Tenant Isolation

Both engines enforce `branch_id` filtering:

```python
@router.get("/api/v1/expenses")
def list_expenses(branch_id: int, db: Session):
    return db.query(Expense)\
        .filter(Expense.branch_id == branch_id)\  # ← Always filter by tenant
        .all()
```

### 3. Pricing + Cost Margin

Calculate profit per order:

```bash
# 1. Get order total (from Service Engine)
GET /api/v1/service-orders/order-uuid-456
→ total_price: 5000

# 2. Get linked expenses (from Expense Engine)
GET /api/v1/expenses?service_order_id=order-uuid-456
→ sum: 800

# 3. Margin = 5000 - 800 = 4200 (84%)
```

### 4. Reporting Integration

**Service Reports** (from Service Engine):
- Orders by status
- Revenue by service/category
- Customer metrics

**Expense Reports** (from Expense Engine):
- Monthly operational costs
- Category-wise breakdown
- Recurring vs one-time

**Combined Reports** (future Sprint 4):
- Profit per order (revenue - linked expenses)
- Service profitability (margin per service type)
- Cash flow forecasting

---

## 6. Database Schema (SQLAlchemy)

### Key Relationships

```python
# Service → ServiceOrder (one-to-many)
Service.orders = relationship('ServiceOrder', back_populates='service')
ServiceOrder.service = relationship('Service', back_populates='orders')

# ExpenseCategory → Expense (one-to-many)
ExpenseCategory.expenses = relationship('Expense', back_populates='category')
Expense.category = relationship('ExpenseCategory', back_populates='expenses')

# ServiceOrder → Expense (one-to-many) [Optional Link]
ServiceOrder.expenses = relationship('Expense', backref='service_order')
Expense.service_order = relationship('ServiceOrder', backref='expenses')

# Branch → All entities (one-to-many)
Branch.services = relationship('Service', backref='branch')
Branch.orders = relationship('ServiceOrder', backref='branch')
Branch.expenses = relationship('Expense', backref='branch')
Branch.recurring_expenses = relationship('RecurringExpense', backref='branch')
```

### Indexes for Query Performance

```python
# Service model
Index('idx_service_branch_category', Service.branch_id, Service.category)

# ServiceOrder model
Index('idx_order_branch_status', ServiceOrder.branch_id, ServiceOrder.status)

# Expense model
Index('idx_expense_branch_date', Expense.branch_id, Expense.expense_date)
Index('idx_expense_service_order', Expense.service_order_id)
```

---

## 7. Authentication & Authorization

### Token Requirements

All endpoints require **Bearer token** in Authorization header:

```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:8000/api/v1/services
```

### Multi-Tenant Access Control

```python
# User can only access their own branch
@router.get("/api/v1/expenses")
def list_expenses(branch_id: int, user_id: int, db: Session):
    user_branch = db.query(User).get(user_id).branch_id
    
    if branch_id != user_branch:
        raise HTTPException(status_code=403, detail="Unauthorized branch access")
    
    return db.query(Expense).filter(Expense.branch_id == branch_id).all()
```

---

## 8. Error Handling

### Standard Response Codes

| Code | Scenario |
|------|----------|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error (missing required fields, invalid types) |
| 403 | Forbidden (cross-tenant access) |
| 404 | Resource not found |
| 422 | Invalid schema (e.g., unrecognized field_schema structure) |
| 500 | Server error |

### Example Error Response

```json
{
  "detail": "Service not found with id 'invalid-uuid'"
}
```

---

## 9. Testing Workflows

### Create Full Order Workflow

```bash
#!/bin/bash
set -e

TOKEN="your-bearer-token"
BASE="http://localhost:8000/api/v1"

# 1. Create service
SERVICE=$(curl -s -X POST $BASE/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<EOF | jq -r '.id'
{
  "branch_id": 1,
  "name": "T-Shirt Branding",
  "category": "branding",
  "field_schema": {"size": {"type": "text"}, "design": {"type": "text"}},
  "pricing_config": {"model": "fixed", "base_price": 2000},
  "status": "active"
}
EOF
)
echo "Service created: $SERVICE"

# 2. Create order
ORDER=$(curl -s -X POST $BASE/service-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<EOF | jq -r '.id'
{
  "service_id": "$SERVICE",
  "branch_id": 1,
  "customer_name": "Acme Corp",
  "customer_phone": "+255712345678",
  "items_json": {"size": "XL", "design": "logo"}
}
EOF
)
echo "Order created: $ORDER"

# 3. Create expense for this order
EXPENSE=$(curl -s -X POST $BASE/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<EOF | jq -r '.id'
{
  "branch_id": 1,
  "category_id": "fabric-uuid",
  "amount": 500,
  "service_order_id": "$ORDER",
  "expense_date": "2025-01-15T10:00:00Z"
}
EOF
)
echo "Expense created: $EXPENSE"

# 4. Get order with linked expense
curl -s -X GET "$BASE/expenses?service_order_id=$ORDER" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 10. Deployment Checklist

- [ ] Database tables created (ServiceOrder, Expense, etc.)
- [ ] Alembic migration generated
- [ ] Redis configured (or fallback mode verified)
- [ ] Authentication middleware active
- [ ] Both routers registered in app/main.py
- [ ] Environment variables set (DB_URL, SECRET_KEY, etc.)
- [ ] CORS configured for frontend origin
- [ ] Rate limiting applied to auth endpoints
- [ ] Logging configured for audit trails
- [ ] SSL/TLS enabled in production

---

## 11. Next Steps (Sprint 4+)

- **Inventory Integration**: Deduct stock from ServiceOrder completion
- **Payment Integration**: Link payment methods and track payment status
- **Reporting Dashboard**: Web UI for financial metrics
- **Automation**: Generate recurring expenses automatically
- **Notifications**: WhatsApp alerts for order status + payment reminders
- **Analytics**: Profit margins, customer LTV, service profitability

---

**Support**: For questions, refer to SPRINT_1_API.md (Service details) or contact dev team.
