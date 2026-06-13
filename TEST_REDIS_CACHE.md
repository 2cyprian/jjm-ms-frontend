# Test Redis Cache Integration

## ✅ Quick Backend Tests

### 1. Check Cache Health
```bash
curl http://localhost:8000/api/v1/dashboard/cache/health
```
**Expected Response:**
```json
{
  "healthy": true,
  "status": "available"
}
```

### 2. Check Cache Stats
```bash
curl http://localhost:8000/api/v1/dashboard/cache/stats
```
**Expected Response:**
```json
{
  "status": "available",
  "connected_clients": 1,
  "memory_used_mb": 2.5,
  "memory_max_mb": 256,
  "evicted_keys": 0,
  "total_commands_processed": 123,
  "keyspace": {
    "db0": {
      "keys": 5,
      "expires": 5
    }
  }
}
```

### 3. Test Dashboard Stats (with caching)
```bash
# First call - cache MISS
curl http://localhost:8000/api/v1/dashboard/stats?date_range=last_7_days

# Second call - cache HIT (should be much faster)
curl http://localhost:8000/api/v1/dashboard/stats?date_range=last_7_days
```

### 4. Test Revenue Data
```bash
curl http://localhost:8000/api/v1/dashboard/revenue?date_range=last_7_days
```

### 5. Test Top Products
```bash
curl http://localhost:8000/api/v1/dashboard/top-products?date_range=last_7_days&limit=5
```

### 6. Test Recent Orders (NOT cached)
```bash
curl http://localhost:8000/api/v1/dashboard/recent-orders?limit=10
```

### 7. Manually Clear Cache
```bash
curl -X POST http://localhost:8000/api/v1/dashboard/cache/invalidate
```
**Expected Response:**
```json
{
  "status": "success",
  "message": "Cache invalidated successfully",
  "keys_deleted": 12
}
```

## 🎯 Frontend Testing

### Visual Checks

1. **Open Dashboard**: http://localhost:5173/admin
2. **Look for**:
   - ✅ "⚡ Redis Cache Enabled" badge in header
   - ✅ Cache Status Card showing green "Healthy" status
   - ✅ Memory usage bar (should be low, like 1-5%)
   - ✅ Cache metrics displayed

### Test Cache Status Card

#### Refresh Button
1. Click "Refresh" button in Cache Status Card
2. Should see spinning icon briefly
3. Toast notification: "Cache status refreshed"
4. Metrics update

#### Clear Cache Button
1. Click "Clear Cache" button
2. Confirmation dialog appears: "Are you sure you want to clear all dashboard cache?"
3. Click "OK"
4. Toast notification: "Cache cleared successfully! Dashboard will refresh."
5. Page reloads automatically
6. All data is fresh from database

### Test Performance

#### Cache Hit Scenario
1. Open dashboard (first load - slow)
2. Note the load time in Network tab
3. Refresh page immediately
4. Note the load time (should be 10x faster)

**Expected:**
- First load: 500-1000ms
- Cached load: 50-100ms

#### Cache Miss After Clear
1. Click "Clear Cache"
2. Page reloads
3. Should take longer (fetching from DB)
4. Next refresh should be fast again (cache rebuilt)

### Test Date Filter Changes

1. Dashboard loads with "Last 7 Days" (default)
2. Change to "Today"
   - New API call with `date_range=today`
   - Data updates
3. Change to "Last 30 Days"
   - New API call with `date_range=last_30_days`
   - Data updates
4. Change back to "Last 7 Days"
   - Should hit cache if within TTL
   - Data loads instantly

## 🔍 Debugging Tips

### Check Browser Console

**Good Signs:**
- No 404 errors
- API calls return 200 status
- Fast response times (<100ms for cached)

**Bad Signs:**
- 404 errors → Backend not running or endpoints not implemented
- 500 errors → Backend Redis connection issues
- Slow response times even after cache warm-up

### Check Network Tab

1. Open DevTools → Network
2. Filter by "dashboard"
3. Look at response times:
   - First call: Slow (DB query)
   - Subsequent calls: Fast (Redis cache)

### Check Backend Logs

Look for:
```
INFO: cache_hit: dashboard:1:stats:20260113_last_7_days
INFO: cache_miss: dashboard:1:revenue:20260113_last_7_days
```

## 🐛 Troubleshooting

### Cache Status Shows Orange "Unavailable"

**Cause**: Redis not running or not connected

**Fix**:
```bash
# Check Redis
redis-cli ping
# Should return: PONG

# If not running, start it
docker start redis
# OR
redis-server
```

### "Clear Cache" Button Disabled

**Cause**: Cache health is false

**Fix**: Ensure Redis is running and connected

### Dashboard Data Not Updating

**Cause**: Cache not invalidating after changes

**Solutions**:
1. Manually clear cache via UI button
2. Wait for TTL to expire (5-15 min)
3. Check backend invalidation hooks are called

### 404 Errors on Cache Endpoints

**Cause**: Backend not updated with Redis implementation

**Fix**: Ensure backend has:
- `/dashboard/cache/health`
- `/dashboard/cache/stats`
- `/dashboard/cache/invalidate`

## ✅ Success Criteria

- [ ] Cache health shows "Healthy" (green)
- [ ] Memory usage displays correctly
- [ ] Cache metrics show positive numbers
- [ ] Refresh button works
- [ ] Clear cache button works with confirmation
- [ ] Dashboard loads in <100ms after cache warm-up
- [ ] Date filters trigger new cache keys
- [ ] No console errors
- [ ] Badge shows "Redis Cache Enabled"

## 📊 Expected Performance

| Scenario | Time | Cache Status |
|----------|------|--------------|
| First Load | 500-1000ms | MISS |
| Second Load | 50-100ms | HIT |
| After Clear Cache | 500-1000ms | MISS |
| After 5 Minutes | 500-1000ms | MISS (TTL expired) |

## 🎓 Advanced Testing

### Load Testing Cache Performance

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test without cache (clear first)
curl -X POST http://localhost:8000/api/v1/dashboard/cache/invalidate
ab -n 100 -c 10 http://localhost:8000/api/v1/dashboard/stats?date_range=last_7_days

# Test with warm cache
ab -n 1000 -c 50 http://localhost:8000/api/v1/dashboard/stats?date_range=last_7_days
```

### Monitor Redis in Real-Time

```bash
# Terminal 1: Monitor Redis commands
redis-cli MONITOR

# Terminal 2: Use the dashboard
# You'll see cache operations in Terminal 1
```

### Check Cache Keys

```bash
redis-cli

# List all dashboard keys
KEYS dashboard:*

# Check TTL of a key
TTL dashboard:1:stats:20260113_last_7_days:tz=Africa/Dar_es_Salaam

# Get value of a key
GET dashboard:1:stats:20260113_last_7_days:tz=Africa/Dar_es_Salaam

# Count all keys
DBSIZE
```

---

**Status**: Ready for Testing ✅
**Last Updated**: January 13, 2026
