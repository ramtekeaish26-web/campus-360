import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { RoleCode } from '../../types/index.js';
import {
  School,
  BadgePercent,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Lock,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';

interface DemoUser {
  email: string;
  role: RoleCode;
}

const DEMO_ACCOUNTS: Record<string, DemoUser> = {
  student: {
    email: 'student@demo.local',
    role: 'STUDENT',
  },
  faculty: {
    email: 'faculty@demo.local',
    role: 'FACULTY',
  },
  admin: {
    email: 'admin@demo.local',
    role: 'ADMIN',
  },
};

export const LoginPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'student' | 'faculty' | 'admin'>('student');
  const [email, setEmail] = useState('student@demo.local');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleTabChange = (tab: 'student' | 'faculty' | 'admin') => {
    setSelectedTab(tab);
    setEmail(DEMO_ACCOUNTS[tab].email);
    setPassword('demo123');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password, DEMO_ACCOUNTS[selectedTab].role);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/tgpcet-campus-bg.jpg')" }}
    >
      {/* Refined gradient overlay: ensures contrast for readability while keeping the campus photograph recognizable */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-900/40 to-slate-950/70 backdrop-blur-[1px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-4 my-auto">
        {/* Main Login Card */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden">
          {/* Accent top gradient */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary-container via-secondary to-primary-container" />

          {/* Header & Logo */}
          <div className="p-6 sm:p-8 pb-3 flex flex-col space-y-3">
            {/* Official TGPCET College Logo */}
            <div className="flex items-center justify-start p-1.5 bg-white rounded-xl border border-outline/20 shadow-sm max-w-[200px]">
              <img
                src="/images/tgpcet-logo.jpg"
                alt="TGPCET College Logo"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>

            <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight">
              Access Campus 360
            </h1>
          </div>

          {/* Role Switcher Tabs */}
          <div className="px-6 sm:px-8">
            <div className="p-1 bg-surface-container-low rounded-xl flex items-center gap-1 border border-outline/30">
              <button
                type="button"
                onClick={() => handleTabChange('student')}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedTab === 'student'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('faculty')}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedTab === 'faculty'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <BadgePercent className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedTab === 'admin'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-4 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-error-container/40 border border-error/20 rounded-xl flex items-start gap-2.5 text-xs text-error">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            <Input
              label="College Email or Identifier"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@demo.local"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              helperText={
                selectedTab === 'student'
                  ? 'Use student@demo.local or official TGPCET email'
                  : selectedTab === 'faculty'
                  ? 'Use faculty@demo.local or faculty email'
                  : 'Use admin@demo.local or admin email'
              }
            />

            <div className="space-y-1.5">
              <Input
                label="Institutional Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-on-surface-variant hover:text-on-surface focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
            </div>

            {/* Session notice */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-on-surface">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary-container focus:ring-0 accent-primary-container"
                />
                <span>Remember session</span>
              </label>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-tertiary font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                MFA Verified
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign in as {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center font-mono text-[11px] text-white/80 drop-shadow-sm">
          TGPCET Campus 360 · Autonomous Academic Portal
        </p>
      </div>
    </div>
  );
};
