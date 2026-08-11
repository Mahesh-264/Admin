import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api/axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password,
        role: 'admin',
      });

      if (!data?.accessToken) {
        throw new Error('Invalid authentication response from server.');
      }

      if (data.user?.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      localStorage.setItem('verdits_admin_token', data.accessToken);
      localStorage.setItem('verdits_admin_user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err) {
      console.error('Admin Login Error:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Failed to login as administrator.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 selection:bg-[#f1d15f] selection:text-zinc-950">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#f1d15f] to-[#d6a400] text-zinc-950 mb-4 shadow-[0_0_30px_rgba(241,209,95,0.2)]">
            <ShieldCheck size={36} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">VERDiTS</h1>
          <p className="text-sm font-semibold tracking-widest text-[#f1d15f] uppercase mt-1">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Admin Authentication</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Sign in with your verified administrator credentials to access the Lawyer Verification portal.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@verdits.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0d1117] border border-[#30363d] rounded-2xl text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#f1d15f] focus:ring-1 focus:ring-[#f1d15f]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0d1117] border border-[#30363d] rounded-2xl text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#f1d15f] focus:ring-1 focus:ring-[#f1d15f]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-[#f1d15f] hover:bg-[#d6a400] text-zinc-950 font-bold text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(241,209,95,0.25)] flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation active:scale-[0.99]"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#30363d] text-center text-xs text-zinc-500">
            <p>Protected System — Unauthorized Access Prohibited</p>
          </div>
        </div>
      </div>
    </div>
  );
}
