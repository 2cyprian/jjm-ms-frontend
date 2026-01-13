import React from 'react';
import { Plus, Upload } from 'lucide-react';

const ImagesSection = ({
  formData,
  uploading,
  handleImageUpload,
  handleSetCoverImage,
  handleRemoveImage
}) => {
  return (
    <div className="form-section">
      <h3>Property Images</h3>
      <div className="image-upload-zone">
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e.target.files)}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <label htmlFor="imageUpload" className={`upload-label ${uploading ? 'uploading' : ''}`}>
          {uploading ? (
            <>
              <Upload size={32} className="spin" />
              <span>Uploading images...</span>
              <small>Please wait</small>
            </>
          ) : (
            <>
              <Plus size={32} />
              <span>Click to upload images</span>
              <small>or drag and drop images here</small>
            </>
          )}
        </label>
      </div>

      {formData.images.length > 0 && (
        <div className="image-grid">
          {formData.images.map((img, index) => (
            <div key={index} className="image-preview">
              <img src={img.url} alt={img.name} />
              <div className="image-actions">
                {img.isCover ? (
                  <span className="cover-badge">Cover</span>
                ) : (
                  <button
                    className="btn-cover"
                    onClick={() => handleSetCoverImage(index)}
                  >
                    Set as Cover
                  </button>
                )}
                <button
                  className="btn-remove-img"
                  onClick={() => handleRemoveImage(index)}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagesSection;
