import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    isSupabaseConfigured
  } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await signInWithEmail(email, password);
      } else {
        const res = await signUpWithEmail(email, password, fullName);
        if (res?.user && !res?.session) {
          setSuccessMsg('Registrasi berhasil! Harap periksa email Anda untuk konfirmasi akun.');
        } else {
          setSuccessMsg('Akun berhasil dibuat dan otomatis masuk!');
          setTimeout(() => closeAuthModal(), 1500);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses permintaan Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal terhubung dengan Google OAuth.');
    }
  };

  return (
    <div
      className="win11-modal-overlay"
      onClick={(e) => {
        if (e.target.classList.contains('win11-modal-overlay')) {
          closeAuthModal();
        }
      }}
    >
      <div
        className="win11-modal-card auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header Modal */}
        <div className="win11-modal-header">
          <div className="win11-modal-title" id="auth-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #0284c7, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <User size={16} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
              {activeTab === 'login' ? 'Masuk ke Totools' : 'Buat Akun Totools'}
            </span>
          </div>
          <button
            type="button"
            className="win11-modal-close"
            onClick={closeAuthModal}
            aria-label="Tutup modal autentikasi"
            title="Tutup"
          >
            <X size={15} />
          </button>
        </div>

        {/* Notice jika Supabase belum dikonfigurasi */}
        {!isSupabaseConfigured && (
          <div style={{ margin: '16px 20px 0', padding: '12px 14px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Kunci Supabase Belum Diisi</strong>
              <div style={{ fontSize: 12, marginTop: 2 }}>
                Masukkan <code>VITE_SUPABASE_URL</code> & <code>VITE_SUPABASE_ANON_KEY</code> di file <code>.env</code> Anda untuk mengaktifkan Auth & Cloud DB.
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="auth-modal-tabs" role="tablist" aria-label="Opsi Masuk atau Daftar">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <LogIn size={15} />
            <span>Masuk Akun</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <UserPlus size={15} />
            <span>Daftar Baru</span>
          </button>
        </div>

        {/* Body Modal Form */}
        <form onSubmit={handleSubmit} className="auth-modal-body" method="post" action="#">
          {errorMsg && (
            <div className="auth-alert alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert alert-success" role="status">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="auth-field-group">
              <label htmlFor="auth-fullname">Nama Lengkap</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  id="auth-fullname"
                  name="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field-group">
            <label htmlFor="auth-email">Alamat Email</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete={activeTab === 'login' ? 'username' : 'email'}
                required
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label htmlFor="auth-password">Kata Sandi</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                style={{
                  position: 'absolute',
                  right: 10,
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || !isSupabaseConfigured}
          >
            {loading
              ? 'Memproses...'
              : activeTab === 'login'
              ? 'Masuk Seketika'
              : 'Daftar Akun'}
          </button>

          <div className="auth-divider">
            <span>atau masuk dengan</span>
          </div>

          {/* Social Auth (Google) */}
          <button
            type="button"
            className="auth-social-btn"
            onClick={handleGoogleAuth}
            disabled={loading || !isSupabaseConfigured}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>
        </form>
      </div>
    </div>
  );
};
