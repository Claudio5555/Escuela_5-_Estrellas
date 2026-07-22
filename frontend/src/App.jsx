import React, { useState } from 'react';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <header style={{
        padding: '16px 32px',
        background: 'rgba(15, 23, 42, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>⭐️</span>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ffffff', letterSpacing: '-0.5px' }}>
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
              fontWeight: 600
            }}
          >
            Cerrar Sesión
          </button>
        )}
      </header>

      {/* Main Content Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        padding: '32px 16px'
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
          <div className="glass-card animate-fade-in" style={{ padding: '40px', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              ¡Sesión Iniciada Correctamente!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              Has accedido a la plataforma principal de la Escuela 5 Estrellas. El token JWT ha sido guardado exitosamente en tu navegador.
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
