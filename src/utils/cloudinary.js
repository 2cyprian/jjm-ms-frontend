/**
 * Cloudinary Image Upload Utility
 * Handles uploading images to Cloudinary and returns public URLs
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Cloudinary Dashboard > Settings > Upload
 * 2. Scroll to "Upload presets"
 * 3. Click "Add upload preset"
 * 4. Set Signing Mode to "Unsigned"
 * 5. Name it (e.g., "ml_default" or "jjm_geodata_preset")
 * 6. Configure folder and transformations if needed
 * 7. Save and use the preset name in the code below
 * 
 * For unsigned uploads, you only need:
 * - Cloud name (dpruyi9xs)
 * - Upload preset name
 * 
 * API key/secret are only needed for signed uploads (backend)
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dpruyi9xs';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Upload a single image file to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} - Returns object with url, publicId, etc.
 */
export const uploadImageToCloudinary = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', options.uploadPreset || CLOUDINARY_UPLOAD_PRESET);
    
    // Optional: add folder organization
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    // Optional: add tags for organization
    if (options.tags) {
      formData.append('tags', options.tags.join(','));
    }

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      resourceType: data.resource_type,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {FileList|Array} files - Array or FileList of image files
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} - Returns array of upload results
 */
export const uploadMultipleImages = async (files, options = {}) => {
  const fileArray = Array.from(files);
  
  const uploadPromises = fileArray.map((file, index) => 
    uploadImageToCloudinary(file, {
      ...options,
      tags: [...(options.tags || []), `order_${index}`],
    })
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};

/**
 * Generate Cloudinary transformation URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {string} - Transformed image URL
 */
export const getTransformedImageUrl = (publicId, transformations = {}) => {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = transformations;

  let transformString = `q_${quality},f_${format}`;
  
  if (width || height) {
    transformString += `,c_${crop}`;
    if (width) transformString += `,w_${width}`;
    if (height) transformString += `,h_${height}`;
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
};

/**
 * Delete an image from Cloudinary
 * Note: This requires backend implementation with API secret
 * @param {string} publicId - Cloudinary public ID to delete
 */
export const deleteImageFromCloudinary = async (publicId) => {
  // This should be done via backend API call since it requires API secret
  console.warn('Image deletion should be handled by backend API');
  throw new Error('Delete operation must be performed via backend');
};

export default {
  uploadImageToCloudinary,
  uploadMultipleImages,
  getTransformedImageUrl,
  deleteImageFromCloudinary,
};
