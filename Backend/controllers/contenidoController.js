const db = require('../config/db');
const { buscarImagenLocal } = require('../utils/helpers');

// --- BANNERS Y DESTACADOS ---
exports.getBanners = (req, res, next) => { db.execute('SELECT * FROM banners', (err, rows) => { if (err) return next(err); res.json(rows); }); };
exports.updateBanner = (req, res, next) => { db.execute('UPDATE banners SET imagen_url = ? WHERE posicion = ?', [req.body.imagen_url, req.params.posicion], (err) => { if (err) return next(err); res.json({ message: 'Actualizado' }); }); };
exports.getDestacados = (req, res, next) => {
    db.execute('SELECT * FROM destacados_home', (err, slotsRows) => {
        if (err) return next(err);
        db.execute('SELECT id, titulo, artista, genero FROM canciones ORDER BY id DESC', (err, cancionesRows) => {
            if (err) return next(err);
            db.execute('SELECT id, titulo, descripcion FROM tareas ORDER BY id DESC', (err, albumesRows) => {
                if (err) return next(err); res.json({ slots: slotsRows, canciones: cancionesRows, albumes: albumesRows });
            });
        });
    });
};
exports.updateDestacado = (req, res, next) => { db.execute('UPDATE destacados_home SET item_id = ? WHERE slot = ?', [req.body.item_id || null, req.body.slot], (err) => { if (err) return next(err); res.json({ message: 'Actualizado' }); }); };

// --- ENCUESTAS ---
exports.getEncuestaActiva = (req, res, next) => {
    db.execute('SELECT * FROM encuestas WHERE activa = TRUE ORDER BY id DESC LIMIT 1', (err, encuestas) => {
        if (err) return next(err);
        if (encuestas.length === 0) return res.json(null);
        db.execute('SELECT opcion_seleccionada, COUNT(*) as total FROM encuesta_votos WHERE encuesta_id = ? GROUP BY opcion_seleccionada', [encuestas[0].id], (err, votos) => {
            if (err) return next(err);
            db.execute('SELECT opcion_seleccionada FROM encuesta_votos WHERE encuesta_id = ? AND user_id = ?', [encuestas[0].id, req.user.id], (err, miVoto) => {
                if (err) return next(err); res.json({ encuesta: encuestas[0], conteos: votos, yaVote: miVoto.length > 0 ? miVoto[0].opcion_seleccionada : null });
            });
        });
    });
};
exports.crearEncuesta = (req, res, next) => {
    const { pregunta, opcion1, opcion2, opcion3, opcion4 } = req.body;
    db.execute('UPDATE encuestas SET activa = FALSE', (err) => {
        if (err) return next(err);
        db.execute('INSERT INTO encuestas (pregunta, opcion1, opcion2, opcion3, opcion4) VALUES (?, ?, ?, ?, ?)', [pregunta, opcion1, opcion2, opcion3 || null, opcion4 || null], (err) => {
            if (err) return next(err); res.status(201).json({ message: 'Publicada' });
        });
    });
};
exports.borrarEncuesta = (req, res, next) => { db.execute('DELETE FROM encuestas WHERE id = ?', [req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Eliminada' }); }); };
exports.votarEncuesta = (req, res, next) => { db.execute('INSERT INTO encuesta_votos (encuesta_id, user_id, opcion_seleccionada) VALUES (?, ?, ?)', [req.params.id, req.user.id, req.body.opcion], (err) => { if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Ya votaste' }); if (err) return next(err); res.json({ message: 'Voto registrado' }); }); };

// --- AVISOS ---
exports.crearAviso = (req, res, next) => {
    const { mensaje } = req.body;
    db.execute('INSERT INTO avisos_globales (mensaje, autor) VALUES (?, ?)', [mensaje, req.user.username], (err) => {
        if (err) return next(err);
        db.execute('SELECT id FROM users WHERE rol = "fan"', (err, rows) => {
            if (err) return next(err);
            if (rows.length === 0) return res.json({ message: 'Publicado en Inicio' });
            const values = rows.map(r => [r.id, 'aviso', mensaje, req.user.username]);
            db.query('INSERT INTO notificaciones (usuario_id, tipo, mensaje, remitente_username) VALUES ?', [values], (err) => { if (err) return next(err); res.json({ message: 'Publicado y notificado' }); });
        });
    });
};
exports.getUltimoAviso = (req, res, next) => { db.execute('SELECT * FROM avisos_globales ORDER BY id DESC LIMIT 1', (err, rows) => { if (err) return next(err); res.json(rows.length > 0 ? rows[0] : null); }); };
exports.updateAviso = (req, res, next) => { db.execute('UPDATE avisos_globales SET mensaje = ? WHERE id = ?', [req.body.mensaje, req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Actualizado' }); }); };
exports.deleteAviso = (req, res, next) => { db.execute('DELETE FROM avisos_globales WHERE id = ?', [req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Eliminado' }); }); };

// --- CANCIONES (CON EL NUEVO FILTRO) ---
exports.getCanciones = (req, res, next) => { 
    const { sort, genero } = req.query;
    
    let query = `
        SELECT c.*, COALESCE(AVG(cal.puntuacion), 0) as calificacion_promedio 
        FROM canciones c
        LEFT JOIN calificaciones cal ON c.id = cal.entidad_id AND cal.tipo_entidad = 'cancion'
    `;
    let params = [];

    if (genero) {
        query += ' WHERE c.genero = ?';
        params.push(genero);
    }

    query += ' GROUP BY c.id';

    if (sort === 'alfabetico') {
        query += ' ORDER BY c.titulo ASC';
    } else if (sort === 'calificacion') {
        query += ' ORDER BY calificacion_promedio DESC';
    } else if (sort === 'vistas') {
        query += ' ORDER BY c.vistas DESC';
    } else {
        query += ' ORDER BY c.id DESC';
    }

    db.execute(query, params, (err, rows) => { 
        if (err) return next(err); res.json(rows); 
    }); 
};
exports.getCancionById = (req, res, next) => { db.execute('SELECT * FROM canciones WHERE id = ?', [req.params.id], (err, rows) => { if (err) return next(err); if (rows.length === 0) return res.status(404).json({ message: 'No encontrada' }); res.json(rows[0]); }); };
exports.createCancion = (req, res, next) => { 
    const { titulo, artista, genero } = req.body;
    if (!titulo || !artista || !genero) return res.status(400).json({ message: 'Faltan campos' });
    db.execute('INSERT INTO canciones (titulo, artista, genero, imagen_url) VALUES (?, ?, ?, ?)', [titulo, artista, genero, buscarImagenLocal(titulo)], (err) => { if (err) return next(err); res.status(201).json({ message: 'Agregada' }); }); 
};
exports.updateCancion = (req, res, next) => { db.execute('UPDATE canciones SET titulo = ?, artista = ?, genero = ? WHERE id = ?', [req.body.titulo, req.body.artista, req.body.genero, req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Actualizada' }); }); };
exports.deleteCancion = (req, res, next) => { db.execute('DELETE FROM canciones WHERE id = ?', [req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Eliminada' }); }); };

// --- TAREAS / ÁLBUMES (CON EL NUEVO FILTRO) ---
exports.getTareas = (req, res, next) => { 
    const { sort } = req.query;
    
    let query = `
        SELECT t.*, COALESCE(AVG(cal.puntuacion), 0) as calificacion_promedio 
        FROM tareas t
        LEFT JOIN calificaciones cal ON t.id = cal.entidad_id AND cal.tipo_entidad = 'tarea'
        GROUP BY t.id
    `;

    if (sort === 'alfabetico') {
        query += ' ORDER BY t.titulo ASC';
    } else if (sort === 'calificacion') {
        query += ' ORDER BY calificacion_promedio DESC';
    } else if (sort === 'vistas') {
        query += ' ORDER BY t.vistas DESC';
    } else {
        query += ' ORDER BY t.id DESC';
    }

    db.execute(query, [], (err, rows) => { 
        if (err) return next(err); res.json(rows); 
    }); 
};
exports.createTarea = (req, res, next) => { db.execute('INSERT INTO tareas (titulo, descripcion, prioridad, imagen_url) VALUES (?, ?, ?, ?)', [req.body.titulo, req.body.descripcion, req.body.prioridad, buscarImagenLocal(req.body.titulo)], (err) => { if (err) return next(err); res.status(201).json({ message: 'Creado' }); }); };
exports.updateTareaEstado = (req, res, next) => { db.execute('UPDATE tareas SET completada = ? WHERE id = ?', [req.body.completada, req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Estado actualizado' }); }); };
exports.updateTarea = (req, res, next) => { db.execute('UPDATE tareas SET titulo = ?, descripcion = ?, prioridad = ? WHERE id = ?', [req.body.titulo, req.body.descripcion, req.body.prioridad, req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Actualizado' }); }); };
exports.deleteTarea = (req, res, next) => { db.execute('DELETE FROM tareas WHERE id = ?', [req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Eliminado' }); }); };

// --- EVENTOS ---
exports.getEventos = (req, res, next) => { db.execute('SELECT * FROM eventos ORDER BY fecha ASC', (err, rows) => { if (err) return next(err); res.json(rows); }); };
exports.createEvento = (req, res, next) => { db.execute('INSERT INTO eventos (nombre, fecha, lugar, imagen_url) VALUES (?, ?, ?, ?)', [req.body.nombre, req.body.fecha, req.body.lugar, buscarImagenLocal(req.body.nombre)], (err) => { if (err) return next(err); res.status(201).json({ message: 'Creado' }); }); };
exports.updateEvento = (req, res, next) => { db.execute('UPDATE eventos SET nombre = ?, fecha = ?, lugar = ? WHERE id = ?', [req.body.nombre, req.body.fecha, req.body.lugar, req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Actualizado' }); }); };
exports.deleteEvento = (req, res, next) => { db.execute('DELETE FROM eventos WHERE id = ?', [req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Eliminado' }); }); };