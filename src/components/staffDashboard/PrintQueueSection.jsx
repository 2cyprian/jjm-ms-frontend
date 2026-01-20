import React from 'react';
import { Printer, Download } from 'lucide-react';

const PrintQueueSection = ({ queue, loading, onDownload, onPrint }) => {
  return (
    <div className="print-queue-container">
      <div className="queue-header">
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={20} />
          Print Queue
        </h3>
        <span className="queue-badge">{queue.length}</span>
      </div>

      {queue.length === 0 ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 1rem' }}>
          No pending jobs
        </p>
      ) : (
        <div className="queue-items">
          {queue.map((job) => (
            <div key={job.id || job.job_code} className="queue-item">
              <div className="queue-item-info">
                <div className="queue-item-name">
                  {job.filename || job.name || `Job ${job.job_code}`}
                  {job.job_code && <span>Order #{job.job_code}</span>}
                </div>
                <div className="queue-item-meta">
                  {job.order_id && (job.total_pages || job.file_size) && <span> • </span>}
                  {job.total_pages && <span>{job.total_pages} pages</span>}
                  {job.total_pages && job.file_size && <span> • </span>}
                  {job.file_size && <span>{job.file_size}</span>}
                </div>
              </div>
              <div className="queue-item-actions">
                <button
                  onClick={() => onDownload(job.job_code, job.filename)}
                  disabled={loading}
                  className="queue-btn download-btn"
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => onPrint(job)}
                  disabled={loading}
                  className="queue-btn print-btn"
                  title="Print"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrintQueueSection;
