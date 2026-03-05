const fs = require('fs');
const path = require('path');

const buscarImagenLocal = (nombreBase) => {
    const extensiones = ['.jpg', '.jpeg', '.png', '.webp'];
    // Ajusta esta ruta si tu carpeta del frontend se llama diferente (ej. '../frontend/public/img')
    const carpetaImg = path.join(__dirname, '../../frontend-react/public/img'); 
    
    for (const ext of extensiones) {
        if (fs.existsSync(path.join(carpetaImg, `${nombreBase}${ext}`))) {
            return `/img/${nombreBase}${ext}`;
        }
    }
    return '/img/placeholder.png';
};

module.exports = { buscarImagenLocal };