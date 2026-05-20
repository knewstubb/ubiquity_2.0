import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { CloseButton } from '@/components/ui/close-button';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!newPassword) {
        setError('New password is required');
        return;
      }
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!supabase) {
        setError('Not connected to Supabase');
        return;
      }

      setSaving(true);

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    },
    [currentPassword, newPassword, confirmPassword, onClose],
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]" onClick={onClose}>
      <div className="bg-background rounded-lg shadow-xl w-[400px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-lg font-semibold text-foreground m-0">Change Password</h2>
          <CloseButton
            size="lg"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        {success ? (
          <div className="p-6 text-center text-sm font-medium text-primary">
            Password updated successfully.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="cp-current">Current Password</label>
              <input
                id="cp-current"
                type="password"
                className="px-3 py-2 text-sm font-sans border border-border rounded bg-background text-foreground outline-none transition-colors duration-150 focus:border-primary focus:shadow-ring"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="cp-new">New Password</label>
              <input
                id="cp-new"
                type="password"
                className="px-3 py-2 text-sm font-sans border border-border rounded bg-background text-foreground outline-none transition-colors duration-150 focus:border-primary focus:shadow-ring"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="cp-confirm">Confirm New Password</label>
              <input
                id="cp-confirm"
                type="password"
                className="px-3 py-2 text-sm font-sans border border-border rounded bg-background text-foreground outline-none transition-colors duration-150 focus:border-primary focus:shadow-ring"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && <p className="text-[13px] text-destructive m-0">{error}</p>}

            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                className="px-4 py-2 text-sm font-sans font-medium text-muted-foreground bg-background border border-border rounded cursor-pointer transition-colors duration-150 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-sans font-semibold text-primary-foreground bg-primary border-none rounded cursor-pointer transition-colors duration-150 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
