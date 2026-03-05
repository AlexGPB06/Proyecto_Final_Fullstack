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
            
            {/* CABECERA (POST PRINCIPAL) */}
            <div className="item-card" style={{ background: 'linear-gradient(to right, #111, #0a0a0a)', border: '2px solid var(--highlight-color)', borderLeft: '8px solid var(--highlight-color)', padding: '25px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                        <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '15px', padding: '5px 15px', fontSize: '0.85em' }}>⬅ VOLVER A FOROS</button>
                        <h2 style={{ color: '#fff', fontSize: '2.2em', margin: '0 0 5px 0', textShadow: '2px 2px 0 #000' }}>{foro.titulo}</h2>
                        <p style={{ color: '#888', margin: 0, fontSize: '0.9em' }}>
                            Por <strong style={{ cursor: 'pointer', color: 'var(--highlight-color)' }} onClick={() => irAPerfil(foro.autor)}>@{foro.autor}</strong> el {new Date(foro.fecha_creacion).toLocaleString()}
                        </p>
                    </div>
                    <button onClick={() => setRecientesPrimero(!recientesPrimero)} className="btn-secondary" style={{ fontSize: '0.8em' }}>
                        ↕️ {recientesPrimero ? 'Más antiguos' : 'Más recientes'}
                    </button>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '6px', border: '1px solid #333' }}>
                    <p style={{ margin: 0, color: '#eee', fontSize: '1.15em', lineHeight: '1.6' }}>{foro.descripcion}</p>
                </div>
            </div>

            {/* LISTA DE COMENTARIOS */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '5px', paddingBottom: '20px' }}>
                {comentariosOrdenados.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: '1px dashed #555' }}>
                        <p style={{ color: '#888', fontSize: '1.2em', margin: 0 }}>Nadie ha respondido aún. ¡Sé el primero en encender la discusión! 🔥</p>
                    </div>
                ) : (
                    comentariosOrdenados.map(c => (
                        <div key={c.id} style={{ background: '#151515', padding: '15px 20px', borderRadius: '0px 15px 15px 15px', borderLeft: '3px solid #00e5ff', marginLeft: '20px', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                            <div style={{ position: 'absolute', top: '0', left: '-20px', width: '20px', height: '20px', borderTop: '3px solid #00e5ff', borderLeft: '3px solid #00e5ff', borderRadius: '10px 0 0 0' }}></div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ color: '#00e5ff', fontSize: '1.1em', cursor: 'pointer' }} onClick={() => irAPerfil(c.username)}>
                                    @{c.username}
                                </strong>
                                <span style={{ color: '#666', fontSize: '0.8em' }}>{new Date(c.fecha_creacion).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: 0, color: '#ddd', lineHeight: '1.6', fontSize: '1.05em' }}>{c.comentario}</p>
                        </div>
                    ))
                )}
            </div>

            {/* BARRA DE RESPUESTA FIJA ABAJO */}
            <div style={{ position: 'sticky', bottom: 0, padding: '20px', background: 'rgba(10,10,10,0.95)', borderTop: '2px solid var(--highlight-color)', backdropFilter: 'blur(10px)', marginTop: '20px', margin: '-20px' }}>
                <form onSubmit={handleComentar} style={{ display: 'flex', gap: '15px' }}>
                    <input type="text" className="form-input" placeholder="Escribe tu respuesta para la comunidad..." value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} style={{ flexGrow: 1, margin: 0, background: '#222' }} required />
                    <button type="submit" className="btn-primary" style={{ margin: 0, whiteSpace: 'nowrap' }}>➤ ENVIAR RESPUESTA</button>
                </form>
            </div>

        </section>
    );
}

export default ForoAprobado;