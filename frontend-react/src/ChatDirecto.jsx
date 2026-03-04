import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function ChatDirecto({ otroUsuario, onBack }) {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const mensajesEndRef = useRef(null);

    const token = localStorage.getItem('token');
    // Para saber cuáles mensajes son míos y ponerlos del lado derecho
    const currentUser = localStorage.getItem('currentUser')?.toUpperCase() || '';

    const authAxios = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    const cargarMensajes = async () => {
        try {
            const res = await authAxios.get(`/mensajes/${otroUsuario.id}`);
            setMensajes(res.data);
        } catch (error) { console.error("Error al cargar chat", error); }
    };

    // Cargar mensajes al abrir y luego cada 3 segundos (simulando tiempo real)
    useEffect(() => {
        cargarMensajes();
        const intervalo = setInterval(cargarMensajes, 3000);
        return () => clearInterval(intervalo); // Limpiamos al salir
    }, [otroUsuario.id]);

    // Auto-scroll hacia el último mensaje
    useEffect(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    const handleEnviar = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim()) return;
        try {
            await authAxios.post('/mensajes', {
                receptor_id: otroUsuario.id,
                mensaje: nuevoMensaje
            });
            setNuevoMensaje('');
            cargarMensajes(); // Recargar inmediatamente
        } catch (error) { alert('Error al enviar mensaje'); }
    };

    return (
        <section className="section active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* CABECERA DEL CHAT */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#222', padding: '15px', borderRadius: '8px 8px 0 0', borderBottom: '2px solid var(--highlight-color)' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5em', cursor: 'pointer', marginRight: '15px' }}>⬅</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--highlight-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2em' }}>
                        {otroUsuario.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff' }}>@{otroUsuario.username}</h3>
                        <p style={{ margin: 0, fontSize: '0.8em', color: '#aaa' }}>{otroUsuario.rol.toUpperCase()}</p>
                    </div>
                </div>
            </div>

            {/* ÁREA DE MENSAJES (Fondo oscuro) */}
            <div style={{ flexGrow: 1, background: '#0a0a0a', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mensajes.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>No hay mensajes. ¡Di hola!</p>
                ) : (
                    mensajes.map((msg) => {
                        // Lógica: Si yo no soy el receptor, significa que yo lo envié (Soy el Emisor)
                        const soyYo = msg.receptor_id === otroUsuario.id;

                        return (
                            <div key={msg.id} style={{
                                alignSelf: soyYo ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                background: soyYo ? '#005c4b' : '#262d31', // Verde oscuro (WhatsApp) o Gris oscuro
                                color: '#fff',
                                padding: '10px 15px',
                                borderRadius: soyYo ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                position: 'relative'
                            }}>
                                <p style={{ margin: 0, fontSize: '1em', lineHeight: '1.4' }}>{msg.mensaje}</p>
                                <span style={{ fontSize: '0.7em', color: '#aaa', display: 'block', textAlign: 'right', marginTop: '5px' }}>
                                    {new Date(msg.fecha_envio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={mensajesEndRef} />
            </div>

            {/* BARRA DE ESCRITURA */}
            <div style={{ background: '#222', padding: '15px', borderRadius: '0 0 8px 8px' }}>
                <form onSubmit={handleEnviar} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Escribe un mensaje..." 
                        value={nuevoMensaje} 
                        onChange={(e) => setNuevoMensaje(e.target.value)} 
                        style={{ flexGrow: 1, padding: '12px', borderRadius: '25px', border: 'none', background: '#333', color: '#fff', outline: 'none', paddingLeft: '20px' }}
                        required 
                    />
                    <button type="submit" style={{ background: 'var(--highlight-color)', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2em' }}>
                        ➤
                    </button>
                </form>
            </div>
        </section>
    );
}

export default ChatDirecto;