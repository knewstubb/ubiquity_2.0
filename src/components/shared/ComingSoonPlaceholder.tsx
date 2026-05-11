import { Link } from 'react-router-dom';

export function ComingSoonPlaceholder() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] font-sans bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-foreground m-0 mb-2">Coming Soon</h1>
        <p className="text-base text-muted-foreground m-0 mb-6">This feature is not yet available</p>
        <Link
          to="/dashboard"
          className="text-sm font-semibold text-primary no-underline transition-colors duration-150 hover:text-accent-foreground"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
