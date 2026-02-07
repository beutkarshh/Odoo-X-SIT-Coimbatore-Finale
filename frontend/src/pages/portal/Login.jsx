import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Role } from '../../data/constants.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Label } from '../../components/ui/Label.jsx';
import { AlertCircle, Clock } from 'lucide-react';

export default function PortalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPendingUser, setIsPendingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsPendingUser(false);
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      const user = result.user;
      // Auto-redirect based on user role
      if (user.role === Role.ADMIN) {
        navigate('/admin/dashboard');
      } else if (user.role === Role.INTERNAL) {
        navigate('/internal/dashboard');
      } else {
        navigate('/portal/dashboard');
      }
    } else if (result.isPending) {
      setIsPendingUser(true);
    } else {
      setError('Invalid email or password');
    }

    setIsLoading(false);
  };

  if (isPendingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Approval Pending</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your internal staff account is still waiting for administrator approval.
            </p>
            <div className="p-4 bg-muted/50 rounded-md mb-6">
              <p className="text-sm text-foreground font-medium">Please wait</p>
              <p className="text-xs text-muted-foreground mt-1">
                You will be able to login once an administrator approves your request.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setIsPendingUser(false)}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to access your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-sm text-destructive">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="form-label">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="form-label">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground mb-2">Demo credentials:</p>
            <div className="space-y-1 text-xs font-mono text-foreground">
              <p>Admin: admin@example.com / admin123</p>
              <p>Internal: internal@example.com / internal123</p>
              <p>Customer: customer@example.com / customer123</p>
            </div>
          </div>

          <div className="mt-6 text-center space-y-2">
            <div>
              <Link to="/reset-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
