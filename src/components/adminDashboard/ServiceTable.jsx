import React from 'react';

const ServiceTable = ({ services, onEdit, onDelete }) => {
  if (services.length === 0) {
    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Pricing Model</th>
              <th>Base Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" className="text-center text-muted py-8">
                No services found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Pricing Model</th>
            <th>Base Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id}>
              <td className="font-semibold">{service.name}</td>
              <td>
                <span className="badge badge-info">{service.category}</span>
              </td>
              <td className="text-muted text-sm">
                {service.description || 'N/A'}
              </td>
              <td className="text-sm">
                {service.pricing_config?.model?.replace(/_/g, ' ') || 'Fixed'}
              </td>
              <td className="text-sm">
                {service.pricing_config?.base_price ? `Tzs ${service.pricing_config.base_price.toFixed(2)}` : 'N/A'}
              </td>
              <td>
                <span className={`badge ${service.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {service.status || 'active'}
                </span>
              </td>
              <td className="action-buttons">
                <button
                  className="btn-icon"
                  onClick={() => onEdit(service)}
                  title="Edit"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => onDelete(service.id)}
                  title="Delete"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceTable;
