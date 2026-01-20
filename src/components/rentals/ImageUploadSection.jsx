import React from 'react';
import { Plus, Upload, X } from 'lucide-react';

const ImageUploadSection = ({ images, uploading, onUpload, onRemove }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ display: 'block', fontWeight: '500', marginBottom: 0, fontSize: '14px' }}>
          Equipment Images (max 5)
          <span style={{ color: '#9ca3af', fontWeight: '400', marginLeft: '8px' }}>
            ({images.length}/5)
          </span>
        </label>
      </div>

      {/* Upload Zone */}
      <div>
        <input
          type="file"
          id="equipmentImageUpload"
          accept="image/*"
          multiple
          onChange={(e) => onUpload(e.target.files)}
          disabled={uploading || images.length >= 5}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="equipmentImageUpload"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            cursor: uploading || images.length >= 5 ? 'not-allowed' : 'pointer',
            backgroundColor: uploading ? '#f3f4f6' : '#fafbfc',
            opacity: uploading || images.length >= 5 ? 0.6 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {uploading ? (
            <>
              <Upload size={32} style={{ color: '#3b82f6', marginBottom: '8px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                Uploading images...
              </span>
              <small style={{ color: '#9ca3af', marginTop: '4px' }}>Please wait</small>
            </>
          ) : images.length >= 5 ? (
            <>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                Maximum images reached
              </span>
            </>
          ) : (
            <>
              <Plus size={32} style={{ color: '#9ca3af', marginBottom: '8px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                Click to upload images
              </span>
              <small style={{ color: '#9ca3af', marginTop: '4px' }}>
                or drag and drop images here
              </small>
            </>
          )}
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '12px',
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                paddingBottom: '100%',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <img
                src={image.url}
                alt={`Equipment ${index + 1}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          {images.length} image{images.length !== 1 ? 's' : ''} ready to upload
        </div>
      )}
    </div>
  );
};

export default ImageUploadSection;
