import { useState } from 'react';
import axios from 'axios';

function AvisosAdmin() {
    const [mensaje, setMensaje] = useState('');
    const token = localStorage.getItem('token');
    const authAxios = axios.create({ baseURL: 'http://localhost:3000/api', headers: { Authorization: `Bearer ${token}` } });

    const handleEnviarAviso = async (e) => {
        e.preventDefault();
        if (!window.confirm("¿Seguro que deseas enviar esta notificación a TODOS los fans?")) return;
        try {
            await authAxios.post('/notificaciones/aviso', { mensaje });
            alert("✅ Aviso global enviado con éxito a todos los fans.");
            setMensaje('');
        } catch (error) { alert("Error al enviar el aviso."); }
    };

    return (
        <section className="section active">
            <div className="section-header"><h2>📢 PANEL DE AVISOS GLOBALES (ADMIN)</h2></div>
            <div className="form-section" style={{ background: '#111', border: '1px solid #333', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ color: 'var(--highlight-color)', marginBottom: '15px' }}>Enviar notificación a toda la comunidad</h3>
                <p style={{ color: '#888', marginBottom: '20px', fontSize: '0.9em' }}>
                    Al enviar este aviso, le aparecerá en la campanita de notificaciones a todos los fans registrados en la plataforma.
                </p>
                <form onSubmit={handleEnviarAviso} className="form-group-column">
                    <textarea 
                        className="form-input" placeholder="Escribe tu anuncio aquí (Ej: ¡Mañana mantenimiento del servidor a las 3 AM!)..." 
                        value={mensaje} onChange={(e) => setMensaje(e.target.value)} 
                        style={{ minHeight: '120px', resize: 'vertical' }} required 
                    />
                    <button type="submit" className="btn-add" style={{ alignSelf: 'flex-start', background: 'var(--highlight-color)' }}>
                        🚀 ENVIAR AVISO A TODOS
                    </button>
                </form>
            </div>
        </section>
    );
}
export default AvisosAdmin;