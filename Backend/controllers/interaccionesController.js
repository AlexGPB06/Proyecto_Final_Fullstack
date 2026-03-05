const db = require('../config/db');

exports.getForos = (req, res, next) => {
    let query = 'SELECT f.*, u.username as autor FROM foros f JOIN users u ON f.user_id = u.id';
    if (req.user.rol !== 'admin') query += ' WHERE f.estado = "aprobado"';
    query += ' ORDER BY f.fecha_creacion DESC';
    db.execute(query, (err, rows) => { if (err) return next(err); res.json(rows); });
};
exports.createForo = (req, res, next) => { db.execute('INSERT INTO foros (titulo, descripcion, user_id, estado) VALUES (?, ?, ?, "pendiente")', [req.body.titulo, req.body.descripcion, req.user.id], (err) => { if (err) return next(err); res.status(201).json({ message: 'Propuesto' }); }); };
exports.updateEstadoForo = (req, res, next) => { db.execute('UPDATE foros SET estado = ? WHERE id = ?', [req.body.estado, req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Actualizado' }); }); };
exports.deleteForo = (req, res, next) => { db.execute('DELETE FROM foros WHERE id = ?', [req.params.id], (err) => { if (err) return next(err); res.json({ message: 'Eliminado' }); }); };

exports.getSugerencias = (req, res, next) => { db.execute('SELECT s.*, u.username as autor FROM sugerencias s JOIN users u ON s.user_id = u.id ORDER BY s.fecha_creacion DESC', (err, rows) => { if (err) return next(err); res.json(rows); }); };
exports.createSugerencia = (req, res, next) => {
    if (req.user.rol === 'admin') return res.status(403).json({ message: 'Admins no crean sugerencias.' });
    db.execute('INSERT INTO sugerencias (titulo, descripcion, imagen_url, user_id) VALUES (?, ?, ?, ?)', [req.body.titulo, req.body.descripcion, req.body.imagen_url || 'https://via.placeholder.com/300x200/111111/ff0000?text=IDEA', req.user.id], (err) => { if (err) return next(err); res.status(201).json({ message: 'Publicada' }); });
};
exports.updateSugerencia = (req, res, next) => { db.execute('UPDATE sugerencias SET titulo = ?, descripcion = ?, imagen_url = ? WHERE id = ? AND user_id = ?', [req.body.titulo, req.body.descripcion, req.body.imagen_url, req.params.id, req.user.id], (err, result) => { if (err) return next(err); if (result.affectedRows === 0) return res.status(403).json({ message: 'Sin permisos' }); res.json({ message: 'Actualizada' }); }); };
exports.deleteSugerencia = (req, res, next) => {
    let q = 'DELETE FROM sugerencias WHERE id = ?'; let p = [req.params.id];
    if (req.user.rol !== 'admin') { q += ' AND user_id = ?'; p.push(req.user.id); }
    db.execute(q, p, (err, r) => { if (err) return next(err); if (r.affectedRows === 0) return res.status(403).json({ message: 'Sin permisos' }); res.json({ message: 'Eliminada' }); });
};

exports.getComentarios = (req, res, next) => { db.execute('SELECT c.*, u.username FROM comentarios c JOIN users u ON c.user_id = u.id WHERE c.tipo_entidad = ? AND c.entidad_id = ? ORDER BY c.fecha_creacion DESC', [req.params.tipo, req.params.id], (err, rows) => { if (err) return next(err); res.json(rows); }); };
exports.createComentario = (req, res, next) => { db.execute('INSERT INTO comentarios (user_id, entidad_id, tipo_entidad, comentario) VALUES (?, ?, ?, ?)', [req.user.id, req.body.entidad_id, req.body.tipo_entidad, req.body.comentario], (err) => { if (err) return next(err); res.status(201).json({ message: 'Publicado' }); }); };
exports.updateComentario = (req, res, next) => { db.execute('UPDATE comentarios SET comentario = ? WHERE id = ? AND user_id = ?', [req.body.comentario, req.params.id, req.user.id], (err, r) => { if (err) return next(err); if (r.affectedRows === 0) return res.status(403).json({ message: 'Sin permisos' }); res.json({ message: 'Actualizado' }); }); };
exports.deleteComentario = (req, res, next) => {
    let q = 'DELETE FROM comentarios WHERE id = ?'; let p = [req.params.id];
    if (req.user.rol !== 'admin') { q += ' AND user_id = ?'; p.push(req.user.id); }
    db.execute(q, p, (err, r) => { if (err) return next(err); if (r.affectedRows === 0) return res.status(403).json({ message: 'Sin permisos' }); res.json({ message: 'Eliminado' }); });
};

exports.getCalificacion = (req, res, next) => { db.execute('SELECT AVG(puntuacion) as promedio, COUNT(id) as total FROM calificaciones WHERE tipo_entidad = ? AND entidad_id = ?', [req.params.tipo, req.params.id], (err, rows) => { if (err) return next(err); res.json(rows[0]); }); };
exports.getMiVoto = (req, res, next) => { db.execute('SELECT puntuacion FROM calificaciones WHERE tipo_entidad = ? AND entidad_id = ? AND user_id = ?', [req.params.tipo, req.params.id, req.user.id], (err, rows) => { if (err) return next(err); res.json({ miVoto: rows.length > 0 ? rows[0].puntuacion : null }); }); };
exports.createCalificacion = (req, res, next) => { db.execute('INSERT INTO calificaciones (user_id, entidad_id, tipo_entidad, puntuacion) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE puntuacion = VALUES(puntuacion)', [req.user.id, req.body.entidad_id, req.body.tipo_entidad, req.body.puntuacion], (err) => { if (err) return next(err); res.json({ message: 'Guardada' }); }); };