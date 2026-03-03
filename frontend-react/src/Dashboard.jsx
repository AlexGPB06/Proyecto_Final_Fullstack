import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Css/styles.css';

const API_URL = 'http://localhost:3000/api';

function Dashboard() {
  const navigate = useNavigate();
  // Estado para controlar qué sección está visible (por defecto canciones)
  const [activeSection, setActiveSection] = useState('canciones');
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  
  // Estados para los formularios
  const [newItem, setNewItem] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  // Configuración de Axios con el Token
  const token = localStorage.getItem('token');
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  // Verificar autenticación y cargar datos al cambiar de sección
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    setCurrentUser(localStorage.getItem('currentUser')?.toUpperCase() || '');
    cargarDatos();
  }, [activeSection, navigate, token]);

  const cargarDatos = async () => {
    try {
      const endpoint = activeSection === 'usuarios' ? '/fans' : `/${activeSection}`;
      const res = await authAxios.get(endpoint);
      setData(res.data);
    } catch (error) {
      console.error("Error cargando datos", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // --- MANEJADORES DE ACCIONES ---
  const handleNewItemChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleEditItemChange = (e) => {
    setEditingItem({ ...editingItem, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeSection === 'usuarios' ? '/fans' : `/${activeSection}`;
      await authAxios.post(endpoint, newItem);
      setNewItem({});
      cargarDatos();
      alert('⚡ AGREGADO CON ÉXITO');
    } catch (error) {
      alert('Error al agregar el registro');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ELIMINAR ESTE REGISTRO?')) return;
    try {
      const endpoint = activeSection === 'usuarios' ? 'fans' : activeSection;
      await authAxios.delete(`/${endpoint}/${id}`);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      let url = `/${activeSection}/${editingItem.id}`;
      if (activeSection === 'usuarios') url = `/fans/${editingItem.id}`;
      if (activeSection === 'tareas') url = `/tareas/editar/${editingItem.id}`;

      await authAxios.put(url, editingItem);
      setEditingItem(null);
      cargarDatos();
      alert('💾 CAMBIOS GUARDADOS');
    } catch (error) {
      alert('Error al editar');
    }
  };

  const toggleTarea = async (tarea) => {
    try {
      await authAxios.put(`/tareas/${tarea.id}`, { completada: !tarea.completada });
      cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  // --- RENDERIZADO DINÁMICO DE INPUTS ---
  // Esto nos permite usar el mismo formulario HTML para todas las secciones
  const renderInputs = (item, handleChange) => {
    if (activeSection === 'canciones') return (
      <>
        <input type="text" name="titulo" placeholder="Título" className="form-input" value={item.titulo || ''} onChange={handleChange} required />
        <input type="text" name="artista" placeholder="Artista" className="form-input" value={item.artista || ''} onChange={handleChange} required />
        <input type="text" name="genero" placeholder="Género" className="form-input" value={item.genero || ''} onChange={handleChange} />
      </>
    );
    if (activeSection === 'usuarios') return (
      <>
        <input type="text" name="nombre" placeholder="Nombre" className="form-input" value={item.nombre || ''} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" className="form-input" value={item.email || ''} onChange={handleChange} />
        <input type="text" name="pais" placeholder="País" className="form-input" value={item.pais || ''} onChange={handleChange} />
      </>
    );
    if (activeSection === 'tareas') return (
      <>
        <input type="text" name="titulo" placeholder="Título" className="form-input" value={item.titulo || ''} onChange={handleChange} required />
        <input type="text" name="descripcion" placeholder="Descripción" className="form-input" value={item.descripcion || ''} onChange={handleChange} />
        <select name="prioridad" className="form-input" value={item.prioridad || 'baja'} onChange={handleChange}>
          <option value="baja">🟢 COMPLETADO</option>
          <option value="media">🟡 A MEDIAS</option>
          <option value="alta">🔴 SIN ESCUCHAR</option>
        </select>
      </>
    );
    if (activeSection === 'eventos') return (
      <>
        <input type="text" name="nombre" placeholder="Evento" className="form-input" value={item.nombre || ''} onChange={handleChange} required />
        <input type="date" name="fecha" className="form-input" value={item.fecha?.split('T')[0] || ''} onChange={handleChange} required />
        <input type="text" name="lugar" placeholder="Lugar" className="form-input" value={item.lugar || ''} onChange={handleChange} />
      </>
    );
  };

  // Textos dinámicos según la sección activa
  const titulos = {
    canciones: { header: '🎵 CANCIONES FAVORITAS', sub: 'AGREGAR NUEVA CANCIÓN' },
    usuarios: { header: '👥 FANS / COMUNIDAD', sub: 'REGISTRAR NUEVO FAN' },
    tareas: { header: 'ALBUMES COMPLETADOS', sub: 'ALBUMES COMPLETADAS' },
    eventos: { header: '📅 EVENTOS / CONCIERTOS', sub: 'PUBLICAR NUEVO EVENTO' }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="/img/PDG.jpeg" alt="PDG" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #ff0000' }} />
            <h1 className="navbar-title">PALOMAS DEL GOBIERNO</h1>
          </div>
          <div className="navbar-user">
            <span id="userDisplay">👤 {currentUser}</span>
            <button id="logoutBtn" className="btn-logout" onClick={handleLogout}>SALIR</button>
          </div>
        </div>
      </nav>

      <div className="main-container">
        <aside className="sidebar">
          <div className="sidebar-menu">
            <button className={`menu-btn ${activeSection === 'canciones' ? 'active' : ''}`} onClick={() => setActiveSection('canciones')}>🎵 CANCIONES</button>
            <button className={`menu-btn ${activeSection === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveSection('usuarios')}>👥 FANS</button>
            <button className={`menu-btn ${activeSection === 'tareas' ? 'active' : ''}`} onClick={() => setActiveSection('tareas')}>ALBUMES</button>
            <button className={`menu-btn ${activeSection === 'eventos' ? 'active' : ''}`} onClick={() => setActiveSection('eventos')}>📅 EVENTOS</button>
          </div>
        </aside>

        <main className="content">
          {/* SECCIÓN DINÁMICA: Reemplaza los 4 bloques del HTML manteniendo las clases exactas */}
          <section className="section active">
            <div className="section-header">
              <h2>{titulos[activeSection].header}</h2>
            </div>
            
            <div className="form-section">
              <h3>{titulos[activeSection].sub}</h3>
              {/* Cambié el div a un form para poder usar el required de HTML5 correctamente */}
              <form onSubmit={handleAdd} className="form-group-row">
                {renderInputs(newItem, handleNewItemChange)}
                <button type="submit" className="btn-add">⚡ AGREGAR</button>
              </form>
            </div>

            <div className="items-container">
              {data.length === 0 ? (
                <p className="empty-message">No hay registros aún.</p>
              ) : (
                data.map((item) => (
                  <div key={item.id} className={`item-card ${activeSection === 'tareas' && item.completada ? 'completada' : ''} ${activeSection === 'usuarios' ? 'usuario-card' : activeSection.slice(0, -1) + '-card'}`}>
                    <div className="item-header">
                      <h3>
                        {activeSection === 'tareas' && (
                          <input type="checkbox" checked={!!item.completada} onChange={() => toggleTarea(item)} style={{marginRight: '10px'}} />
                        )}
                        {item.titulo || item.nombre}
                      </h3>
                      <div>
                        <button className="btn-edit" onClick={() => setEditingItem(item)}>✏️</button>
                        <button className="btn-delete" onClick={() => handleDelete(item.id)}>🗑️</button>
                      </div>
                    </div>
                    {/* Detalles dinámicos según el tipo de tarjeta */}
                    {activeSection === 'canciones' && <><p><strong>ARTISTA:</strong> {item.artista}</p><p><strong>GÉNERO:</strong> {item.genero}</p></>}
                    {activeSection === 'usuarios' && <><p><strong>EMAIL:</strong> {item.email}</p><p><strong>PAÍS:</strong> {item.pais}</p></>}
                    {activeSection === 'tareas' && <div className="tarea-footer"><p>{item.descripcion}</p><span className={`prioridad-${item.prioridad}`}>{item.prioridad?.toUpperCase()}</span></div>}
                    {activeSection === 'eventos' && <><p><strong>FECHA:</strong> {new Date(item.fecha).toLocaleDateString()}</p><p><strong>LUGAR:</strong> {item.lugar}</p></>}
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingItem && (
        <div id="modalEdicion" className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ MODIFICAR REGISTRO</h2>
              <span className="close-btn" onClick={() => setEditingItem(null)}>&times;</span>
            </div>
            <form id="formEdicion" onSubmit={handleEdit}>
              <div id="modalInputs" className="form-group-column">
                {renderInputs(editingItem, handleEditItemChange)}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setEditingItem(null)}>CANCELAR</button>
                <button type="submit" className="btn-save">💾 GUARDAR CAMBIOS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;