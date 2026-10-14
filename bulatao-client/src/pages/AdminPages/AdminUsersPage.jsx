import { useEffect, useState } from 'react';
import userService from '../../services/userService.js';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', contactNumber: '', address: '' });

  const loadUsers = () => {
    setLoading(true);
    userService.getAll().then(setUsers).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeoutId = setTimeout(loadUsers, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const toggleActive = async (u) => {
    try {
      await userService.setActive(u._id, !u.isActive);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      contactNumber: u.contactNumber || '',
      address: u.address || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    try {
      await userService.update(id, editForm);
      setEditingId(null);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-zinc-900">Users</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-zinc-600">Loading users…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-zinc-900 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-zinc-900 bg-zinc-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-zinc-200 align-top">
                  <td className="p-3">
                    {editingId === u._id ? (
                      <div className="flex flex-col gap-1">
                        <input name="firstName" value={editForm.firstName} onChange={handleEditChange} className="rounded border border-zinc-300 px-2 py-1 text-sm" />
                        <input name="lastName" value={editForm.lastName} onChange={handleEditChange} className="rounded border border-zinc-300 px-2 py-1 text-sm" />
                        <input name="contactNumber" value={editForm.contactNumber} onChange={handleEditChange} placeholder="Contact number" className="rounded border border-zinc-300 px-2 py-1 text-sm" />
                        <input name="address" value={editForm.address} onChange={handleEditChange} placeholder="Address" className="rounded border border-zinc-300 px-2 py-1 text-sm" />
                      </div>
                    ) : (
                      `${u.firstName} ${u.lastName}`
                    )}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      {editingId === u._id ? (
                        <>
                          <button onClick={() => saveEdit(u._id)} className="font-semibold text-green-700 hover:underline">Save</button>
                          <button onClick={() => setEditingId(null)} className="font-semibold text-zinc-600 hover:underline">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(u)} className="font-semibold text-blue-700 hover:underline">Edit</button>
                      )}
                      <button onClick={() => toggleActive(u)} className="font-semibold text-orange-700 hover:underline">
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
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

export default AdminUsersPage;
