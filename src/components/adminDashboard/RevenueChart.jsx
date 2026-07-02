import React, { useRef, useEffect } from 'react';
import { formatCurrency, formatDayLabel } from '../../utils/adminHelpers';

const RevenueChart = ({ 
  revenueData, 
  dateFilter, 
  startDate, 
  endDate,
  loading = false 
}) => {
  const canvasRef = useRef(null);

  const getPeriodLabel = (filter) => {
    if (filter === 'custom' && startDate && endDate) {
      const start = formatDayLabel(startDate);
      const end = formatDayLabel(endDate);
      return `${start} - ${end}`;
    }

    const labels = {
      today: 'Today',
      last_7_days: 'Last 7 Days',
      last_30_days: 'Last 30 Days',
      last_90_days: 'Last 90 Days'
    };
    return labels[filter] || 'Last 7 Days';
  };

  const hasData = revenueData.length > 0;

 


  // Draw line chart on canvas
  useEffect(() => {
    if (!canvasRef.current || !hasData || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    
    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width - 32; // Account for padding
    const height = 220;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Chart dimensions
    const padding = { top: 20, bottom: 30, left: 10, right: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find max value for scaling
    const maxValue = Math.max(...revenueData.map(d => d.value), 1);
    const minValue = 0;
    const range = maxValue - minValue || 1;

    // Draw grid lines (horizontal)
    const gridLines = 5;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight - (i / gridLines) * chartHeight);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Add value labels on y-axis
      const value = minValue + (i / gridLines) * range;
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatCurrency(value, 'TZS'), padding.left - 6, y);
    }
    ctx.setLineDash([]);

    // Draw line chart
    const points = revenueData.map((item, index) => {
      const x = padding.left + (index / (revenueData.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((item.value - minValue) / range) * chartHeight;
      return { x, y, value: item.value, label: item.day };
    });

    // Draw area under the line (gradient fill)
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.02)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.lineTo(point.x, point.y);
      } else {
        // Use cubic bezier for smooth curve
        const prev = points[index - 1];
        const cp1x = prev.x + (point.x - prev.x) * 0.5;
        const cp2x = prev.x + (point.x - prev.x) * 0.5;
        ctx.bezierCurveTo(cp1x, prev.y, cp2x, point.y, point.x, point.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw the line
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const prev = points[index - 1];
        const cp1x = prev.x + (point.x - prev.x) * 0.5;
        const cp2x = prev.x + (point.x - prev.x) * 0.5;
        ctx.bezierCurveTo(cp1x, prev.y, cp2x, point.y, point.x, point.y);
      }
    });
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw gradient glow effect under line
    const glowGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    glowGradient.addColorStop(0, 'rgba(79, 70, 229, 0.15)');
    glowGradient.addColorStop(0.5, 'rgba(79, 70, 229, 0.05)');
    glowGradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
    
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const prev = points[index - 1];
        const cp1x = prev.x + (point.x - prev.x) * 0.5;
        const cp2x = prev.x + (point.x - prev.x) * 0.5;
        ctx.bezierCurveTo(cp1x, prev.y, cp2x, point.y, point.x, point.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.lineTo(points[0].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Draw data points (circles)
    points.forEach((point) => {
      // Outer glow
      const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 12);
      glow.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
      glow.addColorStop(1, 'rgba(79, 70, 229, 0)');
      ctx.beginPath();
      ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Inner circle
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#4f46e5';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Value on hover - show tooltip
      // (Tooltip is handled by title attribute on the canvas)
    });

    // Draw x-axis labels
    points.forEach((point, index) => {
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const label = point.label.length > 10 ? point.label.substring(0, 10) + '...' : point.label;
      ctx.fillText(label, point.x, padding.top + chartHeight + 8);
    });

    // Add interactive tooltips on hover
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Find nearest point
      let nearest = null;
      let minDist = Infinity;
      points.forEach((point) => {
        const dist = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2));
        if (dist < minDist) {
          minDist = dist;
          nearest = point;
        }
      });

      // Show tooltip if mouse is near a point
      if (nearest && minDist < 30) {
        canvas.title = `${nearest.label}: ${formatCurrency(nearest.value, 'TZS')}`;
        canvas.style.cursor = 'pointer';
      } else {
        canvas.title = '';
        canvas.style.cursor = 'default';
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };

  }, [revenueData, hasData, loading]);

  if (loading) {
    return (
      <div className="chart-card large">
        <div className="chart-header">
          <div>
            <h3>Revenue Trends</h3>
            <p>Loading revenue data...</p>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          Loading chart data...
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card large">
      <div className="chart-header">
        <div>
          <h3>Revenue Trends</h3>
          <p>Sales performance - {getPeriodLabel(dateFilter)}</p>
        </div>
        
      </div>

      {hasData ? (
        <div style={{ padding: '1rem 1rem 0 1rem', position: 'relative' }}>
          <canvas 
            ref={canvasRef} 
            style={{ 
              width: '100%', 
              height: '220px',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          No revenue data available for this period
        </div>
      )}
    </div>
  );
};

export default RevenueChart;