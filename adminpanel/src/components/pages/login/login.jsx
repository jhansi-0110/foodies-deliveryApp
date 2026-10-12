import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { login, registerPartner, forgotPasswordApi, resetPasswordApi } from '../../../services/authService';

const Login = ({ onLoginSuccess }) => {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (view === 'register') {
        const data = await registerPartner(name, email, password, phone);
        toast.success(`Account created. Welcome, ${data.name}!`);
        if (onLoginSuccess) {
          onLoginSuccess(data);
        }
      } else if (view === 'login') {
        const data = await login(email, password);
        toast.success(`Welcome back, ${data.name}!`);
        if (onLoginSuccess) {
          onLoginSuccess(data);
        }
      } else if (view === 'forgot') {
        await forgotPasswordApi(email);
        toast.success('Reset code sent to your email.');
        setView('reset');
      } else if (view === 'reset') {
        if (newPassword.length < 6) {
          toast.error('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error('Passwords do not match.');
          setLoading(false);
          return;
        }
        await resetPasswordApi(email, otp, newPassword);
        toast.success('Password updated successfully. You can now sign in.');
        setView('login');
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '85vh' }}>
      <div className="card border rounded-3 p-4 p-md-5 w-100" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <div
            className="rounded d-inline-flex align-items-center justify-content-center bg-dark text-white fw-bold mb-3"
            style={{ width: 36, height: 36, fontSize: '1rem' }}
          >
            F
          </div>
          <h4 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.02em' }}>Foodies Portal</h4>
          <p className="text-muted small mt-1">
            {view === 'forgot' || view === 'reset' ? 'Password Recovery' : 'Sign in to console or onboard as store partner'}
          </p>
        </div>

        {/* Minimal Segmented Control */}
        {(view === 'login' || view === 'register') && (
          <div className="d-flex p-1 bg-light rounded-2 border mb-4">
            <button
              type="button"
              className={`btn btn-sm flex-fill ${view === 'login' ? 'btn-dark' : 'btn-light text-muted border-0 bg-transparent'}`}
              onClick={() => setView('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`btn btn-sm flex-fill ${view === 'register' ? 'btn-dark' : 'btn-light text-muted border-0 bg-transparent'}`}
              onClick={() => setView('register')}
            >
              Register Partner
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {view === 'register' && (
            <>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {(view === 'login' || view === 'register' || view === 'forgot') && (
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {(view === 'login' || view === 'register') && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-muted text-uppercase mb-0" style={{ fontSize: '0.7rem' }}>
                  Password
                </label>
                {view === 'login' && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setView('forgot')}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {view === 'reset' && (
            <>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                  6-Digit OTP / Verification Code
                </label>
                <input
                  type="text"
                  className="form-control text-center fw-bold"
                  style={{ letterSpacing: '4px' }}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-dark w-100 py-2 fw-medium mt-2"
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : view === 'register'
              ? 'Create Partner Account'
              : view === 'forgot'
              ? 'Send Reset Code via SMTP'
              : view === 'reset'
              ? 'Update Password'
              : 'Sign In'}
          </button>

          {(view === 'forgot' || view === 'reset') && (
            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none text-muted"
                onClick={() => setView('login')}
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </form>

        {view === 'login' && (
          <div className="mt-4 pt-3 border-top text-center text-muted" style={{ fontSize: '0.75rem' }}>
            <span>Default admin: </span>
            <code className="text-dark">admin@foodies.com / admin123</code>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
