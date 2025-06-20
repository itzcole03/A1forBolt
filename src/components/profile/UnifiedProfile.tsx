import React, { useState, useEffect } from 'react';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry';
import { UnifiedStateService } from '../../services/unified/UnifiedStateService';
import { UnifiedNotificationService } from '../../services/unified/UnifiedNotificationService';
import { UnifiedErrorService } from '../../services/unified/UnifiedErrorService';
import { UnifiedSettingsService } from '../../services/unified/UnifiedSettingsService';
import { Card, Button, Input, Select, Spinner, Toast, Modal, Badge } from '../ui/UnifiedUI';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  currency: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    oddsFormat: 'decimal' | 'fractional' | 'american';
    stakeLimit: number;
    autoConfirm: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    lastLogin: string;
    loginHistory: Array<{
      date: string;
      ip: string;
      device: string;
    }>;
  };
}

interface ProfileForm {
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  currency: string;
  timezone: string;
  language: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export const UnifiedProfile: React.FC = () => {
  // Initialize services
  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const stateService = serviceRegistry.getService<UnifiedStateService>('state');
  const notificationService =
    serviceRegistry.getService<UnifiedNotificationService>('notification');
  const errorService = serviceRegistry.getService<UnifiedErrorService>('error');
  const settingsService = serviceRegistry.getService<UnifiedSettingsService>('settings');

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    country: '',
    currency: '',
    timezone: '',
    language: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'preferences' | 'security' | 'activity'>(
    'personal'
  );

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to load profile');
      }
      const data = await response.json();
      setProfile(data);
      setForm({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        country: data.country,
        currency: data.currency,
        timezone: data.timezone,
        language: data.language,
      });
    } catch (error) {
      handleError('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    // Username validation
    if (!form.username) {
      errors.push({ field: 'username', message: 'Username is required' });
    } else if (form.username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
    }

    // Name validation
    if (!form.firstName) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }
    if (!form.lastName) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    // Phone validation
    if (form.phoneNumber && !/^\+?[\d\s-]{10,}$/.test(form.phoneNumber)) {
      errors.push({ field: 'phoneNumber', message: 'Invalid phone number format' });
    }

    // Date of birth validation
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) {
        errors.push({ field: 'dateOfBirth', message: 'Must be at least 18 years old' });
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setToast({
        message: 'Profile updated successfully',
        type: 'success',
      });

      await loadProfile();
    } catch (error) {
      handleError('Failed to update profile', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      setToast({
        message: 'Password changed successfully',
        type: 'success',
      });
      setShowPasswordModal(false);
    } catch (error) {
      handleError('Failed to change password', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/2fa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !profile?.security.twoFactorEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update 2FA settings');
      }

      setToast({
        message: `Two-factor authentication ${profile?.security.twoFactorEnabled ? 'disabled' : 'enabled'} successfully`,
        type: 'success',
      });
      setShowTwoFactorModal(false);
      await loadProfile();
    } catch (error) {
      handleError('Failed to update 2FA settings', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setToast({
        message: 'Account deleted successfully',
        type: 'success',
      });
      // Redirect to logout or home page
    } catch (error) {
      handleError('Failed to delete account', error);
    } finally {
      setSaving(false);
    }
  };

  const handleError = (message: string, error: any) => {
    setError(message);
    setToast({ message, type: 'error' });
    errorService.handleError(error, {
      code: 'PROFILE_ERROR',
      source: 'UnifiedProfile',
      details: { message },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'personal'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'preferences'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'security'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'activity'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>

        {/* Personal Information */}
        {activeTab === 'personal' && (
          <Card>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <Input
                    error={validationErrors.find(e => e.field === 'username')?.message}
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <Input disabled className="bg-gray-50 dark:bg-gray-800" value={profile?.email} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <Input
                    error={validationErrors.find(e => e.field === 'firstName')?.message}
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <Input
                    error={validationErrors.find(e => e.field === 'lastName')?.message}
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <Input
                    error={validationErrors.find(e => e.field === 'phoneNumber')?.message}
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date of Birth
                  </label>
                  <Input
                    error={validationErrors.find(e => e.field === 'dateOfBirth')?.message}
                    type="date"
                    value={form.dateOfBirth}
                    onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Country
                  </label>
                  <Select
                    options={[
                      { value: 'US', label: 'United States' },
                      { value: 'UK', label: 'United Kingdom' },
                      { value: 'CA', label: 'Canada' },
                      // Add more countries
                    ]}
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Currency
                  </label>
                  <Select
                    options={[
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'GBP', label: 'GBP (£)' },
                      // Add more currencies
                    ]}
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button disabled={saving} type="submit" variant="primary">
                  {saving ? <Spinner size="small" /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Preferences */}
        {activeTab === 'preferences' && (
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Theme</h3>
                <Select
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                  ]}
                  value={profile?.preferences.theme}
                  onChange={async e => {
                    try {
                      await settingsService.setSetting('theme', e.target.value);
                      await loadProfile();
                    } catch (error) {
                      handleError('Failed to update theme', error);
                    }
                  }}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Odds Format</h3>
                <Select
                  options={[
                    { value: 'decimal', label: 'Decimal (2.50)' },
                    { value: 'fractional', label: 'Fractional (3/2)' },
                    { value: 'american', label: 'American (+150)' },
                  ]}
                  value={profile?.preferences.oddsFormat}
                  onChange={async e => {
                    try {
                      await settingsService.setSetting('oddsFormat', e.target.value);
                      await loadProfile();
                    } catch (error) {
                      handleError('Failed to update odds format', error);
                    }
                  }}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <input
                      checked={profile?.notifications.email}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      type="checkbox"
                      onChange={async e => {
                        try {
                          await settingsService.setSetting('notifications.email', e.target.checked);
                          await loadProfile();
                        } catch (error) {
                          handleError('Failed to update email notifications', error);
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Push Notifications</span>
                    <input
                      checked={profile?.notifications.push}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      type="checkbox"
                      onChange={async e => {
                        try {
                          await settingsService.setSetting('notifications.push', e.target.checked);
                          await loadProfile();
                        } catch (error) {
                          handleError('Failed to update push notifications', error);
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SMS Notifications</span>
                    <input
                      checked={profile?.notifications.sms}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      type="checkbox"
                      onChange={async e => {
                        try {
                          await settingsService.setSetting('notifications.sms', e.target.checked);
                          await loadProfile();
                        } catch (error) {
                          handleError('Failed to update SMS notifications', error);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Password</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Last changed:{' '}
                  {new Date(profile?.security.lastPasswordChange || '').toLocaleDateString()}
                </p>
                <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {profile?.security.twoFactorEnabled
                        ? 'Two-factor authentication is enabled'
                        : 'Two-factor authentication is disabled'}
                    </p>
                  </div>
                  <Button
                    variant={profile?.security.twoFactorEnabled ? 'danger' : 'primary'}
                    onClick={() => setShowTwoFactorModal(true)}
                  >
                    {profile?.security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Login History</h3>
                <div className="space-y-4">
                  {profile?.security.loginHistory.map((login, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{login.device}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(login.date).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{login.ip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Activity */}
        {activeTab === 'activity' && (
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <div className="space-y-4">{/* Add activity history here */}</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        title="Change Password"
        onClose={() => setShowPasswordModal(false)}
      >
        <div className="space-y-4">
          <Input label="Current Password" placeholder="Enter current password" type="password" />
          <Input label="New Password" placeholder="Enter new password" type="password" />
          <Input label="Confirm New Password" placeholder="Confirm new password" type="password" />
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button
              disabled={saving}
              variant="primary"
              onClick={() => handlePasswordChange('', '')}
            >
              {saving ? <Spinner size="small" /> : 'Change Password'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Two-Factor Modal */}
      <Modal
        isOpen={showTwoFactorModal}
        title={profile?.security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        onClose={() => setShowTwoFactorModal(false)}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {profile?.security.twoFactorEnabled
              ? 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
              : 'Scan the QR code with your authenticator app to enable two-factor authentication.'}
          </p>
          {!profile?.security.twoFactorEnabled && (
            <div className="flex justify-center">{/* Add QR code here */}</div>
          )}
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setShowTwoFactorModal(false)}>
              Cancel
            </Button>
            <Button
              disabled={saving}
              variant={profile?.security.twoFactorEnabled ? 'danger' : 'primary'}
              onClick={handleTwoFactorToggle}
            >
              {saving ? (
                <Spinner size="small" />
              ) : profile?.security.twoFactorEnabled ? (
                'Disable 2FA'
              ) : (
                'Enable 2FA'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        title="Delete Account"
        onClose={() => setShowDeleteModal(false)}
      >
        <div className="space-y-4">
          <p className="text-red-600">
            Warning: This action cannot be undone. All your data will be permanently deleted.
          </p>
          <Input
            label="Confirm Password"
            placeholder="Enter your password to confirm"
            type="password"
          />
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button disabled={saving} variant="danger" onClick={handleDeleteAccount}>
              {saving ? <Spinner size="small" /> : 'Delete Account'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
