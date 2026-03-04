import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Perfil({ targetUsername, irAPerfil }) {
    const [perfilData, setPerfilData] = useState(null);
    const [misAmigos, setMisAmigos] = useState([]);
    const [esPrivado, setEsPrivado] = useState(false);
    const [editandoFoto, setEditandoFoto] = useState(false);
    const [nuevaFoto, setNuevaFoto] = useState('');
    
    const currentUser = localStorage.getItem('currentUser')?.toUpperCase() || '';
    const token = localStorage.getItem('token');
    const authAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

    const esMiPerfil = !targetUsername || targetUsername.toUpperCase() === currentUser;

    useEffect(() => {
        cargarPerfil();
        if (esMiPerfil) cargarAmigos();
    }, [targetUsername]);

    const cargarPerfil = async () => {
        try {
            if (esMiPerfil) {
                const res = await authAxios.get('/perfil');
                setPerfilData(res.data);
                setEsPrivado(false);
            } else {
                const res = await authAxios.get(`/perfil/publico/${targetUsername}`);
                setEsPrivado(res.data.privado);
                setPerfilData(res.data);
            }
        } catch (error) { console.error("Error al cargar perfil", error); }
    };

    const cargarAmigos = async () => {
        try {
            const res = await authAxios.get('/mis_amigos');
            setMisAmigos(res.data);
        } catch (error) { console.error("Error al cargar amigos", error); }
    };

    const handleActualizarFoto = async (e) => {
        e.preventDefault();
        try {
            await authAxios.put('/perfil/foto', { foto_perfil: nuevaFoto });
            setEditandoFoto(false);
            cargarPerfil();
            alert('📸 Foto actualizada');
        } catch (error) { alert('Error al actualizar la foto'); }
    };

    if (!perfilData) return <p>Cargando perfil...</p>;
    const { usuario, foros, favoritos } = perfilData;

    return (
        <section className="section active">
            <div className="section-header"><h2>👤 PERFIL DE @{usuario.username}</h2></div>

            <div className="item-card" style={{ background: '#111', borderLeft: '4px solid var(--highlight-color)', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                
                {/* SECCIÓN DE FOTO DE PERFIL */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={usuario.foto_perfil || 'https://i.imgur.com/3p3E53e.png'} alt="Perfil" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--highlight-color)' }} />
                    {esMiPerfil && !editandoFoto && (
                        <button onClick={() => setEditandoFoto(true)} style={{ marginTop: '10px', background: '#333', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em' }}>Cambiar Foto</button>
                    )}
                </div>

                <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '2em', color: 'var(--highlight-color)', margin: 0 }}>@{usuario.username}</h2>
                    </div>
                    <p style={{ color: '#888', marginTop: '5px' }}>Miembro desde: {new Date(usuario.fecha_registro).toLocaleDateString()}</p>
                    {!esPrivado && <p style={{ fontStyle: 'italic', marginTop: '10px' }}>{usuario.descripcion}</p>}
                </div>
            </div>

            {/* FORMULARIO PARA CAMBIAR FOTO */}
            {editandoFoto && (
                <form onSubmit={handleActualizarFoto} style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#0a0a0a', padding: '15px', borderRadius: '8px' }}>
                    <input type="text" className="form-input" placeholder="URL de tu nueva foto" value={nuevaFoto} onChange={(e) => setNuevaFoto(e.target.value)} style={{ margin: 0, flexGrow: 1 }} required />
                    <button type="submit" className="btn-add" style={{ margin: 0 }}>GUARDAR</button>
                    <button type="button" className="btn-cancel" onClick={() => setEditandoFoto(false)} style={{ margin: 0 }}>CANCELAR</button>
                </form>
            )}

            {esPrivado ? (
                <div style={{ textAlign: 'center', padding: '50px', background: '#111', borderRadius: '8px' }}>
                    <h1 style={{ fontSize: '4em', margin: 0 }}>🔒</h1>
                    <h2>ESTA CUENTA ES PRIVADA</h2>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                        <h3 style={{ borderBottom: '2px solid #333' }}>🗣️ Foros Creados</h3>
                        {foros?.length === 0 ? <p className="empty-message">No hay foros.</p> : foros?.map(f => <div key={f.id} className="item-card">{f.titulo}</div>)}
                    </div>
                    <div>
                        {/* CAMBIADO A "CALIFICACIONES" */}
                        <h3 style={{ borderBottom: '2px solid #333' }}>⭐ Calificaciones</h3>
                        {favoritos?.length === 0 ? <p className="empty-message">No hay calificaciones altas.</p> : favoritos?.map((f,i) => (
                            <div key={i} className="item-card">
                                <h4 style={{ margin: '0 0 5px 0' }}>{f.titulo}</h4>
                                <p style={{ margin: 0, color: 'gold', fontWeight: 'bold' }}>{f.puntuacion} / 5 ⭐</p>
                            </div>
                        ))}
                    </div>
                    {/* LISTA DE AMIGOS */}
                    {esMiPerfil && (
                        <div>
                            <h3 style={{ borderBottom: '2px solid #333' }}>👥 Mis Amigos</h3>
                            {misAmigos.length === 0 ? <p className="empty-message">Aún no sigues a nadie.</p> : misAmigos.map(amigo => (
                                <div key={amigo.id} className="item-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => irAPerfil(amigo.username)}>
                                    <img src={amigo.foto_perfil || 'https://i.imgur.com/3p3E53e.png'} alt="amigo" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <span style={{ fontWeight: 'bold' }}>@{amigo.username}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default Perfil;