import { useState } from 'react';
import Button from '../../components/Button.jsx';
import userService from '../../services/userService.js';
import { useAuth } from '../../context/authContext';

const inputClasses =
  'mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [infoForm, setInfoForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    contactNumber: user.contactNumber || '',
    address: user.address || '',
  });
  const [infoMessage, setInfoMessage] = useState('');
  const [infoError, setInfoError] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoMessage('');
    setInfoError('');
    setSavingInfo(true);
    try {
      const updated = await userService.update(user._id, infoForm);
      refreshUser(updated);
      setInfoMessage('Profile updated.');
    } catch (err) {
      setInfoError(err.message);
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    setSavingPassword(true);
    try {
      await userService.changePassword(user._id, passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setPasswordMessage('Password updated.');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-blue-900 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-500">Profile</p>
        <h1 className="text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">
          {user.firstName} {user.lastName}
        </h1>
        <p className="mt-2 text-sm text-zinc-300">{user.email} · {user.role}</p>
      </section>

      <section className="border-y-2 border-zinc-900 bg-blue-900 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <form onSubmit={handleInfoSubmit} className="space-y-5 rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-6">
            <h2 className="font-semibold text-zinc-900">Edit Information</h2>
            {infoMessage && <p className="text-sm text-green-700">{infoMessage}</p>}
            {infoError && <p className="text-sm text-red-500">{infoError}</p>}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-zinc-900">First Name</label>
                <input id="firstName" name="firstName" value={infoForm.firstName} onChange={handleInfoChange} className={inputClasses} required />
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-zinc-900">Last Name</label>
                <input id="lastName" name="lastName" value={infoForm.lastName} onChange={handleInfoChange} className={inputClasses} required />
              </div>
            </div>
            <div>
              <label htmlFor="contactNumber" className="text-sm font-medium text-zinc-900">Contact Number</label>
              <input id="contactNumber" name="contactNumber" value={infoForm.contactNumber} onChange={handleInfoChange} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="address" className="text-sm font-medium text-zinc-900">Address</label>
              <input id="address" name="address" value={infoForm.address} onChange={handleInfoChange} className={inputClasses} />
            </div>

            <Button type="submit" variant="primary" disabled={savingInfo}>
              {savingInfo ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>

          <form onSubmit={handlePasswordSubmit} className="space-y-5 rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-6">
            <h2 className="font-semibold text-zinc-900">Change Password</h2>
            {passwordMessage && <p className="text-sm text-green-700">{passwordMessage}</p>}
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}

            <div>
              <label htmlFor="currentPassword" className="text-sm font-medium text-zinc-900">Current Password</label>
              <input id="currentPassword" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} className={inputClasses} required />
            </div>
            <div>
              <label htmlFor="newPassword" className="text-sm font-medium text-zinc-900">New Password</label>
              <input id="newPassword" name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} className={inputClasses} minLength={6} required />
            </div>

            <Button type="submit" variant="primary" disabled={savingPassword}>
              {savingPassword ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;