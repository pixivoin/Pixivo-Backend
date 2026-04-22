import React, { useState } from 'react';
import { Mail, Lock, Shield, User, Key, Building2 } from 'lucide-react';

const API_URL = 'https://pixivo-backend.onrender.com/api/auth';

const Auth = ({ onLogin }) => {
  const [view, setView] = useState('employee'); // 'employee', 'company', 'otp', 'register'
  const [formData, setFormData] = useState({ username: '', password: '', email: '', otp: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      sessionStorage.setItem('auth_token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [otpReceived, setOtpReceived] = useState('');

  const requestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Store OTP to auto-fill
      setOtpReceived(data.otp || '');
      setFormData(prev => ({ ...prev, otp: data.otp || '' }));
      setView('register');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          companyName: formData.companyName,
          username: formData.username,
          password: formData.password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage('Registration successful! Please login.');
      setView('employee');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '650px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-app)',
      overflow: 'hidden'
    }}>
      <div className="card shadow-lg" style={{ 
        width: '380px', 
        padding: '2rem',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        background: 'white'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Shield color="white" size={24} />
          </div>
          <h2>{view === 'employee' ? 'Welcome Back' : 'Company Setup'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            {view === 'employee' ? 'Login with your credentials' : 'Register your company workspace'}
          </p>
        </div>

        {error && <div style={{ background: '#fff2f2', color: '#ff3b30', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
        {message && <div style={{ background: '#e3f9e5', color: '#34c759', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{message}</div>}

        {/* Login Form */}
        {view === 'employee' && (
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>User ID</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" name="username" className="input-field" style={{ paddingLeft: '36px' }} required value={formData.username} onChange={handleInput} />
              </div>
            </div>
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="password" name="password" className="input-field" style={{ paddingLeft: '36px' }} required value={formData.password} onChange={handleInput} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>New company? </span>
              <a href="#" onClick={(e) => { e.preventDefault(); setView('company'); }} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Register Workspace</a>
            </div>
          </form>
        )}

        {/* Request OTP Form */}
        {view === 'company' && (
          <form onSubmit={requestOTP}>
            <div className="input-group">
              <label>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" name="email" className="input-field" style={{ paddingLeft: '36px' }} placeholder="admin@company.com" required value={formData.email} onChange={handleInput} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP Validation'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setView('employee'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Back to Login</a>
            </div>
          </form>
        )}

        {/* Verify OTP & Register Form */}
        {view === 'register' && (
          <form onSubmit={handleRegister}>
            
            {/* OTP Display Box */}
            {otpReceived && (
              <div style={{ 
                background: 'linear-gradient(135deg, #007aff15, #007aff08)', 
                border: '2px dashed #007aff', 
                borderRadius: '12px', 
                padding: '1.2rem', 
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  🔑 Your OTP Code
                </p>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 900, 
                  letterSpacing: '0.5rem', 
                  color: '#007aff',
                  fontFamily: 'monospace'
                }}>
                  {otpReceived}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Valid for 10 minutes · Auto-filled below
                </p>
              </div>
            )}

            <div className="input-group">
              <label>6-Digit OTP</label>
              <input type="text" name="otp" className="input-field" required value={formData.otp} onChange={handleInput} placeholder="123456" maxLength={6} style={{ fontSize: '1.2rem', letterSpacing: '0.3rem', textAlign: 'center', fontWeight: 700 }} />
            </div>
            <div className="input-group">
              <label>Company Name</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" name="companyName" className="input-field" style={{ paddingLeft: '36px' }} required value={formData.companyName} onChange={handleInput} />
              </div>
            </div>
            <div className="input-group">
              <label>Admin Username</label>
              <input type="text" name="username" className="input-field" required value={formData.username} onChange={handleInput} />
            </div>
            <div className="input-group">
              <label>Admin Password</label>
              <input type="password" name="password" className="input-field" required value={formData.password} onChange={handleInput} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Company Workspace'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setView('employee'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Cancel</a>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default Auth;
