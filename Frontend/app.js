const API_URL = 'http://localhost:3000/api'; 

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerLink = document.getElementById('registerLink');
const loginLink = document.getElementById('loginLink');
const loginCard = document.querySelector('.login-card');
const registerCard = document.getElementById('registerCard');
const errorMessage = document.getElementById('errorMessage');
const registerErrorMessage = document.getElementById('registerErrorMessage');

function getToken() { return localStorage.getItem('token'); }

// --- LOGIN Y REGISTRO ---
registerLink?.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
});

loginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
});

loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token); 
            localStorage.setItem('currentUser', username);
            window.location.href = 'Pagina_principal.html';
        } else {
            errorMessage.textContent = data.error || 'Error al iniciar sesión';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'Error de conexión';
        errorMessage.style.display = 'block';
    }
});

registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email })
        });
        if (response.ok) {
            alert('¡Registro exitoso!');
            registerCard.style.display = 'none';
            loginCard.style.display = 'block';
        } else {
            const data = await response.json();
            registerErrorMessage.textContent = data.message || 'Error';
            registerErrorMessage.style.display = 'block';
        }
    } catch (error) {
        registerErrorMessage.textContent = 'Error de conexión';
        registerErrorMessage.style.display = 'block';
    }
});

// ============ PÁGINA PRINCIPAL ============

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userDisplay')) {
        verificarAutenticacion();
        inicializarPaginaPrincipal();
    }
});

function verificarAutenticacion() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) { window.location.href = 'index.html'; return; }
    document.getElementById('userDisplay').textContent = `👤 ${currentUser.toUpperCase()}`;
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

function inicializarPaginaPrincipal() {
    const menuBtns = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.section');

    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            menuBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-section') + 'Section').classList.add('active');
        });
    });

    cargarCanciones();
    cargarFans();
    cargarTareas();
    cargarEventos();
}

// --- EFECTOS VISUALES (NUEVO) ---
function aplicarEfectosCartas(container) {
    const cards = container.querySelectorAll('.item-card');
    cards.forEach((card, index) => {
        // 1. Animación de entrada escalonada
        card.style.opacity = '0';
        card.style.animation = `slideIn 0.5s ease forwards ${index * 0.1}s`;

        // 2. Efecto 3D Tilt al mover el mouse
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calcular rotación
            const rotateX = ((y - centerY) / centerY) * -10; // -10 deg max
            const rotateY = ((x - centerX) / centerX) * 10;  // 10 deg max

            card.style.transition = 'none'; // Quitar transición para movimiento fluido
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            card.style.zIndex = '10';
            card.style.borderColor = '#ff0000';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'all 0.5s ease'; // Restaurar suavidad al salir
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.zIndex = '1';
            card.style.borderColor = 'var(--highlight-color)';
        });
    });
}

// --- GESTIÓN DE CANCIONES ---
async function agregarCancion() {
    const titulo = document.getElementById('cancionTitulo').value.trim();
    const artista = document.getElementById('cancionArtista').value.trim();
    const genero = document.getElementById('cancionGenero').value.trim();
    if (!titulo || !artista) return alert('⚠️ Faltan datos');

    await fetch(`${API_URL}/canciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ titulo, artista, genero })
    });
    document.getElementById('cancionTitulo').value = '';
    document.getElementById('cancionArtista').value = '';
    cargarCanciones();
}

async function cargarCanciones() {
    try {
        const res = await fetch(`${API_URL}/canciones`);
        const canciones = await res.json();
        const container = document.getElementById('cancionesContainer');
        if (!canciones.length) { container.innerHTML = '<p class="empty-message">No hay canciones.</p>'; return; }

        container.innerHTML = canciones.map(c => `
            <div class="item-card cancion-card">
                <div class="item-header">
                    <h3>🎵 ${c.titulo.toUpperCase()}</h3>
                    <div>
                        <button class="btn-edit" onclick='prepararEdicion("cancion", ${JSON.stringify(c)})'>✏️</button>
                        <button class="btn-delete" onclick="eliminarCancion(${c.id})">🗑️</button>
                    </div>
                </div>
                <p><strong>ARTISTA:</strong> ${c.artista.toUpperCase()}</p>
                <p><strong>GÉNERO:</strong> ${(c.genero || '---').toUpperCase()}</p>
            </div>
        `).join('');
        aplicarEfectosCartas(container); // Aplicar efectos
    } catch (e) { console.error(e); }
}

async function eliminarCancion(id) {
    if (confirm('¿Eliminar?')) {
        await fetch(`${API_URL}/canciones/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
        cargarCanciones();
    }
}

// --- GESTIÓN DE FANS ---
async function agregarUsuario() {
    const nombre = document.getElementById('usuarioNombre').value.trim();
    const email = document.getElementById('usuarioEmail').value.trim();
    const pais = document.getElementById('usuarioPais').value.trim();
    if (!nombre) return alert('Nombre obligatorio');

    await fetch(`${API_URL}/fans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ nombre, email, pais })
    });
    document.getElementById('usuarioNombre').value = '';
    cargarFans();
}

async function cargarFans() {
    try {
        const res = await fetch(`${API_URL}/fans`);
        const fans = await res.json();
        const container = document.getElementById('usuariosContainer');
        if (!fans.length) { container.innerHTML = '<p class="empty-message">No hay fans.</p>'; return; }

        container.innerHTML = fans.map(f => `
            <div class="item-card usuario-card">
                <div class="item-header">
                    <h3>👥 ${f.nombre.toUpperCase()}</h3>
                    <div>
                        <button class="btn-edit" onclick='prepararEdicion("fan", ${JSON.stringify(f)})'>✏️</button>
                        <button class="btn-delete" onclick="eliminarFan(${f.id})">🗑️</button>
                    </div>
                </div>
                <p><strong>EMAIL:</strong> ${f.email || '---'}</p>
                <p><strong>PAÍS:</strong> ${(f.pais || '---').toUpperCase()}</p>
            </div>
        `).join('');
        aplicarEfectosCartas(container); // Aplicar efectos
    } catch (e) { console.error(e); }
}

async function eliminarFan(id) {
    if (confirm('¿Eliminar?')) {
        await fetch(`${API_URL}/fans/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
        cargarFans();
    }
}

// --- GESTIÓN DE TAREAS ---
async function agregarTarea() {
    const titulo = document.getElementById('tareaTitulo').value.trim();
    const descripcion = document.getElementById('tareaDescripcion').value.trim();
    const prioridad = document.getElementById('tareaPrioridad').value;
    if (!titulo) return alert('Título requerido');

    await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ titulo, descripcion, prioridad })
    });
    document.getElementById('tareaTitulo').value = '';
    cargarTareas();
}

async function cargarTareas() {
    try {
        const res = await fetch(`${API_URL}/tareas`);
        const tareas = await res.json();
        const container = document.getElementById('tareasContainer');
        if (!tareas.length) { container.innerHTML = '<p class="empty-message">Sin tareas.</p>'; return; }

        container.innerHTML = tareas.map(t => `
            <div class="item-card tarea-card ${t.completada ? 'completada' : ''}">
                <div class="item-header">
                    <h3>
                        <input type="checkbox" ${t.completada ? 'checked' : ''} onchange="toggleTarea(${t.id}, ${!t.completada})">
                        ${t.titulo.toUpperCase()}
                    </h3>
                    <div>
                        <button class="btn-edit" onclick='prepararEdicion("tarea", ${JSON.stringify(t)})'>✏️</button>
                        <button class="btn-delete" onclick="eliminarTarea(${t.id})">🗑️</button>
                    </div>
                </div>
                <p>${(t.descripcion || '').toUpperCase()}</p>
                <div class="tarea-footer">
                    <span class="prioridad-${t.prioridad}">${t.prioridad.toUpperCase()}</span>
                </div>
            </div>
        `).join('');
        aplicarEfectosCartas(container); // Aplicar efectos
    } catch (e) { console.error(e); }
}

async function toggleTarea(id, nuevoEstado) {
    await fetch(`${API_URL}/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ completada: nuevoEstado })
    });
    cargarTareas();
}

async function eliminarTarea(id) {
    if (confirm('¿Eliminar?')) {
        await fetch(`${API_URL}/tareas/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
        cargarTareas();
    }
}

// --- GESTIÓN DE EVENTOS ---
async function agregarEvento() {
    const nombre = document.getElementById('eventoNombre').value.trim();
    const fecha = document.getElementById('eventoFecha').value;
    const lugar = document.getElementById('eventoLugar').value.trim();
    if (!nombre || !fecha) return alert('Datos incompletos');

    await fetch(`${API_URL}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ nombre, fecha, lugar })
    });
    document.getElementById('eventoNombre').value = '';
    cargarEventos();
}

async function cargarEventos() {
    try {
        const res = await fetch(`${API_URL}/eventos`);
        const eventos = await res.json();
        const container = document.getElementById('eventosContainer');
        if (!eventos.length) { container.innerHTML = '<p class="empty-message">No hay eventos.</p>'; return; }

        container.innerHTML = eventos.map(e => `
            <div class="item-card evento-card">
                <div class="item-header">
                    <h3>📅 ${e.nombre.toUpperCase()}</h3>
                    <div>
                        <button class="btn-edit" onclick='prepararEdicion("evento", ${JSON.stringify(e)})'>✏️</button>
                        <button class="btn-delete" onclick="eliminarEvento(${e.id})">🗑️</button>
                    </div>
                </div>
                <p><strong>FECHA:</strong> ${new Date(e.fecha).toLocaleDateString()}</p>
                <p><strong>LUGAR:</strong> ${(e.lugar || '---').toUpperCase()}</p>
            </div>
        `).join('');
        aplicarEfectosCartas(container); // Aplicar efectos
    } catch (e) { console.error(e); }
}

async function eliminarEvento(id) {
    if (confirm('¿Eliminar?')) {
        await fetch(`${API_URL}/eventos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
        cargarEventos();
    }
}

// ============ LÓGICA DE EDICIÓN (MODAL) ============
const modal = document.getElementById('modalEdicion');
const modalInputs = document.getElementById('modalInputs');

function prepararEdicion(tipo, dato) {
    document.getElementById('editId').value = dato.id;
    document.getElementById('editType').value = tipo;
    modalInputs.innerHTML = ''; 

    if (tipo === 'cancion') {
        modalInputs.innerHTML = `
            <label>Título:</label><input type="text" id="editTitulo" class="form-input" value="${dato.titulo}">
            <label>Artista:</label><input type="text" id="editArtista" class="form-input" value="${dato.artista}">
            <label>Género:</label><input type="text" id="editGenero" class="form-input" value="${dato.genero || ''}">
        `;
    } else if (tipo === 'fan') {
        modalInputs.innerHTML = `
            <label>Nombre:</label><input type="text" id="editNombre" class="form-input" value="${dato.nombre}">
            <label>Email:</label><input type="email" id="editEmail" class="form-input" value="${dato.email || ''}">
            <label>País:</label><input type="text" id="editPais" class="form-input" value="${dato.pais || ''}">
        `;
    } else if (tipo === 'tarea') {
        modalInputs.innerHTML = `
            <label>Título:</label><input type="text" id="editTitulo" class="form-input" value="${dato.titulo}">
            <label>Descripción:</label><input type="text" id="editDescripcion" class="form-input" value="${dato.descripcion || ''}">
            <label>Prioridad:</label>
            <select id="editPrioridad" class="form-input">
                <option value="baja" ${dato.prioridad === 'baja' ? 'selected' : ''}>BAJA</option>
                <option value="media" ${dato.prioridad === 'media' ? 'selected' : ''}>MEDIA</option>
                <option value="alta" ${dato.prioridad === 'alta' ? 'selected' : ''}>ALTA</option>
            </select>
        `;
    } else if (tipo === 'evento') {
        const fechaFormat = new Date(dato.fecha).toISOString().split('T')[0];
        modalInputs.innerHTML = `
            <label>Nombre:</label><input type="text" id="editNombre" class="form-input" value="${dato.nombre}">
            <label>Fecha:</label><input type="date" id="editFecha" class="form-input" value="${fechaFormat}">
            <label>Lugar:</label><input type="text" id="editLugar" class="form-input" value="${dato.lugar || ''}">
        `;
    }
    modal.style.display = 'block';
}

function cerrarModal() { modal.style.display = 'none'; }
window.onclick = function(e) { if (e.target == modal) cerrarModal(); }

document.getElementById('formEdicion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const tipo = document.getElementById('editType').value;
    let url = '', body = {};

    if (tipo === 'cancion') {
        url = `${API_URL}/canciones/${id}`;
        body = { titulo: document.getElementById('editTitulo').value, artista: document.getElementById('editArtista').value, genero: document.getElementById('editGenero').value };
    } else if (tipo === 'fan') {
        url = `${API_URL}/fans/${id}`;
        body = { nombre: document.getElementById('editNombre').value, email: document.getElementById('editEmail').value, pais: document.getElementById('editPais').value };
    } else if (tipo === 'tarea') {
        url = `${API_URL}/tareas/editar/${id}`;
        body = { titulo: document.getElementById('editTitulo').value, descripcion: document.getElementById('editDescripcion').value, prioridad: document.getElementById('editPrioridad').value };
    } else if (tipo === 'evento') {
        url = `${API_URL}/eventos/${id}`;
        body = { nombre: document.getElementById('editNombre').value, fecha: document.getElementById('editFecha').value, lugar: document.getElementById('editLugar').value };
    }

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify(body)
        });
        if (res.ok) {
            alert('¡Modificado con éxito!');
            cerrarModal();
            if (tipo === 'cancion') cargarCanciones();
            if (tipo === 'fan') cargarFans();
            if (tipo === 'tarea') cargarTareas();
            if (tipo === 'evento') cargarEventos();
        } else { alert('Error al modificar.'); }
    } catch (error) { alert('Error de conexión'); }
});

// --- EFECTO PARALLAX FONDO ---
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateBackground() {
    const moveX = (mouseX * -0.015);
    const moveY = (mouseY * -0.015);
    document.body.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
    requestAnimationFrame(animateBackground);
}
animateBackground();