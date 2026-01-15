# Dashboard Redis Integration - Testing Checklist

## Pre-Testing Setup

- [ ] Backend Redis server is running (`redis-server` or Docker)
- [ ] Backend application is running with Redis connection
- [ ] Frontend development server is running (`npm run dev`)
- [ ] Browser console open for monitoring

## Visual Tests

### 1. Dashboard Header
- [ ] "Redis Cache Enabled" badge visible in subtitle
- [ ] Date filter dropdown works (Today, Last 7 Days, Last 30 Days, Last 90 Days)
- [ ] Changing filter triggers data reload

### 2. Cache Status Card
- [ ] Card appears below Quick Actions
- [ ] Shows "Healthy" status with green checkmark when Redis is up
- [ ] Memory usage bar displays correctly
- [ ] Shows cache metrics:
  - Keys count
  - Connected clients  
  - Commands processed
  - Evicted keys (should be 0)
- [ ] TTL information shown at bottom

### 3. Dashboard Data Display
- [ ] KPI cards load with data
- [ ] Revenue chart renders
- [ ] Top selling products list populated
- [ ] Recent orders table shows data

## Functional Tests

### Cache Hit Behavior
1. [ ] Load dashboard for first time → check browser network tab
   - Should see slower response (800ms+) - Cache MISS
2. [ ] Refresh dashboard immediately → check network tab
   - Should see fast response (<50ms) - Cache HIT
3. [ ] Wait 6 minutes → refresh dashboard
   - Stats should refresh (cache expired)
   - Revenue still cached (10min TTL)

### Date Filter Changes
1. [ ] Change from "Last 7 Days" to "Today"
   - [ ] New API calls made with `date_range=today`
   - [ ] Different cache key used (new cache miss)
   - [ ] Data updates appropriately
2. [ ] Change back to "Last 7 Days"
   - [ ] Should hit cache if <5min elapsed
   - [ ] Data matches previous view

### Cache Actions

#### Refresh Button
1. [ ] Click "Refresh" button in cache card
2. [ ] Spinning animation shows
3. [ ] Cache stats update
4. [ ] Success toast appears

#### Clear Cache Button
1. [ ] Click "Clear Cache" button
2. [ ] Confirmation dialog appears
3. [ ] Click "OK"
4. [ ] Page reloads automatically
5. [ ] Next request is cache MISS (fresh from DB)
6. [ ] All data still displays correctly

### Error Handling

#### Redis Down Scenario
1. [ ] Stop Redis server (`redis-cli shutdown` or stop Docker)
2. [ ] Refresh dashboard
3. [ ] Cache Status Card shows:
   - Orange border
   - "Unavailable" status
   - Warning icon
   - Fallback mode notice
4. [ ] Dashboard still works (queries database)
5. [ ] Clear Cache button is disabled
6. [ ] No JavaScript errors in console

#### Redis Recovery
1. [ ] Start Redis server again
2. [ ] Click "Refresh" in cache card
3. [ ] Status changes to "Healthy" (green)
4. [ ] Cache starts working again
5. [ ] Clear Cache button becomes enabled

## Performance Tests

### Initial Load (Cold Cache)
- [ ] Clear browser cache
- [ ] Clear Redis cache (click Clear Cache button)
- [ ] Open dashboard
- [ ] Record load time (should be ~800ms)

### Cached Load (Warm Cache)
- [ ] Refresh page immediately
- [ ] Record load time (should be <100ms)
- [ ] Verify 9x+ speed improvement

### Auto-Refresh
- [ ] Leave dashboard open
- [ ] Watch network tab for 30 seconds
- [ ] Should see auto-refresh requests every 10 seconds
- [ ] Most requests should be cache hits

## API Endpoint Tests

Use browser console or cURL:

```javascript
// Test cache health
fetch('/api/v1/dashboard/cache/health')
  .then(r => r.json())
  .then(console.log)
// Expected: {healthy: true, status: "available"}

// Test cache stats
fetch('/api/v1/dashboard/cache/stats')
  .then(r => r.json())
  .then(console.log)
// Expected: {status: "available", memory_used_mb: X, ...}

// Test manual invalidation
fetch('/api/v1/dashboard/cache/invalidate', {method: 'POST'})
  .then(r => r.json())
  .then(console.log)
// Expected: {status: "success", message: "..."}
```

## Edge Cases

### Concurrent Users
- [ ] Open dashboard in 2+ browser tabs
- [ ] Both should share same cache
- [ ] Clear cache in one tab
- [ ] Other tab still shows cached data until refresh

### Stale Data
1. [ ] Create new order via backend/API
2. [ ] Dashboard still shows old stats (cached)
3. [ ] Wait for cache expiry (5 min) OR click Clear Cache
4. [ ] New order now appears in stats

### Large Data Sets
- [ ] Test with 100+ recent orders
- [ ] Change limit to 50
- [ ] Verify pagination works
- [ ] Cache respects limit parameter

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

## Mobile Responsiveness

- [ ] Cache Status Card adapts to mobile width
- [ ] Buttons stack properly
- [ ] Memory bar remains readable
- [ ] Clear Cache confirmation works on mobile

## Regression Tests

### Existing Features Still Work
- [ ] New Order modal functions
- [ ] Add Stock modal functions  
- [ ] System Status Card displays
- [ ] Print jobs counter works
- [ ] Date filter affects all data

## Performance Monitoring

### Check Backend Logs
- [ ] Look for "cache_hit" vs "cache_miss" logs
- [ ] Hit rate should be >70% after warm-up
- [ ] No connection errors to Redis

### Check Redis CLI
```bash
# Connect to Redis
redis-cli

# Check key count
DBSIZE

# List dashboard keys
KEYS dashboard:*

# Check TTL on a key
TTL dashboard:1:stats:20260113_last_7_days:tz=Africa/Dar_es_Salaam

# Monitor real-time commands
MONITOR
```

## Acceptance Criteria

✅ All tests pass when Redis is running
✅ Dashboard works in fallback mode when Redis is down  
✅ Cache provides 9x+ speed improvement on warm cache
✅ Cache invalidation works correctly
✅ No console errors in any scenario
✅ Mobile responsive
✅ All existing features still work

## Known Issues / Limitations

- Cache is shared across all users (tenant-scoped but not user-scoped)
- Manual cache clear affects all users on same branch
- Real-time data (orders) not cached by design
- Cache health check runs every 30s (network overhead)

## Next Steps After Testing

- [ ] Deploy to staging environment
- [ ] Test with production-like data volume
- [ ] Set up monitoring alerts for Redis
- [ ] Document cache strategy for team
- [ ] Train admins on cache management

---

**Testing Date**: _____________
**Tester**: _____________
**Status**: ⬜ Pass | ⬜ Fail | ⬜ Blocked
**Notes**: 

