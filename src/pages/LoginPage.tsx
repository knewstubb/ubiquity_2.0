import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnTo = searchParams.get('returnTo') || '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      navigate(returnTo, { replace: true });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background font-sans">
      <div className="w-full max-w-[380px] bg-background border border-border rounded-md shadow-md p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-sm bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold leading-none">
            U
          </div>
          <span className="text-xl font-bold text-foreground">biquity</span>
        </div>

        <h1 className="text-lg font-semibold text-foreground text-center mb-6">
          Sign in to your account
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="h-10 px-2 border border-border-strong rounded-sm text-base font-sans text-foreground bg-background outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/15"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="h-10 px-2 border border-border-strong rounded-sm text-base font-sans text-foreground bg-background outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/15"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive text-center m-0" role="alert">{error}</p>}

          <button
            type="submit"
            className="h-10 border-none rounded-sm bg-primary text-primary-foreground text-base font-semibold font-sans cursor-pointer transition-colors duration-150 hover:not-disabled:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
