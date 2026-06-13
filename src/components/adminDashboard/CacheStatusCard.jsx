import React, { useState, useEffect } from 'react';
import { Database, Activity, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { getCacheHealth, getCacheStats, invalidateCache } from '../../utils/api';
import { useToast } from '../../utils/toast';
import Button from '../Button';

const CacheStatusCard = () => {
  const toast = useToast();
  const [cacheHealth, setCacheHealth] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invalidating, setInvalidating] = useState(false);

  useEffect(() => {
    loadCacheStatus();
    const interval = setInterval(loadCacheStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadCacheStatus = async () => {
    try {
      const [health, stats] = await Promise.all([
        getCacheHealth(),
        getCacheStats()
      ]);
      setCacheHealth(health);
      setCacheStats(stats);
    } catch (err) {
      console.warn('Failed to load cache status:', err);
      setCacheHealth({ healthy: false, status: 'unavailable' });
    }
  };

  const handleInvalidateCache = async () => {
    if (!window.confirm('Are you sure you want to clear all dashboard cache? This will force refresh all data.')) {
      return;
    }

    setInvalidating(true);
    try {
      await invalidateCache();
      toast.success('Cache cleared successfully! Dashboard will refresh.');
      // Reload cache status
      await loadCacheStatus();
      // Trigger a full page reload to get fresh data
      window.location.reload();
    } catch (err) {
      console.error('Failed to invalidate cache:', err);
      toast.error('Failed to clear cache');
    } finally {
      setInvalidating(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await loadCacheStatus();
      toast.success('Cache status refreshed');
    } catch (err) {
      toast.error('Failed to refresh cache status');
    } finally {
      setLoading(false);
    }
  };

  const isHealthy = cacheHealth?.healthy === true;
  const memoryUsedMb = cacheStats?.memory_used_mb || 0;
  const memoryMaxMb = cacheStats?.memory_max_mb || 256;
  const memoryPercent = memoryMaxMb > 0 ? ((memoryUsedMb / memoryMaxMb) * 100).toFixed(1) : 0;

  return (
    <div className="cache-status-card" style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: `2px solid ${isHealthy ? '#4caf50' : '#ff9800'}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={24} color={isHealthy ? '#4caf50' : '#ff9800'} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Cache Status</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isHealthy ? (
            <CheckCircle size={20} color="#4caf50" />
          ) : (
            <AlertCircle size={20} color="#ff9800" />
          )}
          <span style={{ 
            fontSize: '0.9rem', 
            fontWeight: '600',
            color: isHealthy ? '#4caf50' : '#ff9800'
          }}>
            {isHealthy ? 'Healthy' : 'Unavailable'}
          </span>
        </div>
      </div>

      {cacheStats && cacheStats.status === 'available' && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Memory Usage</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                {memoryUsedMb.toFixed(1)} MB / {memoryMaxMb} MB ({memoryPercent}%)
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(memoryPercent, 100)}%`,
                height: '100%',
                backgroundColor: memoryPercent > 80 ? '#f44336' : memoryPercent > 60 ? '#ff9800' : '#4caf50',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: '#666'
          }}>
            <div>
              <span style={{ fontWeight: '600' }}>Keys:</span>{' '}
              {cacheStats.keyspace?.db0?.keys || 0}
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>Clients:</span>{' '}
              {cacheStats.connected_clients || 0}
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>Commands:</span>{' '}
              {cacheStats.total_commands_processed?.toLocaleString() || 0}
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>Evicted:</span>{' '}
              <span style={{ color: cacheStats.evicted_keys > 0 ? '#f44336' : '#4caf50' }}>
                {cacheStats.evicted_keys || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {!isHealthy && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fff3e0',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          color: '#f57c00'
        }}>
          <strong>Fallback Mode:</strong> Redis cache unavailable. Dashboard queries database directly (slower performance).
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="secondary"
          style={{ 
            flex: 1,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          Refresh
        </Button>
        <Button
          onClick={handleInvalidateCache}
          disabled={invalidating || !isHealthy}
          variant="danger"
          style={{ 
            flex: 1,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <Trash2 size={16} />
          {invalidating ? 'Clearing...' : 'Clear Cache'}
        </Button>
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '0.5rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: '#666',
        textAlign: 'center'
      }}>
        <Activity size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
        Cache TTL: Stats (5m) • Revenue (10m) • Products (15m)
      </div>
    </div>
  );
};

export default CacheStatusCard;
