import { useState, useEffect } from 'react';
import axios from 'axios';
import ChatDirecto from './ChatDirecto';

const API_URL = 'http://localhost:3000/api';

function Fans({ irAPerfil }) {
    const [fans, setFans] = useState([]);
    const [misAmigos, setMisAmigos] = useState([]); // <-- Para saber a quién seguimos
    const [busqueda, setBusqueda] = useState('');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    const token = localStorage.getItem('token');
    const authAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

    useEffect(() => { 
        cargarFans(); 
        cargarMisAmigos();
    }, []);

    const cargarFans = async () => {
        try { const res = await authAxios.get('/fans'); setFans(res.data); } catch (error) {}
    };

    const cargarMisAmigos = async () => {
        try { const res = await authAxios.get('/mis_amigos'); setMisAmigos(res.data.map(a => a.id)); } catch (error) {}
    };

    const handleSeguir = async (e, id, yaEsAmigo) => {
        e.stopPropagation(); 
        // ADVERTENCIA SI VAMOS A ELIMINAR
        if (yaEsAmigo) {
            if (!window.confirm("¿Seguro que deseas eliminar a este fan de tus amigos?")) return;
        }

        try {
            const res = await authAxios.post(`/seguir/${id}`);
            alert(res.data.message);
            cargarMisAmigos(); // Recargamos para que el botón cambie al instante
        } catch (error) { alert("Error al realizar la acción"); }
    };

    const fansFiltrados = fans.filter(fan => fan.username.toLowerCase().includes(busqueda.toLowerCase()));

    if (usuarioSeleccionado) return <ChatDirecto otroUsuario={usuarioSeleccionado} onBack={() => setUsuarioSeleccionado(null)} />;

    return (
        <section className="section active">
            <div className="section-header"><h2>👥 COMUNIDAD DE FANS</h2></div>

            <input type="text" placeholder="🔍 Buscar a un usuario..." className="form-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ width: '100%', maxWidth: '500px', borderRadius: '25px', marginBottom: '20px' }} />

            <div className="items-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                {fansFiltrados.map(fan => {
                    const yaEsAmigo = misAmigos.includes(fan.id); // ¿Ya somos amigos?

                    return (
                        <div key={fan.id} className="item-card" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {/* Mostrar foto real si la tiene */}
                            <img src={fan.foto_perfil || 'https://i.imgur.com/3p3E53e.png'} alt="Perfil" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid var(--highlight-color)' }} onClick={() => irAPerfil(fan.username)} />
                            
                            <div style={{ flexGrow: 1 }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2em', cursor: 'pointer' }} onClick={() => irAPerfil(fan.username)}>@{fan.username}</h3>
                            </div>
                            
                            {/* BOTÓN DINÁMICO */}
                            <button onClick={(e) => handleSeguir(e, fan.id, yaEsAmigo)} style={{ background: yaEsAmigo ? '#555' : '#4ade80', color: yaEsAmigo ? '#fff' : '#000', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {yaEsAmigo ? '❌ Eliminar' : '➕ Agregar'}
                            </button>
                            
                            <button onClick={() => setUsuarioSeleccionado(fan)} style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer' }}>💬</button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default Fans;