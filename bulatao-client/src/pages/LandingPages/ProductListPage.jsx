import { useEffect, useState } from 'react';
import Button from '../../components/Button.jsx';
import ProductList from '../../components/ProductList.jsx';
import productService from '../../services/productService.js';
import categoryService from '../../services/categoryService.js';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;

    setLoading(true);
    setError('');
    const timeoutId = setTimeout(() => {
      productService
        .getAll(params)
        .then(setProducts)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300); // small debounce so typing doesn't fire a request per keystroke

    return () => clearTimeout(timeoutId);
  }, [search, category]);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-blue-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
          Products
        </p>
        <h1 className="max-w-xl text-3xl font-bold leading-tight text-zinc-100 sm:text-4xl">
          Shop campus essentials in a simple product grid
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-yellow-600 sm:text-base">
          Browse practical items for class, study, commute, and everyday campus routines.
        </p>
        <div className="mt-6">
          <Button to="/">Back Home</Button>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-blue-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
              Featured Products
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Product card grid</h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <p className="text-sm text-zinc-300">Loading products…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="text-sm text-zinc-300">No products match your search.</p>
        )}
        {!loading && !error && products.length > 0 && <ProductList products={products} />}
      </section>
    </div>
  );
}

export default ProductListPage