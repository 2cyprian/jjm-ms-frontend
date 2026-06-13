import React from 'react';
import { FileText } from 'lucide-react';

const FileDropZone = ({ file, onFileChange, acceptedFormats = '.pdf,.doc,.docx' }) => {
  return (
    <div className={`drop-zone ${file ? 'has-file' : ''}`}>
      <FileText className="file-icon" size={48} />
      
      {file ? (
        <>
          <p className="file-name">{file.name}</p>
          <p style={{ fontSize: '0.8rem', color: '#10b981' }}>Ready to send</p>
        </>
      ) : (
        <>
          <p style={{ marginBottom: '10px', fontWeight: '500' }}>Select Document</p>
          <label htmlFor="file-input" className="select-btn">
            Browse Files
          </label>
        </>
      )}

      <input 
        type="file" 
        id="file-input" 
        className="hidden-input"
        onChange={onFileChange}
        accept={acceptedFormats}
      />
    </div>
  );
};

export default FileDropZone;
