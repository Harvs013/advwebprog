import { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import Button from '../../components/Button';
import ProductImageField from '../../components/ProductImageField';

const emptyForm = {
  productName: '',
  description: '',
  price: '',
  quantity: '',
  condition: 'new',
  status: 'available',
  category: '',
  images: [],
};

const SellerProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    productService
      .getAll({ seller: user._id })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    categoryService.getAll().then(setCategories).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      };

      if (editingId) {
        await productService.update(editingId, payload, selectedImage);
      } else {
        await productService.create(payload, selectedImage);
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      productName: product.productName || '',
      description: product.description || '',
      price: product.price ?? '',
      quantity: product.quantity ?? '',
      condition: product.condition || 'new',
      status: product.status || 'available',
      category: product.category?._id || '',
      images: product.images || [],
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productService.remove(id);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 px-4 py-24 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-yellow-400">My Products</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Create and manage the listings you're selling on BulldogEx.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-400 bg-red-950/40 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-4 rounded-2xl border border-zinc-700 bg-blue-900/40 p-6 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Product Name</label>
            <input
              name="productName"
              value={form.productName}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-100 px-3 py-2 text-sm text-zinc-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-100 px-3 py-2 text-sm text-zinc-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Price</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-100 px-3 py-2 text-sm text-zinc-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="0"
              required
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-100 px-3 py-2 text-sm text-zinc-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Condition</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-100 px-3 py-2 text-sm text-zinc-900"
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-100 px-3 py-2 text-sm text-zinc-900"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-100 px-3 py-2 text-sm text-zinc-900"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <ProductImageField
            currentImage={form.images[0]}
            selectedImage={selectedImage}
            onImageChange={setSelectedImage}
            onError={setError}
          />

          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="mt-10">
          {loading ? (
            <p className="text-zinc-300">Loading your products…</p>
          ) : products.length === 0 ? (
            <p className="text-zinc-300">You haven't listed any products yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-blue-900/60 text-yellow-400">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-t border-zinc-700">
                      <td className="px-4 py-3">{p.productName}</td>
                      <td className="px-4 py-3">₱{Number(p.price).toFixed(2)}</td>
                      <td className="px-4 py-3">{p.quantity}</td>
                      <td className="px-4 py-3 capitalize">{p.status}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          className="mr-3 font-semibold text-yellow-400 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id)}
                          className="font-semibold text-red-300 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProductsPage;