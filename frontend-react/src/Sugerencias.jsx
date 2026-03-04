import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Sugerencias({ userRol }) {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ titulo: '', descripcion: '', imagen_url: '' });
  const [editingItem, setEditingItem] = useState(null);

  const currentUser = localStorage.getItem('currentUser')?.toUpperCase() || '';
  const token = localStorage.getItem('token');
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await authAxios.get('/sugerencias');
      setData(res.data);
    } catch (error) { console.error("Error cargando sugerencias", error); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await authAxios.post('/sugerencias', newItem);
      setNewItem({ titulo: '', descripcion: '', imagen_url: '' });
      cargarDatos();
      alert('💡 Sugerencia publicada con éxito');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al agregar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ELIMINAR ESTA SUGERENCIA?')) return;
    try {
      await authAxios.delete(`/sugerencias/${id}`);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar: ' + (error.response?.data?.message || 'Permisos insuficientes'));
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await authAxios.put(`/sugerencias/${editingItem.id}`, editingItem);
      setEditingItem(null);
      cargarDatos();
      alert('💾 CAMBIOS GUARDADOS');
    } catch (error) {
      alert('Error al editar: ' + (error.response?.data?.message || 'Permisos insuficientes'));
    }
  };

  return (
    <section className="section active">
      <div className="section-header">
        <h2>💡 SUGERENCIAS DE FANS</h2>
      </div>

      {/* SOLO LOS FANS PUEDEN VER EL FORMULARIO PARA CREAR */}
      {userRol === 'fan' && (
        <div className="form-section">
          <h3>PROPONER IDEA MUSICAL</h3>
          <form onSubmit={handleAdd} className="form-group-column">
            <input type="text" placeholder="Título de tu idea" className="form-input" value={newItem.titulo} onChange={(e) => setNewItem({...newItem, titulo: e.target.value})} required />
            <textarea placeholder="Describe de qué trataría la canción..." className="form-input" style={{ resize: 'vertical', minHeight: '80px' }} value={newItem.descripcion} onChange={(e) => setNewItem({...newItem, descripcion: e.target.value})} required />
            <input type="text" placeholder="URL de la imagen (Opcional)" className="form-input" value={newItem.imagen_url} onChange={(e) => setNewItem({...newItem, imagen_url: e.target.value})} />
            <button type="submit" className="btn-add" style={{ alignSelf: 'flex-start' }}>⚡ PUBLICAR IDEA</button>
          </form>
        </div>
      )}

      {/* LISTA DE SUGERENCIAS */}
      <div className="items-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {data.length === 0 ? <p className="empty-message">No hay ideas aún. ¡Sé el primero!</p> : (
          data.map((item) => {
            const esMiSugerencia = item.autor.toUpperCase() === currentUser;
            const puedeBorrar = esMiSugerencia || userRol === 'admin';

            return (
              <div key={item.id} className="item-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <img src={item.imagen_url} alt="Sugerencia" style={{ width: '100%', height: '200px', objectFit: 'cover', borderBottom: '2px solid var(--highlight-color)' }} />
                
                <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4em' }}>{item.titulo}</h3>
                    
                    {/* BOTONES DE ACCIÓN */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {esMiSugerencia && <button onClick={() => setEditingItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}>✏️</button>}
                      {puedeBorrar && <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}>🗑️</button>}
                    </div>
                  </div>
                  
                  <p style={{ color: '#ccc', fontStyle: 'italic', marginBottom: '15px', flexGrow: 1 }}>{item.descripcion}</p>
                  <p style={{ margin: 0, color: 'var(--highlight-color)', fontWeight: 'bold', fontSize: '0.9em' }}>Propuesto por: @{item.autor}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingItem && (
        <div className="modal" style={{ display: 'block', zIndex: 9999 }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ EDITAR IDEA</h2>
              <span className="close-btn" onClick={() => setEditingItem(null)}>&times;</span>
            </div>
            <form onSubmit={handleEdit} className="form-group-column">
              <input type="text" className="form-input" value={editingItem.titulo} onChange={(e) => setEditingItem({...editingItem, titulo: e.target.value})} required />
              <textarea className="form-input" style={{ resize: 'vertical', minHeight: '80px' }} value={editingItem.descripcion} onChange={(e) => setEditingItem({...editingItem, descripcion: e.target.value})} required />
              <input type="text" className="form-input" placeholder="URL de la imagen" value={editingItem.imagen_url} onChange={(e) => setEditingItem({...editingItem, imagen_url: e.target.value})} />
              
              <div className="modal-footer" style={{ marginTop: '15px' }}>
                <button type="button" className="btn-cancel" onClick={() => setEditingItem(null)}>CANCELAR</button>
                <button type="submit" className="btn-save">💾 GUARDAR CAMBIOS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Sugerencias;