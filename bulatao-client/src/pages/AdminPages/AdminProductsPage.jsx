import { useEffect, useState } from 'react';
import productService from '../../services/productService.js';
import categoryService from '../../services/categoryService.js';
import ProductImageField from '../../components/ProductImageField.jsx';

const emptyForm = {
  productName: '',
  description: '',
  price: '',
  category: '',
  quantity: '',
  condition: 'new',
  status: 'available',
  images: [],
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    productService.getAll().then(setProducts).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      productName: product.productName,
      description: product.description,
      price: product.price,
      category: product.category?._id || '',
      quantity: product.quantity,
      condition: product.condition,
      status: product.status,
      images: product.images || [],
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        productName: form.productName,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        quantity: Number(form.quantity),
        condition: form.condition,
        status: form.status,
        images: form.images,
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

  const handleDelete = async (id) => {
    try {
      await productService.remove(id);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border-2 border-zinc-900 bg-white p-6 sm:grid-cols-2">
        <h2 className="col-span-full font-semibold text-zinc-900">
          {editingId ? 'Edit Product' : 'Create Product'}
        </h2>

        <div>
          <label className="text-sm font-medium text-zinc-900">Name</label>
          <input name="productName" value={form.productName} onChange={handleChange} required
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900" />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-900">Category</label>
          <select name="category" value={form.category} onChange={handleChange} required
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900">
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-900">Price</label>
          <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900" />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-900">Quantity</label>
          <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900" />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-900">Condition</label>
          <select name="condition" value={form.condition} onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900">
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-900">Status</label>
          <select name="status" value={form.status} onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900">
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="out of stock">Out of Stock</option>
          </select>
        </div>
        <div className="col-span-full">
          <label className="text-sm font-medium text-zinc-900">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} required
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900" />
        </div>
        <ProductImageField
          currentImage={form.images[0]}
          selectedImage={selectedImage}
          onImageChange={setSelectedImage}
          onError={setError}
        />

        <div className="col-span-full flex gap-3">
          <button type="submit" disabled={saving}
            className="rounded-full border-2 border-zinc-900 bg-zinc-900 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-50 disabled:opacity-50">
            {saving ? 'Saving…' : editingId ? 'Update Product' : 'Create Product'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}
              className="rounded-full border-2 border-zinc-900 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-900">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-zinc-600">Loading products…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-zinc-900 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-zinc-900 bg-zinc-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-zinc-200">
                  <td className="p-3">{p.productName}</td>
                  <td className="p-3">{p.category?.categoryName}</td>
                  <td className="p-3">₱{p.price}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3">
                    <button onClick={() => startEdit(p)} className="mr-3 font-semibold text-blue-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="font-semibold text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;