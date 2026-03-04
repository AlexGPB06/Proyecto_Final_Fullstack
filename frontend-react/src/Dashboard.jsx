import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importación de todos tus componentes
import Inicio from './Inicio'; // <-- NUEVO: Importamos la pantalla principal
import Canciones from './Canciones';
import Foros from './Foros';
import Sugerencias from './Sugerencias';
import Albumes from './Albumes';
import Eventos from './Eventos';
import Perfil from './Perfil';
import Fans from './Fans';
import AvisosAdmin from './AvisosAdmin';

import './Css/styles.css';

function Dashboard() {
  const navigate = useNavigate();
  
  // Estados de navegación (Ahora inicia en 'inicio' por defecto)
  const [activeSection, setActiveSection] = useState('inicio');
  const [perfilAVisualizar, setPerfilAVisualizar] = useState(null); 
  
  // Estados para notificaciones
  const [notificaciones, setNotificaciones] = useState([]); 
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  // Estados del usuario
  const [currentUser, setCurrentUser] = useState('');
  const [userRol, setUserRol] = useState('');

  const token = localStorage.getItem('token');
  const authAxios = axios.create({ baseURL: 'http://localhost:3000/api', headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    setCurrentUser(localStorage.getItem('currentUser')?.toUpperCase() || '');
    setUserRol(localStorage.getItem('userRol') || 'fan');

    // Función que trae las notificaciones (máximo 10 desde el backend)
    const revisarNotificaciones = async () => {
        try {
            const res = await authAxios.get('/notificaciones');
            setNotificaciones(res.data);
        } catch (error) { console.error("Error al cargar notificaciones"); }
    };
    
    revisarNotificaciones();
    // Revisa si hay algo nuevo cada 5 segundos
    const intervalo = setInterval(revisarNotificaciones, 5000);
    return () => clearInterval(intervalo);
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Función para navegar al perfil de cualquier usuario
  const irAPerfil = (username) => {
    setPerfilAVisualizar(username);
    setActiveSection('perfil');
  };

  // Función que procesa el clic en una notificación
  const procesarNotificacion = async (notif) => {
      // 1. MAGIA VISUAL: Lo quitamos de la lista AL INSTANTE
      setNotificaciones(prev => prev.filter(n => n.id !== notif.id));
      setMostrarNotificaciones(false); // Cerramos el menú
      
      // 2. Le avisamos a la base de datos en el fondo y navegamos a la pantalla correcta
      if (notif.tipo === 'mensaje') {
          try { await authAxios.put(`/mensajes/marcar_leidos/${notif.remitente_id}`); } catch(e){}
          setActiveSection('fans'); // Lo mandamos a la sección de chat
      } else {
          try { await authAxios.put(`/notificaciones/${notif.id}/leido`); } catch(e){}
          
          if (notif.tipo === 'seguidor') {
              irAPerfil(notif.remitente_username); // Lo mandamos al perfil del nuevo fan
          } else if (notif.tipo === 'aviso') {
              alert(`📢 AVISO OFICIAL DE @${notif.remitente_username}:\n\n${notif.mensaje}`);
          }
      }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="/img/PDG.jpeg" alt="Logo PDG" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #ff0000' }} />
            <h1 className="navbar-title">PALOMAS DEL GOBIERNO</h1>
          </div>
          
          <div className="navbar-user" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            {/* 🔔 ICONO DE CAMPANITA CON MENÚ DESPLEGABLE */}
            <div style={{ position: 'relative' }}>
                <div style={{ cursor: 'pointer' }} onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}>
                    <span style={{ fontSize: '1.5em' }}>🔔</span>
                    {/* El globito rojo que muestra la cantidad de notificaciones */}
                    {notificaciones.length > 0 && (
                        <span style={{ position: 'absolute', top: '-5px', right: '-10px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7em', fontWeight: 'bold' }}>
                            {notificaciones.length}
                        </span>
                    )}
                </div>

                {/* CAJA DESPLEGABLE DE NOTIFICACIONES */}
                {mostrarNotificaciones && (
                    <div style={{ position: 'absolute', top: '40px', right: '-10px', width: '320px', background: '#222', border: '1px solid #444', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.8)', zIndex: 9999, overflow: 'hidden' }}>
                        <div style={{ padding: '10px 15px', background: '#111', borderBottom: '1px solid #333', fontWeight: 'bold', color: 'var(--highlight-color)' }}>
                            Tus Notificaciones
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {notificaciones.length === 0 ? (
                                <p style={{ padding: '15px', textAlign: 'center', margin: 0, color: '#888', fontSize: '0.9em' }}>No tienes notificaciones nuevas.</p>
                            ) : (
                                notificaciones.map(n => (
                                    <div key={n.id} onClick={() => procesarNotificacion(n)} style={{ padding: '12px 15px', borderBottom: '1px solid #333', cursor: 'pointer', transition: 'background 0.2s', background: '#1a1a1a', display: 'flex', gap: '10px', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.background = '#333'} onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>
                                        <div style={{ fontSize: '1.5em' }}>
                                            {n.tipo === 'mensaje' ? '💬' : n.tipo === 'seguidor' ? '👤' : '📢'}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.9em', color: '#fff', lineHeight: '1.3' }}>{n.mensaje}</p>
                                            <span style={{ fontSize: '0.7em', color: '#888' }}>{new Date(n.fecha_creacion).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <span id="userDisplay">👤 {currentUser} <small>({userRol})</small></span>
            <button id="logoutBtn" className="btn-logout" onClick={handleLogout}>SALIR</button>
          </div>
        </div>
      </nav>

      <div className="main-container">
        {/* MENÚ LATERAL */}
        <aside className="sidebar">
          <div className="sidebar-menu">
            {/* NUEVO BOTÓN DE INICIO HASTA ARRIBA */}
            <button className={`menu-btn ${activeSection === 'inicio' ? 'active' : ''}`} onClick={() => setActiveSection('inicio')}>🏠 INICIO</button>
            
            <button className={`menu-btn ${activeSection === 'canciones' ? 'active' : ''}`} onClick={() => setActiveSection('canciones')}>🎵 CANCIONES</button>
            <button className={`menu-btn ${activeSection === 'foros' ? 'active' : ''}`} onClick={() => setActiveSection('foros')}>🗣️ FOROS</button>
            <button className={`menu-btn ${activeSection === 'sugerencias' ? 'active' : ''}`} onClick={() => setActiveSection('sugerencias')}>💡 SUGERENCIAS</button>
            <button className={`menu-btn ${activeSection === 'fans' ? 'active' : ''}`} onClick={() => setActiveSection('fans')}>👥 CHAT / FANS</button>
            <button className={`menu-btn ${activeSection === 'tareas' ? 'active' : ''}`} onClick={() => setActiveSection('tareas')}>💿 ALBUMES</button>
            <button className={`menu-btn ${activeSection === 'eventos' ? 'active' : ''}`} onClick={() => setActiveSection('eventos')}>📅 EVENTOS</button>
            
            {/* SOLO EL ADMIN VE ESTE BOTÓN PARA ENVIAR AVISOS GLOBALES */}
            {userRol === 'admin' && (
                <button className={`menu-btn ${activeSection === 'avisos' ? 'active' : ''}`} onClick={() => setActiveSection('avisos')} style={{ color: 'var(--highlight-color)', fontWeight: 'bold', border: '1px dashed var(--highlight-color)' }}>
                    📢 AVISOS GLOBALES
                </button>
            )}
            
            {/* BOTÓN DEL PERFIL */}
            <button className={`menu-btn ${activeSection === 'perfil' && !perfilAVisualizar ? 'active' : ''}`} onClick={() => { setActiveSection('perfil'); setPerfilAVisualizar(null); }} style={{ borderTop: '1px solid #333', marginTop: '10px', paddingTop: '10px' }}>
              👤 MI PERFIL
            </button>
          </div>
        </aside>

        {/* PANTALLA PRINCIPAL */}
        <main className="content" onClick={() => setMostrarNotificaciones(false)}>
          {/* Aquí cargamos Inicio cuando sea la sección activa */}
          {activeSection === 'inicio' && <Inicio userRol={userRol} />}
          
          {/* Resto de los componentes */}
          {activeSection === 'canciones' && <Canciones userRol={userRol} irAPerfil={irAPerfil} />}
          {activeSection === 'foros' && <Foros userRol={userRol} irAPerfil={irAPerfil} />}
          {activeSection === 'sugerencias' && <Sugerencias userRol={userRol} irAPerfil={irAPerfil} />}
          {activeSection === 'fans' && <Fans irAPerfil={irAPerfil} />}
          {activeSection === 'tareas' && <Albumes userRol={userRol} irAPerfil={irAPerfil} />}
          {activeSection === 'eventos' && <Eventos userRol={userRol} />}
          {activeSection === 'perfil' && <Perfil targetUsername={perfilAVisualizar} irAPerfil={irAPerfil} />}
          {activeSection === 'avisos' && <AvisosAdmin />}
        </main>
      </div>
    </>
  );
}

export default Dashboard;