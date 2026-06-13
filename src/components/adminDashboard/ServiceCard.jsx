import React from 'react';

const ServiceCard = ({ service, onEdit, onDelete, onManage }) => {
  const statusBgColor = service.status === 'active' ? 'bg-green-100' : 'bg-surface-variant';
  const statusTextColor = service.status === 'active' ? 'text-green-800' : 'text-on-surface-variant';
  const categoryColors = {
    printing: 'text-primary',
    branding: 'bg-primary',
    stationary: 'text-on-surface-variant',
    logistics: 'text-error',
    manufacturing: 'text-tertiary',
  };

  const categoryDotColors = {
    printing: 'bg-primary',
    branding: 'bg-blue-500',
    stationary: 'bg-secondary',
    logistics: 'bg-error',
    manufacturing: 'bg-tertiary',
  };

  const categoryColor = categoryColors[service.category] || 'text-primary';
  const dotColor = categoryDotColors[service.category] || 'bg-primary';

  // Get pricing model display
  const pricingModel = service.pricing_config?.model || 'fixed';
  const pricingModelDisplay = {
    fixed: 'Fixed Package',
    per_quantity: 'Per Quantity',
    formula: 'Formula Based',
    per_area: 'Per Sq Foot',
  }[pricingModel] || 'Custom';

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 card-shadow hover:scale-[1.01] transition-transform flex flex-col group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-16 h-16 bg-primary-container rounded-lg flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-[32px]">architecture</span>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full ${statusBgColor} ${statusTextColor} font-label-md text-[10px] uppercase tracking-wide`}>
            {service.status || 'active'}
          </span>
          <button 
            onClick={() => onEdit(service)}
            className="text-on-surface-variant hover:text-primary"
            title="Edit service"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button 
            onClick={() => onDelete(service.id)}
            className="text-on-surface-variant hover:text-primary"
            title="Delete service"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
          <span className="text-label-md font-medium text-primary uppercase tracking-wider">
            {service.category || 'general'}
          </span>
        </div>
        <h3 className="font-headline-md text-headline-md text-primary">
          {service.name}
        </h3>
        <p className="text-body-sm text-on-surface-variant mt-2 line-clamp-2">
          {service.description || 'No description provided'}
        </p>
      </div>
      <div className="mt-auto pt-4 border-t border-outline-variant/10 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Pricing Model</p>
          <p className="text-label-lg text-primary">{pricingModelDisplay}</p>
        </div>
        <button 
          onClick={() => onManage(service)}
          className="text-primary font-label-lg group-hover:underline flex items-center gap-1"
        >
          Manage <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
