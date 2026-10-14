import { useEffect, useRef, useState } from 'react';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const resolveImageSrc = (image) => (image?.startsWith('http') ? image : `/img/${image}`);

const ProductImageField = ({ currentImage, selectedImage, onImageChange, onError }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const previewUrlRef = useRef('');

  useEffect(() => {
    if (!selectedImage) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = '';
      }
    }
  }, [selectedImage]);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      event.target.value = '';
      onImageChange(null);
      onError('Choose a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      event.target.value = '';
      onImageChange(null);
      onError('Image must be 5 MB or smaller.');
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(file);
    setPreviewUrl(previewUrlRef.current);
    onError('');
    onImageChange(file);
  };

  const imageSrc = selectedImage && previewUrl
    ? previewUrl
    : currentImage
      ? resolveImageSrc(currentImage)
      : '';

  return (
    <div className="col-span-full">
      <label htmlFor="product-image" className="text-sm font-medium">Product Image</label>
      <input
        id="product-image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 file:mr-3 file:rounded file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-white"
      />
      <p className="mt-1 text-xs text-zinc-500">JPEG, PNG, or WebP. Maximum 5 MB.</p>
      {imageSrc && (
        <div className="mt-3 flex items-start gap-3">
          <img
            src={imageSrc}
            alt="Product image preview"
            className="h-28 w-36 rounded border border-zinc-300 bg-zinc-100 object-contain"
          />
          <p className="break-all text-xs text-zinc-600">
            {selectedImage ? selectedImage.name : 'Current saved image'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductImageField;