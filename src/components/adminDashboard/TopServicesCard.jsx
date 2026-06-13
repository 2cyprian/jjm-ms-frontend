import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

const TopServicesCard = ({ dateRange = 'last_7_days' }) => {
  const [services, setServices] = useState([
    { name: 'Branding', amount: 14200, percentage: 85 },
    { name: 'Large Format', amount: 11800, percentage: 72 },
    { name: 'Digital Printing', amount: 8450, percentage: 55 },
    { name: 'Packaging', amount: 5200, percentage: 40 },
    { name: 'Direct Mail', amount: 3200, percentage: 25 }
  ]);
  const [loading, setLoading] = useState(true);

  const fetchTopServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/top-services?limit=5&date_range=${dateRange}`);
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        const servicesData = response.data.data.map(service => ({
          name: service.name || service.service_name,
          amount: service.revenue || service.amount || 0,
          percentage: service.percentage || 0
        }));
        
        setServices(servicesData);
      }
    } catch (err) {
      console.error('Error fetching top services:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchTopServices();
  }, [fetchTopServices]);

  return (
    <div className="chart-card">
      <h3>Top Services</h3>
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999' }}>
          <span>Loading services...</span>
        </div>
      ) : (
        <div className="service-list">
          {services.map((service, idx) => (
            <div key={idx} className="service-item">
              <div className="service-header">
                <span className="service-name">{service.name}</span>
                <span className="service-amount">${service.amount.toLocaleString()}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${service.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopServicesCard;
