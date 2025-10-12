import React, { useState } from 'react';
import { getAssetUrl } from '@/config/cdn';

interface GalleryProps {
  images: string[];
  productName: string;
}

const Gallery: React.FC<GalleryProps> = ({ images, productName }) => {
  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div>
      <div className="mb-4 border rounded-lg overflow-hidden">
        <img
          src={getAssetUrl(mainImage)}
          alt={productName}
          className="w-full h-96 object-cover"
          width="600"
          height="600"
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(img)}
            className={`border-2 rounded-lg overflow-hidden ${mainImage === img ? 'border-indigo-500' : 'border-transparent'}`}
          >
            <img
              src={getAssetUrl(img)}
              alt={`${productName} thumbnail ${index + 1}`}
              className="w-full h-20 object-cover"
              loading="lazy"
              width="100"
              height="100"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
