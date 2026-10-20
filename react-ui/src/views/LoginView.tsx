import React, { useState } from 'react';
import { Sparkles, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { frappeApi } from '../api/frappe';
import { UserSession } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('Administrator');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await frappeApi.login(username.trim(), password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Invalid username or password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to communicate with Frappe backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setUsername('Administrator');
    setPassword('admin');
    setErrorMessage(null);
  };

  return (
    <div
      style={{
        background: 'radial-gradient(ellipse at top, #0C1528 0%, #080D18 60%, #050810 100%)',
      }}
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 select-none font-sans text-[#E2E8F0] relative overflow-hidden"
    >
      {/* Subtle background atmospheric glow circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1E40AF]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#0284C7]/15 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Login Card */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(24px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(30, 64, 175, 0.15)',
        }}
        className="w-full max-w-md rounded-2xl border p-8 relative z-10 animate-fadeIn"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div
            style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #0284C7 100%)',
              boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.4)',
            }}
            className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4 text-white"
          >
            <Sparkles className="w-6 h-6 text-[#38BDF8]" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
              Nimble Vision
            </h1>
            <span className="font-label bg-[#38BDF8]/15 text-[#38BDF8] text-[11px] font-semibold px-2 py-0.5 rounded border border-[#38BDF8]/30">
              HR
            </span>
          </div>

          <p className="text-xs font-sans text-[#94A3B8] max-w-xs mx-auto">
            Enterprise Digital Curator — Sign in to access your Frappe HRMS workspace
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-[#FEF2F2]/10 border border-[#EF4444]/30 text-[#F87171] text-xs flex items-start gap-2.5 animate-scaleUp">
            <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-label font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Administrator"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
                className="w-full text-xs h-10 pl-10 pr-3 rounded-lg text-white placeholder-[#64748B] border focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/40 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-label font-bold text-[#94A3B8] uppercase tracking-wider">
                Password
              </label>
              <span className="text-[11px] font-sans text-[#38BDF8] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
                className="w-full text-xs h-10 pl-10 pr-10 rounded-lg text-white placeholder-[#64748B] border focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/40 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#64748B] hover:text-[#CBD5E1] transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-600 text-[#2563EB] focus:ring-0 focus:ring-offset-0 bg-transparent"
              />
              <span className="text-xs text-[#94A3B8]">Remember session</span>
            </label>

            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="text-[11px] text-[#94A3B8] hover:text-[#38BDF8] transition-colors"
            >
              Fill Default Admin
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
            }}
            className="w-full h-10 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 active:brightness-95 transition-all cursor-pointer disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span>Authenticating with Frappe...</span>
            ) : (
              <>
                <span>Sign In to HRMS</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8]" />
              </>
            )}
          </button>
        </form>

        {/* Backend Connectivity Status */}
        <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>Frappe Backend (Port 8000)</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Secure Cookie Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
