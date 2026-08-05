import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Star, LayoutDashboard, Users, School, GraduationCap, ClipboardCheck, BarChart3, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('auth_user');
  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch {}

  const rol = user?.rol || '';

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/');
  };

  const menuItems = [];

  // Dashboard - todos los roles
  menuItems.push({ to: '/dashboard', icon: LayoutDashboard, label: 'Panel Principal' });

  // Director: acceso total
  if (rol === 'Director') {
    menuItems.push({ to: '/usuarios', icon: Users, label: 'Usuarios' });
    menuItems.push({ to: '/salones', icon: School, label: 'Salones' });
    menuItems.push({ to: '/alumnos', icon: GraduationCap, label: 'Alumnos' });
    menuItems.push({ to: '/asistencia', icon: ClipboardCheck, label: 'Asistencia' });
    menuItems.push({ to: '/reportes', icon: BarChart3, label: 'Reportes' });
  }

  // Maestro: acceso parcial
  if (rol === 'Maestro') {
    menuItems.push({ to: '/asistencia', icon: ClipboardCheck, label: 'Asistencia' });
    menuItems.push({ to: '/reportes', icon: BarChart3, label: 'Reportes' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Star size={22} className="star-icon" />
          <span className="sidebar-title">
            ESCUELA <span className="sidebar-title-accent">5 ESTRELLAS</span>
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.nombre_usuario || 'Usuario'}</div>
          <div className="sidebar-user-role">{rol}</div>
        </div>
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}
