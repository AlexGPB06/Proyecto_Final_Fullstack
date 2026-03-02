import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Main.css';

const API_URL = 'http://localhost:3000/api';

function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('canciones');
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [newItem, setNewItem] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  const token = localStorage.getItem('token');
  const authAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    if (!token) navigate('/');
    setCurrentUser(localStorage.getItem('currentUser'));
    cargarDatos();
  }, [activeSection, navigate, token]);

  const cargarDatos = async () => {
    try {
      const res = await authAxios.get(`/${activeSection}`);
      setData(res.data);
    } catch (error) { console.error("Error cargando datos", error); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await authAxios.post(`/${activeSection}`, newItem);
      setNewItem({}); cargarDatos(); alert('Agregado con éxito');
    } catch (error) { alert('Error al agregar'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    try { await authAxios.delete(`/${activeSection}/${id}`); cargarDatos(); } catch (error) { alert('Error al eliminar'); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const url = activeSection === 'tareas' ? `/tareas/editar/${editingItem.id}` : `/${activeSection}/${editingItem.id}`;
      await authAxios.put(url, editingItem);
      setEditingItem(null); cargarDatos();
    } catch (error) { alert('Error al editar'); }
  };

  const toggleTarea = async (tarea) => {
    try { await authAxios.put(`/tareas/${tarea.id}`, { completada: !tarea.completada }); cargarDatos(); } catch (error) { console.error(error); }
  };

  const renderFormInputs = (item, setItem) => {
    const handleChange = (e) => setItem({ ...item, [e.target.name]: e.target.value });
    if (activeSection === 'canciones') return (
      <>
        <input className="form-input" placeholder="Título" name="titulo" value={item.titulo || ''} onChange={handleChange} required />
        <input className="form-input" placeholder="Artista" name="artista" value={item.artista || ''} onChange={handleChange} required />
        <input className="form-input" placeholder="Género" name="genero" value={item.genero || ''} onChange={handleChange} />
      </>
    );
    if (activeSection === 'fans') return (
      <>
        <input className="form-input" placeholder="Nombre" name="nombre" value={item.nombre || ''} onChange={handleChange} required />
        <input className="form-input" placeholder="Email" name="email" value={item.email || ''} onChange={handleChange} />
        <input className="form-input" placeholder="País" name="pais" value={item.pais || ''} onChange={handleChange} />
      </>
    );
    if (activeSection === 'tareas') return (
      <>
        <input className="form-input" placeholder="Título" name="titulo" value={item.titulo || ''} onChange={handleChange} required />
        <input className="form-input" placeholder="Descripción" name="descripcion" value={item.descripcion || ''} onChange={handleChange} />
        <select className="form-select" name="prioridad" value={item.prioridad || 'baja'} onChange={handleChange}>
          <option value="baja">BAJA</option><option value="media">MEDIA</option><option value="alta">ALTA</option>
        </select>
      </>
    );
    if (activeSection === 'eventos') return (
      <>
        <input className="form-input" placeholder="Nombre" name="nombre" value={item.nombre || ''} onChange={handleChange} required />
        <input type="date" className="form-input" name="fecha" value={item.fecha ? item.fecha.split('T')[0] : ''} onChange={handleChange} required />
        <input className="form-input" placeholder="Lugar" name="lugar" value={item.lugar || ''} onChange={handleChange} />
      </>
    );
  };

  return (
    <div className="main-wrapper">
      <nav className="navbar">
        <div className="navbar-title">GESTIÓN PROYECTO</div>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}><span>👤 {currentUser}</span><button className="btn-logout" onClick={handleLogout}>SALIR</button></div>
      </nav>
      <div className="main-container">
        <aside className="sidebar">
          <div className="sidebar-menu">
            {['canciones', 'fans', 'tareas', 'eventos'].map(sec => (
              <button key={sec} className={`menu-btn ${activeSection === sec ? 'active' : ''}`} onClick={() => { setActiveSection(sec); setNewItem({}); }}>{sec.toUpperCase()}</button>
            ))}
          </div>
        </aside>
        <main className="content">
          <div className="form-section">
            <h3>AGREGAR {activeSection.toUpperCase().slice(0, -1)}</h3>
            <form onSubmit={handleAdd} className="form-group-row">{renderFormInputs(newItem, setNewItem)}<button type="submit" className="btn-add">AGREGAR</button></form>
          </div>
          <div className="items-container">
            {data.map(item => (
              <div key={item.id} className={`item-card ${activeSection === 'tareas' && item.completada ? 'completada' : ''} ${activeSection.slice(0,-1)}-card`}>
                <div className="item-header">
                  <h3>{activeSection === 'tareas' && (<input type="checkbox" checked={!!item.completada} onChange={() => toggleTarea(item)} style={{marginRight: '10px'}} />)}{item.titulo || item.nombre}</h3>
                  <div><button className="btn-action" onClick={() => setEditingItem(item)}>✏️</button><button className="btn-action" onClick={() => handleDelete(item.id)}>🗑️</button></div>
                </div>
                {activeSection === 'canciones' && <p>{item.artista} - {item.genero}</p>}
                {activeSection === 'fans' && <p>{item.email} - {item.pais}</p>}
                {activeSection === 'tareas' && <p>{item.descripcion} <br/><small className={`prioridad-${item.prioridad}`}>{item.prioridad}</small></p>}
                {activeSection === 'eventos' && <p>{new Date(item.fecha).toLocaleDateString()} - {item.lugar}</p>}
              </div>
            ))}
          </div>
        </main>
      </div>
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>EDITAR</h2>
            <form onSubmit={handleEdit} style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px'}}>{renderFormInputs(editingItem, setEditingItem)}<div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}><button type="button" onClick={() => setEditingItem(null)}>CANCELAR</button><button type="submit" style={{background: 'var(--warning-color)'}}>GUARDAR</button></div></form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;