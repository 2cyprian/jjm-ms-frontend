# Dashboard Components - Backend Integration Guide

## 🔄 All Components Now Fetch Real Data from Backend

### Components with Dynamic Data Fetching

| Component | API Endpoint | Props | Default |
|-----------|------------|-------|---------|
| `KpiGrid` | `/dashboard/stats` | `dateRange` | `'last_7_days'` |
| `RevenueVsExpensesChart` | `/dashboard/revenue-expenses` | `dateRange` | `'last_7_days'` |
| `TopServicesCard` | `/dashboard/top-services` | `dateRange` | `'last_7_days'` |
| `ExpensesBreakdownCard` | `/dashboard/expenses-breakdown` | `dateRange` | `'last_7_days'` |
| `RecentOrdersTable` | `/dashboard/recent-orders` | `ordersLimit` | `10` |

---

## 📦 Usage in AdminDashboard.jsx

```jsx
import KpiGrid from '../components/adminDashboard/KpiGrid';
import RevenueVsExpensesChart from '../components/adminDashboard/RevenueVsExpensesChart';
import TopServicesCard from '../components/adminDashboard/TopServicesCard';
import ExpensesBreakdownCard from '../components/adminDashboard/ExpensesBreakdownCard';
import RecentOrdersTable from '../components/adminDashboard/RecentOrdersTable';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('last_7_days');

  return (
    <main className="dashboard-main">
      {/* Date Range Selector */}
      <div style={{ marginBottom: '20px' }}>
        <select 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
        >
          <option value="today">Today</option>
          <option value="last_7_days">Last 7 Days</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="last_90_days">Last 90 Days</option>
        </select>
      </div>

      {/* KPI Cards */}
      <KpiGrid dateRange={dateRange} />

      {/* Charts Row */}
      <section className="dashboard-charts-row">
        <RevenueVsExpensesChart dateRange={dateRange} />
        <TopServicesCard dateRange={dateRange} />
      </section>

      {/* Bottom Row */}
      <section className="dashboard-bottom-row">
        <RecentOrdersTable ordersLimit={10} />
        <ExpensesBreakdownCard dateRange={dateRange} />
      </section>
    </main>
  );
};
```

---

## 🔌 Component Props & Behavior

### KpiGrid
```jsx
<KpiGrid 
  dateRange="last_7_days"  // 'today', 'last_7_days', 'last_30_days', 'last_90_days'
  stats={{}}               // Optional: Override with hardcoded data
  totalRevenueDisplay={0}  // Optional: Override revenue
  rentalIncome={0}         // Optional: Override rental income
/>
```

**Features:**
- Auto-fetches from API if no `stats` prop
- Falls back to default values if API fails
- Updates when `dateRange` changes

---

### RevenueVsExpensesChart
```jsx
<RevenueVsExpensesChart 
  dateRange="last_7_days"  // Changes data fetched
/>
```

**Features:**
- Fetches 6 months of data
- Auto-normalizes percentages for visualization
- Displays actual values on hover (via title attribute)
- Shows loading state while fetching

---

### TopServicesCard
```jsx
<TopServicesCard 
  dateRange="last_7_days"  // Filters services by period
/>
```

**Features:**
- Shows top 5 services by revenue
- Auto-calculates percentages
- Loading state management
- Fallback to sample data

---

### ExpensesBreakdownCard
```jsx
<ExpensesBreakdownCard 
  dateRange="last_7_days"  // Filters expenses by period
/>
```

**Features:**
- Dynamic SVG donut chart generation
- Calculates segments based on percentages
- Formats total (shows $18.2k, $1.2M, etc.)
- Responsive to data changes

---

### RecentOrdersTable
```jsx
<RecentOrdersTable 
  ordersLimit={10}                    // Number of orders to show
  recentOrders={[]}                   // Optional: Hardcoded orders
  onLimitChange={(limit) => {}}       // Callback when limit changes
/>
```

**Features:**
- Auto-maps order status to CSS badge classes
- Loading, error, and empty states
- Fallback to sample data
- Auto-fetches with ordersLimit dependency

---

## 🎯 Backend Response Format

### `/dashboard/stats`
```json
{
  "success": true,
  "data": {
    "totalRevenue": 42850.50,
    "revenueChange": 12.4,
    "totalOrders": 1284,
    "ordersChange": 8.1,
    "totalExpenses": 18240.00,
    "expensesChange": -4.2,
    "rentalIncome": 5000.00,
    "lowStockItems": 0,
    "dailyFootfall": 0,
    "footfallChange": 0
  }
}
```

### `/dashboard/revenue-expenses`
```json
{
  "success": true,
  "data": [
    { "month": "Jan", "revenue": 35000, "expenses": 8000 },
    { "month": "Feb", "revenue": 42000, "expenses": 9500 },
    // ...6 total months
  ]
}
```

### `/dashboard/top-services`
```json
{
  "success": true,
  "data": [
    { "name": "Branding", "revenue": 14200, "percentage": 85 },
    { "name": "Large Format", "revenue": 11800, "percentage": 72 }
    // ...5 total services
  ]
}
```

### `/dashboard/expenses-breakdown`
```json
{
  "success": true,
  "data": {
    "breakdown": [
      { "category": "Logistics", "amount": 8191, "percentage": 45 },
      { "category": "Materials", "amount": 5472, "percentage": 30 },
      { "category": "Overhead", "amount": 4554, "percentage": 25 }
    ],
    "total": 18217
  }
}
```

### `/dashboard/recent-orders`
```json
{
  "success": true,
  "data": [
    {
      "order_id": "#EMZ-9042",
      "service_name": "Large Format Vinyl",
      "client_name": "Apex Tech",
      "amount": 1240.00,
      "status": "Completed"
    }
    // ...10 orders
  ]
}
```

---

## 🔧 Error Handling

All components handle errors gracefully:

```jsx
// 1. Loading State - shows spinner
{loading ? <div>Loading...</div> : <Content />}

// 2. API Error - falls back to sample/default data
try {
  const response = await api.get(endpoint);
  setData(response.data.data);
} catch (err) {
  console.error('Error:', err);
  // Uses sample or default data
}

// 3. Empty State - specific message
{displayData.length === 0 ? <EmptyState /> : <Table />}
```

---

## ⚙️ Configuration

### Date Range Support
Pass `dateRange` to any component to filter data:
```jsx
<KpiGrid dateRange="last_30_days" />
<RevenueVsExpensesChart dateRange="today" />
```

Supported values:
- `'today'` - Current day only
- `'last_7_days'` - Last 7 days (default)
- `'last_30_days'` - Last 30 days
- `'last_90_days'` - Last 90 days
- `'custom'` + `startDate` & `endDate` - Custom range (optional)

### Limits & Pagination
```jsx
<RecentOrdersTable ordersLimit={10} />
<RecentOrdersTable ordersLimit={20} />
```

---

## 🚀 Recommended Implementation Flow

1. **Start Backend APIs** - Implement the 5 endpoints
2. **Test with Postman** - Verify response formats
3. **Update AdminDashboard.jsx** - Use component props
4. **Add Date Range Filter** - Let users change periods
5. **Monitor Performance** - Cache if needed
6. **Add Error Logging** - Track API issues

---

## ⚡ Performance Tips

- **Cache Dashboard Data**: Add 5-10 minute TTL to API responses
- **Lazy Load**: Load data only when dashboard is visible
- **Debounce Date Range**: Debounce date filter changes
- **Batch Requests**: Consider combining API calls
- **Error Recovery**: Retry failed requests with exponential backoff

