import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import Button from './Button';
import JobDetailModal from './JobDetailModal';

const JobCard = ({ job, onAddToCart, onPrint, onDownload }) => {
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = () => {
    setShowModal(true);
  };

  const handlePrint = (jobData) => {
    setShowModal(false);
    if (onPrint) onPrint(jobData);
  };

  const handleDownload = (jobData) => {
    setShowModal(false);
    if (onDownload) onDownload(jobData);
  };

  return (
    <>
      <div className="job-card">
        <div className="job-info">
          <h4>#{job.job_code} - {job.filename}</h4>
          <div className="job-meta">
            Pages: {job.total_pages} | Status: {job.status}
          </div>
        </div>
        <div className="job-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            onClick={handleViewDetails}
            variant="primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <Eye size={16} />
            View
          </Button>
          <Button 
            onClick={() => onAddToCart(job)}
            variant="success"
            style={{ padding: '0.5rem 1rem' }}
          >
            Add to Bill
          </Button>
        </div>
      </div>

      {showModal && (
        <JobDetailModal 
          job={job}
          onClose={() => setShowModal(false)}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />
      )}
    </>
  );
};

export default JobCard;
