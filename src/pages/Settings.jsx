import React, { useState } from 'react';
import { UserPlus, Shield, CheckCircle } from 'lucide-react';

const API_URL = 'https://pixivo-backend.onrender.com/api/auth';

const Settings = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const token = sessionStorage.getItem('auth_token');

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');

    try {
      const res = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg(`Employee Account Created! ID: ${formData.username}`);
      setFormData({ username: '', password: '' });
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Admin Control Panel</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your workspace and employee access.</p>

      <div className="card" style={{ maxWidth: '500px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <UserPlus size={20} color="var(--primary)" /> Add New Employee
        </h3>

        {err && <div style={{ background: '#fff2f2', color: '#ff3b30', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{err}</div>}
        {msg && <div style={{ background: '#e3f9e5', color: '#34c759', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> {msg}</div>}

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Jisko aap yaha ID password denge, vo Inward aur Production me data entry kar payega. Unhe OTP ki zaroorat nahi hogi.
        </p>

        <form onSubmit={handleCreateEmployee}>
          <div className="input-group">
            <label>Employee Login ID</label>
            <input type="text" className="input-field" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="e.g. rahul_entry" />
          </div>
          <div className="input-group">
            <label>Generate Password</label>
            <input type="text" className="input-field" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Secret Password" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Employee Access'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Settings;
