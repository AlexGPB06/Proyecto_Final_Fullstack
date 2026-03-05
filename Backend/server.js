const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

// Importaremos las rutas desde nuestra nueva carpeta (lo haremos en el paso 2)
const apiRoutes = require('./routes/api');

const app = express();

// --- MIDDLEWARES GLOBALES ---
app.use(cors());
app.use(express.json());

// --- RUTAS PRINCIPALES ---
// Esto le dice a Express: "Cualquier petición que empiece con /api, mándala al archivo apiRoutes"
app.use('/api', apiRoutes);

// --- MANEJO DE ERRORES ---
app.use((err, req, res, next) => {
    console.error('[Error Interno]:', err.stack);
    res.status(500).json({ status: 'error', message: 'Ocurrió un error inesperado.' });
});

// --- INICIO DEL SERVIDOR Y EXPORTACIÓN (PARA JEST) ---
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;