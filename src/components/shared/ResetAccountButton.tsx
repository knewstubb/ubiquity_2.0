import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from './Toast';

export function ResetAccountButton() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleReset = useCallback(async () => {
    if (!supabase || !user) return;

    const confirmed = window.confirm(
      'Are you sure? This will reset all your changes.',
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('reset_user_data', {
        target_user_id: user.id,
      });
      if (error) throw error;
      showToast('Account data reset successfully', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to reset account data',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  // Hidden when Supabase not configured
  if (!isSupabaseConfigured()) return null;

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleReset}
      disabled={loading}
      style={{
        display: 'block',
        width: '100%',
        padding: '8px 12px',
        fontFamily: "'Inter', sans-serif",
        fontSize: '13px',
        fontWeight: 500,
        color: '#EF4444',
        background: 'none',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'wait' : 'pointer',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        transition: 'background 150ms ease',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.background = '#FEF2F2';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.background = 'none';
      }}
    >
      {loading ? 'Resetting…' : 'Reset Account'}
    </button>
  );
}
