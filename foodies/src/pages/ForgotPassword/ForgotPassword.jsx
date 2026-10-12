import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPasswordApi, verifyResetTokenApi, resetPasswordApi } from '../../components/service/AuthService';
import { IconMail, IconCheck, IconClock } from '../../components/common/Icons';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Query params support if user clicked direct email link: /reset-password?email=...&token=...
  const queryEmail = searchParams.get('email') || '';
  const queryToken = searchParams.get('token') || '';

  const [step, setStep] = useState(queryToken ? 2 : 1); // 1 = Request, 2 = Verify & Reset, 3 = Success
  const [email, setEmail] = useState(queryEmail);
  const [tokenOrOtp, setTokenOrOtp] = useState(queryToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (queryToken && queryEmail) {
      setStep(2);
      setEmail(queryEmail);
      setTokenOrOtp(queryToken);
    }
  }, [queryEmail, queryToken]);

  // Step 1: Request Reset Code via SMTP Email
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      toast.success('Reset code sent! Check your email inbox.');
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit New Password with OTP/Token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!tokenOrOtp.trim()) {
      toast.error('Please enter the 6-digit code or reset token.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi(email.trim(), tokenOrOtp.trim(), newPassword);
      toast.success('Password reset successfully!');
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border rounded-3 bg-white p-4 p-md-5">

            {/* Stage 1: Request Email */}
            {step === 1 && (
              <>
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light border p-3 mb-3">
                    <IconMail size={24} className="text-dark" />
                  </div>
                  <h4 className="fw-bold text-dark mb-1">Forgot Password</h4>
                  <p className="text-muted small mb-0">
                    Enter the email associated with your account and we will send a 6-digit verification code.
                  </p>
                </div>

                <form onSubmit={handleRequestReset}>
                  <div className="mb-3">
                    <label className="form-label small fw-medium text-dark">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100 py-2.5 fw-medium mb-3"
                    disabled={loading}
                  >
                    {loading ? "Sending Code via SMTP..." : "Send Verification Code"}
                  </button>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none small text-muted">
                      ← Back to Sign In
                    </Link>
                  </div>
                </form>
              </>
            )}

            {/* Stage 2: Enter OTP & New Password */}
            {step === 2 && (
              <>
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light border p-3 mb-3">
                    <IconClock size={24} className="text-dark" />
                  </div>
                  <h4 className="fw-bold text-dark mb-1">Set New Password</h4>
                  <p className="text-muted small mb-0">
                    We sent an email to <strong>{email}</strong>. Enter the 6-digit code and your new password.
                  </p>
                </div>

                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label className="form-label small fw-medium text-dark">Verification Code (OTP)</label>
                    <input
                      type="text"
                      className="form-control text-center fw-bold"
                      style={{ letterSpacing: '4px', fontSize: '1.1rem' }}
                      placeholder="123456"
                      maxLength={36}
                      value={tokenOrOtp}
                      onChange={(e) => setTokenOrOtp(e.target.value)}
                      required
                    />
                    <div className="form-text small text-muted">Check your inbox or spam folder (valid for 15m).</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-medium text-dark">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-medium text-dark">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100 py-2.5 fw-medium mb-3"
                    disabled={loading}
                  >
                    {loading ? "Updating Password..." : "Update Password"}
                  </button>

                  <div className="d-flex justify-content-between align-items-center small">
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-muted p-0 text-decoration-none"
                      onClick={() => setStep(1)}
                    >
                      ← Change Email
                    </button>
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-dark p-0 text-decoration-none fw-medium"
                      onClick={handleRequestReset}
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Stage 3: Success Confirmation */}
            {step === 3 && (
              <div className="text-center py-2">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light border p-3 mb-3 text-success">
                  <IconCheck size={28} />
                </div>
                <h4 className="fw-bold text-dark mb-2">Password Reset Complete</h4>
                <p className="text-muted small mb-4">
                  Your password has been successfully updated. You can now sign in using your new credentials.
                </p>
                <Link to="/login" className="btn btn-dark w-100 py-2.5 fw-medium">
                  Proceed to Sign In
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
