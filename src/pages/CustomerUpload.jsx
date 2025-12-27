import React, { useState } from 'react';
import { Upload, CheckCircle, Smartphone } from 'lucide-react';
import { uploadFile } from '../utils/api';
import { useToast } from '../utils/toast';
import Card from '../components/Card';
import Button from '../components/Button';
import FileDropZone from '../components/FileDropZone';
import Spinner from '../components/Spinner';
import '../css/components/Customer.css';

const CustomerUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [jobCode, setJobCode] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const toast = useToast();

  // Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle API Upload
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const data = await uploadFile(file);
      setJobCode(data.job_code);
      setPageCount(data.pages);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error("Upload Failed! Please check your connection.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // --- VIEW 1: SUCCESS SCREEN (Code Generated) ---
  if (jobCode) {
    return (
      <div className="upload-container">
        <Card>
          <CheckCircle className="success-icon" size={64} />
          
          <h1 className="app-title">Ready to Print!</h1>
          <p className="app-subtitle">Please show this code at the counter.</p>
          
          <div className="job-id-box">
            <p className="job-label">Your Order ID</p>
            <h2 className="job-code">#{jobCode}</h2>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '20px', color: '#555', fontSize: '0.9rem' }}>
            <p><strong>File:</strong> {file.name}</p>
            <p><strong>Detected:</strong> {pageCount} Pages</p>
          </div>

          <Button 
            onClick={() => window.location.reload()} 
            className="restart-btn"
          >
            Upload Another File
          </Button>
        </Card>
      </div>
    );
  }

  // --- VIEW 2: UPLOAD SCREEN ---
  return (
    <div className="upload-container">
      <Card>
        {/* Header */}
        <Smartphone size={40} style={{ color: '#2563eb', marginBottom: '10px' }} />
        <h1 className="app-title">PrintSync</h1>
        <p className="app-subtitle">Connect & Upload Instantly</p>

        {/* Drop Zone */}
        <FileDropZone 
          file={file} 
          onFileChange={handleFileChange}
          acceptedFormats=".pdf,.doc,.docx"
        />

        {/* Action Button */}
        {file && (
          <Button 
            onClick={handleUpload} 
            disabled={uploading} 
            className="upload-btn"
          >
            {uploading ? <Spinner /> : <><Upload size={20} /> SEND TO PRINTER</>}
          </Button>
        )}
        
        {!file && (
          <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '20px' }}>
            Supported: PDF, DOCX, image (Max 50MB)
          </p>
        )}
      </Card>
    </div>
  );
};

export default CustomerUpload;