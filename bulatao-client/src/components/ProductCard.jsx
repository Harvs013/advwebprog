import { useState } from 'react';
import Button from './Button';

const resolveImageSrc = (image) => (image?.startsWith('http') ? image : `/img/${image}`);

const ProductCard = ({ product, index }) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = product.images?.[0] && !imgError;

  return (
    <article className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4">
      <div className="flex aspect-4/3 items-center justify-center overflow-hidden rounded-[1.25rem] bg-yellow-400">
        {hasImage ? (
          <img
            src={resolveImageSrc(product.images[0])}
            alt={product.productName}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-900">No Image</p>
        )}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-950">
        {product.category?.categoryName} {String(index + 1).padStart(2, '0')}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900">{product.productName}</h3>
      <p className="mt-2 text-base font-bold text-zinc-900">₱{product.price}</p>
      <p className="mt-3 text-sm leading-6 text-yellow-400">
        {product.description?.substring(0, 120)}...
      </p>
      <Button to={`/products/${product._id}`} className="mt-4">View Product</Button>
    </article>
  );
};

export default ProductCard;