import React, { useState } from 'react';
import { Star, LogOut, CheckCircle2 } from 'lucide-react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';

export default function App() {
  const [view, setView] = useState('register'); // 'register' | 'login' | 'dashboard'
  const [userToken, setUserToken] = useState(localStorage.getItem('auth_token'));

  const handleLoginSuccess = () => {
    setUserToken(localStorage.getItem('auth_token'));
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUserToken(null);
    setView('login');
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header Bar */}
      <header style={{
        padding: '14px 28px',
        background: 'rgba(15, 23, 42, 0.85)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Star size={24} className="star-icon" />
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#ffffff', letterSpacing: '-0.5px' }}>
            ESCUELA <span style={{ color: 'var(--accent-gold)' }}>5 ESTRELLAS</span>
          </span>
        </div>

        {userToken && (
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem'
            }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        )}
      </header>

      {/* Main Content Container - Simétrico y centrado en la pantalla */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        padding: '16px',
        overflow: 'hidden'
      }}>
        {view === 'register' && (
          <RegisterForm onSwitchToLogin={() => setView('login')} />
        )}

        {view === 'login' && (
          <LoginForm
            onSwitchToRegister={() => setView('register')}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {view === 'dashboard' && (
          <div className="glass-card animate-fade-in" style={{ padding: '36px', maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={52} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              ¡Sesión Iniciada Correctamente!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6', fontSize: '0.9rem' }}>
              Has accedido a la plataforma principal de la Escuela 5 Estrellas. El token JWT ha sido almacenado de manera segura en tu sesión.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setView('register')} className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                Volver a Formulario de Registro
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
