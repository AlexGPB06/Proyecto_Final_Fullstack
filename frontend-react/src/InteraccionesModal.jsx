import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function InteraccionesModal({ item, tipoEntidad, onClose, irAPerfil }) {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [calificacion, setCalificacion] = useState({ promedio: 0, total: 0 });
    const [inputCalificacion, setInputCalificacion] = useState('');
    const [miVoto, setMiVoto] = useState(null); 
    const [editandoId, setEditandoId] = useState(null);
    const [textoEditado, setTextoEditado] = useState('');

    const currentUser = localStorage.getItem('currentUser')?.toUpperCase() || '';
    const userRol = localStorage.getItem('userRol') || 'fan';
    const token = localStorage.getItem('token');

    const authAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

    useEffect(() => {
        if (item && item.id) {
            cargarComentarios();
            if (tipoEntidad !== 'foro') {
                cargarCalificacion();
                cargarMiVoto();
            }
        }
    }, [item, tipoEntidad]);

    const cargarComentarios = async () => {
        try {
            const res = await authAxios.get(`/comentarios/${tipoEntidad}/${item.id}?t=${new Date().getTime()}`);
            setComentarios(res.data);
        } catch (error) { console.error("Error al cargar comentarios", error); }
    };

    const cargarCalificacion = async () => {
        try {
            const res = await authAxios.get(`/calificaciones/${tipoEntidad}/${item.id}?t=${new Date().getTime()}`);
            setCalificacion({ promedio: parseFloat(res.data.promedio || 0).toFixed(1), total: res.data.total });
        } catch (error) { console.error("Error al cargar calificación"); }
    };

    const cargarMiVoto = async () => {
        try {
            const res = await authAxios.get(`/calificaciones/mivoto/${tipoEntidad}/${item.id}?t=${new Date().getTime()}`);
            if (res.data.miVoto) { setMiVoto(res.data.miVoto); setInputCalificacion(res.data.miVoto); }
        } catch (error) { console.error("Error al cargar mi voto"); }
    };

    const handleCalificar = async (e) => {
        e.preventDefault();
        try {
            const valorNumerico = parseFloat(inputCalificacion);
            if (isNaN(valorNumerico)) throw new Error("Ingresa un número.");
            const valoresPermitidos = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
            if (!valoresPermitidos.includes(valorNumerico)) throw new Error("Solo valores exactos (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5).");

            await authAxios.post('/calificaciones', { entidad_id: item.id, tipo_entidad: tipoEntidad, puntuacion: valorNumerico });
            cargarCalificacion(); 
            cargarMiVoto();       
            alert(`¡Calificación de ${valorNumerico} guardada!`);
        } catch (error) { alert(error.message || 'Error al calificar'); }
    };

    const handleComentar = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        try {
            await authAxios.post('/comentarios', { entidad_id: item.id, tipo_entidad: tipoEntidad, comentario: nuevoComentario });
            setNuevoComentario('');
            cargarComentarios();
        } catch (error) { alert('Error al comentar'); }
    };

    const handleBorrarComentario = async (id) => {
        if (!window.confirm('¿Borrar este comentario permanentemente?')) return;
        try { await authAxios.delete(`/comentarios/${id}`); cargarComentarios(); } 
        catch (error) { alert('Error al borrar'); }
    };

    const iniciarEdicion = (c) => { setEditandoId(c.id); setTextoEditado(c.comentario); };

    const handleGuardarEdicion = async (id) => {
        if (!textoEditado.trim()) return;
        try { await authAxios.put(`/comentarios/${id}`, { comentario: textoEditado }); setEditandoId(null); cargarComentarios(); } 
        catch (error) { alert('Error al editar'); }
    };

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                <div className="modal-header-custom">
                    <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5em' }}>💬 {item.titulo || item.nombre}</h2>
                    <span className="close-btn" onClick={onClose}>&times;</span>
                </div>

                {tipoEntidad !== 'foro' && (
                    <div style={{ textAlign: 'center', background: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #333', marginBottom: '15px' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: 'gold' }}>⭐ Promedio: {calificacion.promedio} <small style={{color:'#888', fontSize: '0.7em'}}>({calificacion.total} votos)</small></h3>
                        {miVoto && <p style={{ color: '#4ade80', margin: '0 0 10px 0', fontSize: '0.9em', fontWeight: 'bold' }}>Tu voto actual: {miVoto} ⭐</p>}

                        {/* QUITAMOS EL STYLE INLINE QUE ROMPÍA EL MÓVIL */}
                        <form className="modal-form-inline" onSubmit={handleCalificar}>
                            <input type="number" step="0.5" placeholder="Ej: 4.5" className="form-input" value={inputCalificacion} onChange={(e) => setInputCalificacion(e.target.value)} required />
                            <button type="submit" className="btn-secondary">
                                {miVoto ? 'ACTUALIZAR' : 'VOTAR'}
                            </button>
                        </form>
                    </div>
                )}

                <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '10px', marginBottom: '15px' }}>
                    {comentarios.length === 0 && <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Aún no hay opiniones. ¡Sé el primero!</p>}
                    {comentarios.map(c => {
                        const esMiComentario = c.username.toUpperCase() === currentUser;
                        const puedeBorrar = esMiComentario || userRol === 'admin';

                        return (
                            <div key={c.id} style={{ background: '#1a1a1a', padding: '15px', borderRadius: '6px', marginBottom: '10px', borderLeft: '4px solid #444' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div>
                                        <strong 
                                            style={{ color: esMiComentario ? '#4ade80' : 'var(--highlight-color)', cursor: 'pointer', textDecoration: 'underline' }} 
                                            onClick={() => { if(irAPerfil) irAPerfil(c.username); onClose(); }}
                                        >
                                            {c.username} {esMiComentario && '(Tú)'}
                                        </strong>
                                        <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>{new Date(c.fecha_creacion).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {esMiComentario && editandoId !== c.id && <button onClick={() => iniciarEdicion(c)} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em' }}>✏️</button>}
                                        {puedeBorrar && <button onClick={() => handleBorrarComentario(c.id)} className="btn-delete" style={{ width: '30px', height: '30px', fontSize: '1em' }}>🗑️</button>}
                                    </div>
                                </div>

                                {editandoId === c.id ? (
                                    <form className="modal-form-inline" onSubmit={(e) => { e.preventDefault(); handleGuardarEdicion(c.id); }}>
                                        <input type="text" className="form-input" value={textoEditado} onChange={(e) => setTextoEditado(e.target.value)} />
                                        <button type="submit" className="btn-primary">✔</button>
                                        <button type="button" onClick={() => setEditandoId(null)} className="btn-secondary">✖</button>
                                    </form>
                                ) : (
                                    <p style={{ margin: 0, color: '#ccc', lineHeight: '1.4' }}>{c.comentario}</p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* QUITAMOS EL STYLE INLINE QUE ROMPÍA EL MÓVIL */}
                <form className="modal-form-inline" onSubmit={handleComentar} style={{ borderTop: '2px solid #333', paddingTop: '15px' }}>
                    <input type="text" className="form-input" placeholder="Escribe tu opinión aquí..." value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} required />
                    <button type="submit" className="btn-primary">PUBLICAR</button>
                </form>

            </div>
        </div>
    );
}

export default InteraccionesModal;