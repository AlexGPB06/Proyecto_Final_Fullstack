import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function ForoAprobado({ foro, onBack, irAPerfil }) {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [recientesPrimero, setRecientesPrimero] = useState(false); 

    const token = localStorage.getItem('token');
    const authAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

    useEffect(() => { cargarComentarios(); }, []);

    const cargarComentarios = async () => {
        try { const res = await authAxios.get(`/comentarios/foro/${foro.id}`); setComentarios(res.data); } 
        catch (error) { console.error("Error al cargar", error); }
    };

    const handleComentar = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        try {
            await authAxios.post('/comentarios', { entidad_id: foro.id, tipo_entidad: 'foro', comentario: nuevoComentario });
            setNuevoComentario('');
            cargarComentarios(); 
        } catch (error) { alert('Error al publicar respuesta'); }
    };

    const comentariosOrdenados = [...comentarios].sort((a, b) => {
        const fA = new Date(a.fecha_creacion); const fB = new Date(b.fecha_creacion);
        return recientesPrimero ? fB - fA : fA - fB;
    });

    return (
        <section className="animate-fade-in section active" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh' }}>
            
            <div className="item-card" style={{ padding: '25px', marginBottom: '20px', borderLeft: '8px solid var(--highlight-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '15px' }}>⬅ VOLVER</button>
                        <h2 style={{ color: '#fff', fontSize: '2em', margin: '0 0 5px 0' }}>{foro.titulo}</h2>
                        <p style={{ color: '#888', margin: 0, fontSize: '0.9em' }}>
                            Por <strong style={{ cursor: 'pointer', color: 'var(--highlight-color)' }} onClick={() => irAPerfil(foro.autor)}>@{foro.autor}</strong>
                        </p>
                    </div>
                    <button onClick={() => setRecientesPrimero(!recientesPrimero)} className="btn-secondary">
                        ↕️ {recientesPrimero ? 'Más antiguos' : 'Más recientes'}
                    </button>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '6px' }}>
                    <p style={{ margin: 0, color: '#eee', fontSize: '1.15em' }}>{foro.descripcion}</p>
                </div>
            </div>

            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px' }}>
                {comentariosOrdenados.length === 0 ? (
                    <div className="empty-message">Nadie ha respondido aún. ¡Sé el primero en encender la discusión! 🔥</div>
                ) : (
                    comentariosOrdenados.map(c => (
                        <div key={c.id} className="comentario-caja">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ color: '#00e5ff', fontSize: '1.1em', cursor: 'pointer' }} onClick={() => irAPerfil(c.username)}>
                                    @{c.username}
                                </strong>
                                <span style={{ color: '#666', fontSize: '0.8em' }}>{new Date(c.fecha_creacion).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: 0, color: '#ddd', fontSize: '1.05em' }}>{c.comentario}</p>
                        </div>
                    ))
                )}
            </div>

            {/* USAMOS LA CLASE foro-reply-container PARA QUE EN MÓVIL SE VEA PERFECTO */}
            <div className="foro-reply-container">
                <form className="foro-reply-form" onSubmit={handleComentar}>
                    <textarea 
                        className="form-input foro-textarea" 
                        placeholder="Escribe tu respuesta para la comunidad..." 
                        value={nuevoComentario} 
                        onChange={(e) => setNuevoComentario(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="btn-primary">➤ ENVIAR</button>
                </form>
            </div>

        </section>
    );
}

export default ForoAprobado;