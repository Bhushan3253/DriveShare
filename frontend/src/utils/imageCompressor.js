/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * @param {File} file - The original File object.
 * @param {Object} options - Compression options.
 * @param {number} options.maxWidth - Maximum allowed width (default: 1600).
 * @param {number} options.maxHeight - Maximum allowed height (default: 1200).
 * @param {number} options.quality - JPEG quality between 0.1 and 1.0 (default: 0.82).
 * @returns {Promise<File>} Compressed File object.
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    // If not an image or SVG/GIF, return as-is
    if (!file || !file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
      return resolve(file);
    }

    const maxWidth = options.maxWidth || 1600;
    const maxHeight = options.maxHeight || 1200;
    const quality = options.quality || 0.82;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            // Create a new compressed file keeping the original name
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            // If compressed is somehow larger than original, return original
            if (compressedFile.size > file.size) {
              return resolve(file);
            }

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = (err) => resolve(file);
    };

    reader.onerror = (err) => resolve(file);
  });
};
