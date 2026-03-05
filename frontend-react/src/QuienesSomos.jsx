import React from 'react';

function QuienesSomos() {
    const miembros = [
        { nombre: "Hugo", rol: "Voz Principal y Guitarra", imagen: "/img/Hugo Voz.jpeg", bio: "El alma lírica de la banda. Escribe verdades que el gobierno no quiere que escuches." },
        { nombre: "Zekar", rol: "Bajo", imagen: "/img/Zekar Bajo.jpeg", bio: "Líneas de bajo tan profundas como los secretos de estado." },
        { nombre: "Eliseo", rol: "Batería", imagen: "/img/141109487eecf71695ce3d30be6977ca.jpg", bio: "Marca el ritmo de la revolución. Imparable y explosivo." },
        { nombre: "Caleb", rol: "Guitarra", imagen: "/img/Caleb Guitarra.jpeg", bio: "Crea las atmósferas que te transportan a otra dimensión." }
    ];

    return (
        <section className="animate-fade-in section active" style={{ paddingBottom: '40px' }}>
            
            {/* BANNER ANIMADO */}
            <div className="animated-banner" style={{ position: 'relative', height: '350px', borderRadius: '8px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', backgroundImage: 'url("/img/charro.jpeg")', backgroundSize: 'cover', backgroundPosition: 'center', border: '3px solid var(--highlight-color)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4))' }}>
                    <h1 style={{ fontSize: '4em', margin: 0, color: '#fff', textShadow: '0 0 20px var(--highlight-color)', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '5px' }}>
                        Palomas del Gobierno
                    </h1>
                    <p style={{ fontSize: '1.2em', color: '#ccc', letterSpacing: '2px', fontWeight: 'bold' }}>MÚSICA QUE DESAFÍA EL SISTEMA</p>
                </div>
            </div>

            {/* HISTORIA CON EFECTO DE APARICIÓN */}
            <div className="item-card" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 50px auto', padding: '40px', borderTop: '4px solid var(--highlight-color)' }}>
                <h2 style={{ color: 'var(--highlight-color)', fontSize: '2em', marginBottom: '20px' }}>NUESTRA HISTORIA</h2>
                <p style={{ fontSize: '1.1em', lineHeight: '1.8', color: '#bbb' }}>
                    Formados en las calles donde el silencio no es opción, <strong style={{color: '#fff'}}>Palomas del Gobierno</strong> nació como un grito de rebeldía. 
                    No somos solo una banda, somos un movimiento. Mezclamos el rock crudo con letras que cuestionan la realidad que nos imponen. 
                    Únete a la bandada.
                </p>
            </div>

            <div className="section-header">
                <h2>🎸 LOS INTEGRANTES</h2>
            </div>
            
            {/* TARJETAS DE INTEGRANTES */}
            <div className="items-grid">
                {miembros.map((miembro, idx) => (
                    <div key={idx} className="item-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
                            <img src={miembro.imagen} alt={miembro.nombre} className="card-image" style={{ height: '100%', borderBottom: 'none' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '20px 15px', background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.8em', textShadow: '2px 2px 0px #000' }}>{miembro.nombre}</h3>
                                <p style={{ margin: '5px 0 0 0', color: 'var(--highlight-color)', fontWeight: 'bold', fontSize: '0.9em' }}>{miembro.rol}</p>
                            </div>
                        </div>
                        <div className="card-content" style={{ background: '#0a0a0a', borderTop: '3px solid var(--highlight-color)' }}>
                            <p style={{ margin: 0, color: '#aaa', fontStyle: 'italic', lineHeight: '1.6' }}>"{miembro.bio}"</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default QuienesSomos;