# Quick Start: Redis-Cached Dashboard

## 🚀 Getting Started in 3 Steps

### Step 1: Start Redis
```bash
# Option A: Using Docker (Recommended)
docker run -d -p 6379:6379 --name pos-redis redis:latest

# Option B: Local Redis
redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### Step 2: Start Backend
```bash
cd /path/to/backend
source .venv/bin/activate

# Ensure .env has Redis config
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_DB=0

uvicorn app.main:app --reload
```

### Step 3: Start Frontend
```bash
cd /home/omware/Desktop/Project/pos-frontend
npm run dev
```

## ✅ Verification

1. **Open Dashboard**: http://localhost:5173/admin
2. **Check Badge**: Look for "⚡ Redis Cache Enabled" in header
3. **View Cache Status**: Scroll down to see Cache Status Card (should be 🟢 green)
4. **Test Performance**: 
   - First load: ~800ms
   - Refresh: <100ms (9x faster!)

## 🎯 What to Test

### Basic Cache Behavior
```bash
# 1. Open dashboard (fresh load)
# 2. Open browser DevTools → Network tab
# 3. Refresh page immediately
# 4. Notice faster load time (cache hit)
```

### Cache Invalidation
```bash
# 1. Click "Clear Cache" button in Cache Status Card
# 2. Confirm dialog
# 3. Page reloads with fresh data
```

### Cache Monitoring
```bash
# Check health
curl http://localhost:8000/api/v1/dashboard/cache/health

# View stats
curl http://localhost:8000/api/v1/dashboard/cache/stats
```

## 🔧 Troubleshooting

### "Cache Status shows Orange"
**Cause**: Redis not running
**Fix**:
```bash
# Check Redis
redis-cli ping

# If no response, start Redis
docker start pos-redis
# OR
redis-server
```

### "Dashboard is slow"
**Cause**: Cache not hitting
**Fix**:
1. Check cache health (should be green)
2. Verify backend Redis connection in logs
3. Check backend .env has correct REDIS_HOST

### "Clear Cache doesn't work"
**Cause**: Backend cache endpoint not responding
**Fix**:
```bash
# Test endpoint directly
curl -X POST http://localhost:8000/api/v1/dashboard/cache/invalidate

# Check backend logs for errors
```

## 📊 Expected Performance

| Scenario | Time | Status |
|----------|------|--------|
| First Load (Cold Cache) | ~800ms | ⏱️ Normal |
| Cached Load (Warm) | <100ms | ⚡ Fast |
| After Clear Cache | ~800ms | ⏱️ Normal (rebuilds cache) |
| Auto-refresh (10s) | <100ms | ⚡ Fast (uses cache) |

## 🎨 Visual Indicators

### Healthy Cache (What You Want)
```
┌─────────────────────────────────┐
│ 💾 Cache Status      ✓ Healthy │  ← Green border
│ Memory: 12.5 MB / 256 MB (5%)   │  ← Green progress bar
│ Keys: 42  Clients: 5            │
└─────────────────────────────────┘
```

### Unavailable Cache (Redis Down)
```
┌─────────────────────────────────┐
│ 💾 Cache Status  ⚠️ Unavailable │  ← Orange border
│ ⚠️ Fallback Mode: Redis cache   │  ← Warning message
│    unavailable. Dashboard        │
│    queries database directly.    │
└─────────────────────────────────┘
```

## 📝 Quick Commands

### Redis Management
```bash
# Start Redis
docker start pos-redis

# Stop Redis
docker stop pos-redis

# View Redis logs
docker logs pos-redis

# Connect to Redis CLI
redis-cli

# Clear all cache manually
redis-cli FLUSHDB
```

### Monitor Cache in Real-Time
```bash
# Open Redis CLI
redis-cli

# Watch commands
MONITOR

# In another terminal, refresh dashboard
# You'll see cache operations in real-time
```

## 🎓 Next Steps

1. ✅ Verify dashboard loads fast
2. ✅ Test cache invalidation
3. ✅ Monitor cache health
4. 📖 Read [DASHBOARD_CACHE_FEATURES.md](./DASHBOARD_CACHE_FEATURES.md)
5. 🧪 Complete [DASHBOARD_TESTING_CHECKLIST.md](./DASHBOARD_TESTING_CHECKLIST.md)

## 💡 Tips

- **Cache is shared**: All users see same cached data per branch
- **TTL varies**: Stats (5m), Revenue (10m), Products (15m)
- **Orders not cached**: Always real-time
- **Auto-refresh works**: Dashboard updates every 10s
- **Fallback works**: Dashboard still functions if Redis down

## 🆘 Need Help?

1. Check browser console for errors
2. Check backend logs for Redis connection issues
3. Verify Redis is running: `redis-cli ping`
4. Review [DASHBOARD_IMPLEMENTATION_SUMMARY.md](./DASHBOARD_IMPLEMENTATION_SUMMARY.md)

---

**Status**: Ready to Test ✨
**Estimated Setup Time**: 5 minutes
