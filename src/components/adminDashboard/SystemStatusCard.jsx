import React from 'react';

const SystemStatusCard = ({ 
  isOnline = true,
  printQueueCount = 0,
  totalPrintPages = 0,
  cacheHealth = null,
  loading = false 
}) => {
  // Calculate server health percentage based on cache health
  const getServerHealthPercentage = () => {
    if (!cacheHealth || loading) return 0;
    
    // Calculate health score from cache metrics
    const connectedScore = cacheHealth.connected ? 50 : 0;
    const memoryScore = cacheHealth.memory_usage_percentage 
      ? Math.max(0, 50 - (cacheHealth.memory_usage_percentage / 2))
      : 25;
    
    return Math.min(100, connectedScore + memoryScore);
  };

  // Get color class based on percentage
  const getColorClass = (percentage) => {
    if (percentage >= 70) return 'green';
    if (percentage >= 40) return 'yellow';
    return 'red';
  };

  // Calculate print queue percentage (max 20 jobs = 100%)
  const getPrintQueuePercentage = () => {
    const maxJobs = 20;
    return Math.min(100, (printQueueCount / maxJobs) * 100);
  };

  const serverHealthPercentage = getServerHealthPercentage();
  const queuePercentage = getPrintQueuePercentage();

  return (
    <div className="system-status-card">
      <div className="status-header">
        <h3>System Status</h3>
        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
      </div>
      <div className="status-metrics">
        <div className="metric">
          <div className="metric-header">
            <span>Server Health</span>
            <span>
              {loading ? '...' : cacheHealth?.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="metric-bar">
            <div 
              className={`metric-fill ${getColorClass(serverHealthPercentage)}`} 
              style={{ width: `${serverHealthPercentage}%` }}
            ></div>
          </div>
          {cacheHealth?.memory_usage_percentage !== undefined && (
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
              Cache Memory: {cacheHealth.memory_usage_percentage.toFixed(1)}%
            </div>
          )}
        </div>
        <div className="metric">
          <div className="metric-header">
            <span>Printer Queue</span>
            <span>
              {loading ? '...' : `${printQueueCount} Job${printQueueCount !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="metric-bar">
            <div 
              className={`metric-fill ${getColorClass(100 - queuePercentage)}`} 
              style={{ width: `${queuePercentage}%` }}
            ></div>
          </div>
          {totalPrintPages > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
              Total Pages: {totalPrintPages}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemStatusCard;
