import { useState, useEffect } from 'react';
import axios from 'axios';
import ForoAprobado from './ForoAprobado';

const API_URL = 'http://localhost:3000/api';

function Foros({ userRol, irAPerfil }) {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ titulo: '', descripcion: '' }); 
  const [foroActivo, setForoActivo] = useState(null); 

  const token = localStorage.getItem('token');
  const authAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const res = await authAxios.get('/foros');
      setData(res.data);
    } catch (error) { console.error("Error cargando foros", error); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.titulo.trim() || !newItem.descripcion.trim()) { alert("Llena el título y la descripción."); return; }
    try {
      await authAxios.post('/foros', newItem);
      setNewItem({ titulo: '', descripcion: '' }); 
      cargarDatos();
      alert('🗣️ PROPUESTA ENVIADA. Un administrador la revisará.');
    } catch (error) { alert('Error al enviar propuesta.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ELIMINAR ESTE TEMA DEL FORO?')) return;
    try { await authAxios.delete(`/foros/${id}`); cargarDatos(); } catch (error) {}
  };

  const handleEstadoForo = async (id, estado) => {
    try { await authAxios.put(`/foros/${id}/estado`, { estado }); cargarDatos(); } catch (error) {}
  };

  if (foroActivo) {
      return <ForoAprobado foro={foroActivo} onBack={() => setForoActivo(null)} irAPerfil={irAPerfil} />;
  }

  return (
    <section className="animate-fade-in section active">
      <div className="section-header">
        <h2>🗣️ COMUNIDAD Y FOROS</h2>
      </div>

      {/* PANEL DE CREACIÓN DESTACADO */}
      <div className="form-section" style={{ background: 'linear-gradient(135deg, rgba(20,0,0,0.8), rgba(0,0,0,0.9))', border: '2px solid var(--highlight-color)', boxShadow: '0 0 20px rgba(255,0,0,0.1)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>🎙️ INICIAR UNA NUEVA DISCUSIÓN</h3>
        <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '0.9em' }}>Propón un tema. Los administradores lo aprobarán para mantener la comunidad libre de spam.</p>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Ej: ¿Qué opinan del solo de guitarra en la nueva canción?" className="form-input" value={newItem.titulo} onChange={(e) => setNewItem({ ...newItem, titulo: e.target.value })} required />
          <textarea placeholder="Escribe el contexto, tu opinión o de qué trata este hilo..." className="form-input" style={{ resize: 'vertical', minHeight: '80px' }} value={newItem.descripcion} onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })} required />
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>⚡ PROPONER TEMA</button>
        </form>
      </div>

      {/* LISTA DE FOROS (ESTILO HILOS) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
        {data.length === 0 ? <p className="empty-message">No hay temas en discusión aún.</p> : (
          data.map((item) => (
            <div key={item.id} className="item-card" style={{ flexDirection: 'row', padding: '20px', alignItems: 'center', gap: '20px', borderLeft: item.estado === 'aprobado' ? '6px solid #00e5ff' : '6px solid #555' }}>
              
              {/* Información del Hilo */}
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7em', fontWeight: 'bold', letterSpacing: '1px', background: item.estado === 'aprobado' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)', color: item.estado === 'aprobado' ? '#00e5ff' : item.estado === 'rechazado' ? '#ff3333' : '#ffcc00' }}>
                        {item.estado.toUpperCase()}
                    </span>
                    <span style={{ color: '#888', fontSize: '0.85em' }}>{new Date(item.fecha_creacion).toLocaleDateString()}</span>
                </div>
                
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4em', color: '#fff' }}>{item.titulo}</h3>
                <p style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '0.95em', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.descripcion}</p>
                
                <p style={{ margin: 0, fontSize: '0.9em', color: '#777' }}>
                    Iniciado por: <strong style={{ color: 'var(--highlight-color)', cursor: 'pointer' }} onClick={() => irAPerfil(item.autor)}>@{item.autor}</strong>
                </p>
              </div>

              {/* Controles y Acceso */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '150px' }}>
                {item.estado === 'aprobado' && (
                    <button className="btn-primary" style={{ width: '100%', padding: '10px', background: '#00e5ff', color: '#000', border: 'none' }} onClick={() => setForoActivo(item)}>
                        ENTRAR 💬
                    </button>
                )}
                
                {userRol === 'admin' && (
                    <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                        {item.estado === 'pendiente' && (
                            <>
                                <button onClick={() => handleEstadoForo(item.id, 'aprobado')} style={{ flex: 1, padding: '8px', background: '#4ade80', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>✔</button>
                                <button onClick={() => handleEstadoForo(item.id, 'rechazado')} style={{ flex: 1, padding: '8px', background: '#ff3333', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>✖</button>
                            </>
                        )}
                        <button onClick={() => handleDelete(item.id)} className="btn-delete" style={{ borderRadius: '4px', width: 'auto', flex: 1 }}>🗑️</button>
                    </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Foros;