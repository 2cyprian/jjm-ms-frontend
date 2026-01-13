import React from 'react';

const AgentSection = ({ formData, handleAgentChange }) => {
  const agent = formData?.agent || { name: '', jobTitle: '' };
  
  return (
    <div className="form-section">
      <h3>Agent Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Agent Name</label>
          <input
            type="text"
            value={agent.name}
            onChange={(e) => handleAgentChange('name', e.target.value)}
            placeholder="e.g., John Doe"
          />
        </div>
        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            value={agent.jobTitle}
            onChange={(e) => handleAgentChange('jobTitle', e.target.value)}
            placeholder="e.g., Senior Property Agent"
          />
        </div>
      </div>
    </div>
  );
};

export default AgentSection;
