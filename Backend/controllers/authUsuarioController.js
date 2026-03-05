const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
    const { username, email, password, fecha_nacimiento, sexo } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.execute('INSERT INTO users (username, email, password, rol, fecha_nacimiento, sexo) VALUES (?, ?, ?, "fan", ?, ?)',
            [username, email, hashedPassword, fecha_nacimiento, sexo || 'Prefiero no decirlo'],
            (err) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        if (err.sqlMessage.includes('username')) return res.status(400).json({ message: '🚨 Nombre de usuario ocupado.' });
                        if (err.sqlMessage.includes('email')) return res.status(400).json({ message: '🚨 Correo ya registrado.' });
                    }
                    return next(err); 
                }
                res.status(201).json({ message: '¡Cuenta creada exitosamente!' });
            }
        );
    } catch (error) { next(error); }
};

exports.login = (req, res, next) => {
    const { username, password } = req.body;
    db.execute('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return next(err);
        if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id, username: user.username, rol: user.rol }, process.env.JWT_SECRET || 'clave_secreta_para_tokens', { expiresIn: '12h' });
        res.json({ message: 'Login exitoso', token, username: user.username, rol: user.rol });
    });
};

exports.getPerfil = (req, res, next) => {
    db.execute('SELECT id, username, email, rol, descripcion, fecha_registro, foto_perfil, privacidad FROM users WHERE id = ?', [req.user.id], (err, userRows) => {
        if (err) return next(err);
        if (userRows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        db.execute('SELECT * FROM foros WHERE user_id = ? ORDER BY fecha_creacion DESC', [req.user.id], (err, forosRows) => {
            if (err) return next(err);
            const queryFavs = `
                SELECT c.id, c.titulo, c.artista as subtitulo, cal.puntuacion, 'cancion' as tipo FROM canciones c JOIN calificaciones cal ON c.id = cal.entidad_id AND cal.tipo_entidad = 'cancion' WHERE cal.user_id = ? AND cal.puntuacion >= 4
                UNION
                SELECT t.id, t.titulo, t.descripcion as subtitulo, cal.puntuacion, 'tarea' as tipo FROM tareas t JOIN calificaciones cal ON t.id = cal.entidad_id AND cal.tipo_entidad = 'tarea' WHERE cal.user_id = ? AND cal.puntuacion >= 4 ORDER BY puntuacion DESC`;
            db.execute(queryFavs, [req.user.id, req.user.id], (err, favsRows) => {
                if (err) return next(err); res.json({ usuario: userRows[0], foros: forosRows, favoritos: favsRows });
            });
        });
    });
};

exports.getPerfilPublico = (req, res, next) => {
    db.execute('SELECT id, username, rol, descripcion, fecha_registro, foto_perfil, privacidad FROM users WHERE username = ?', [req.params.username], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        const targetUser = rows[0];
        if (targetUser.privacidad === 'privado' && req.user.rol !== 'admin' && req.user.username !== targetUser.username) {
            return res.json({ privado: true, usuario: { username: targetUser.username, fecha_registro: targetUser.fecha_registro, foto_perfil: targetUser.foto_perfil } });
        }
        db.execute('SELECT * FROM foros WHERE user_id = ? ORDER BY fecha_creacion DESC', [targetUser.id], (err, forosRows) => {
            if (err) return next(err);
            const queryFavs = `
                SELECT c.id, c.titulo, c.artista as subtitulo, cal.puntuacion, 'cancion' as tipo FROM canciones c JOIN calificaciones cal ON c.id = cal.entidad_id AND cal.tipo_entidad = 'cancion' WHERE cal.user_id = ? AND cal.puntuacion >= 4
                UNION
                SELECT t.id, t.titulo, t.descripcion as subtitulo, cal.puntuacion, 'tarea' as tipo FROM tareas t JOIN calificaciones cal ON t.id = cal.entidad_id AND cal.tipo_entidad = 'tarea' WHERE cal.user_id = ? AND cal.puntuacion >= 4 ORDER BY puntuacion DESC`;
            db.execute(queryFavs, [targetUser.id, targetUser.id], (err, favsRows) => {
                if (err) return next(err); res.json({ privado: false, usuario: targetUser, foros: forosRows, favoritos: favsRows });
            });
        });
    });
};

exports.updateDescripcion = (req, res, next) => { db.execute('UPDATE users SET descripcion = ? WHERE id = ?', [req.body.descripcion, req.user.id], (err) => { if (err) return next(err); res.json({ message: 'Actualizado' }); }); };
exports.updatePrivacidad = (req, res, next) => { db.execute('UPDATE users SET privacidad = ? WHERE id = ?', [req.body.privacidad, req.user.id], (err) => { if (err) return next(err); res.json({ message: 'Actualizado' }); }); };
exports.updateFoto = (req, res, next) => { db.execute('UPDATE users SET foto_perfil = ? WHERE id = ?', [req.body.foto_perfil, req.user.id], (err) => { if (err) return next(err); res.json({ message: 'Actualizado' }); }); };

exports.getFans = (req, res, next) => { db.execute('SELECT id, username, rol, descripcion, fecha_registro, foto_perfil FROM users WHERE id != ? AND rol = "fan" ORDER BY username ASC', [req.user.id], (err, rows) => { if (err) return next(err); res.json(rows); }); };
exports.getMisAmigos = (req, res, next) => { db.execute('SELECT u.id, u.username, u.foto_perfil FROM seguidores s JOIN users u ON s.seguido_id = u.id WHERE s.seguidor_id = ?', [req.user.id], (err, rows) => { if (err) return next(err); res.json(rows); }); };

exports.toggleSeguir = (req, res, next) => {
    const seguido_id = req.params.id;
    db.execute('SELECT rol FROM users WHERE id = ?', [seguido_id], (err, rows) => {
        if (err) return next(err);
        if (rows.length > 0 && rows[0].rol === 'admin') return res.status(403).json({ message: 'No puedes agregar a un administrador.' });
        db.execute('INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)', [req.user.id, seguido_id], (err) => {
            if (err && err.code === 'ER_DUP_ENTRY') {
                db.execute('DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?', [req.user.id, seguido_id], (errDel) => {
                    if (errDel) return next(errDel); res.json({ message: 'Amigo eliminado', siguiendo: false });
                });
            } else if (err) { return next(err); 
            } else { 
                db.execute('INSERT INTO notificaciones (usuario_id, tipo, mensaje, remitente_username) VALUES (?, "seguidor", ?, ?)', [seguido_id, `@${req.user.username} te ha agregado como amigo.`, req.user.username]);
                res.json({ message: 'Amigo agregado a tu lista', siguiendo: true }); 
            }
        });
    });
};

exports.getNotificaciones = (req, res, next) => {
    const userId = req.user.id;
    db.execute(`DELETE FROM notificaciones WHERE usuario_id = ? AND id NOT IN (SELECT id FROM (SELECT id FROM notificaciones WHERE usuario_id = ? ORDER BY fecha_creacion DESC LIMIT 10) as t)`, [userId, userId], (err) => {
        if (err) return next(err);
        db.execute(`SELECT u.id as remitente_id, u.username as remitente_username, COUNT(m.id) as cantidad, MAX(m.fecha_envio) as fecha_creacion FROM mensajes_directos m JOIN users u ON m.emisor_id = u.id WHERE m.receptor_id = ? AND m.leido = FALSE GROUP BY u.id`, [userId], (err, msgRows) => {
            if (err) return next(err);
            db.execute(`SELECT * FROM notificaciones WHERE usuario_id = ? AND leido = FALSE ORDER BY fecha_creacion DESC`, [userId], (err, notifRows) => {
                if (err) return next(err);
                const totales = [ ...msgRows.map(m => ({ id: 'msg_' + m.remitente_username, tipo: 'mensaje', mensaje: `Tienes ${m.cantidad} mensaje(s) nuevo(s) de @${m.remitente_username}`, remitente_username: m.remitente_username, remitente_id: m.remitente_id, fecha_creacion: m.fecha_creacion })), ...notifRows ];
                totales.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
                res.json(totales.slice(0, 10));
            });
        });
    });
};

exports.marcarNotificacionLeida = (req, res, next) => { db.execute('UPDATE notificaciones SET leido = TRUE WHERE id = ? AND usuario_id = ?', [req.params.id, req.user.id], (err) => { if (err) return next(err); res.json({ message: 'Leída' }); }); };
exports.getMensajes = (req, res, next) => { db.execute('SELECT * FROM mensajes_directos WHERE (emisor_id = ? AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = ?) ORDER BY fecha_envio ASC', [req.user.id, req.params.otroUsuarioId, req.params.otroUsuarioId, req.user.id], (err, rows) => { if (err) return next(err); res.json(rows); }); };
exports.enviarMensaje = (req, res, next) => { db.execute('INSERT INTO mensajes_directos (emisor_id, receptor_id, mensaje) VALUES (?, ?, ?)', [req.user.id, req.body.receptor_id, req.body.mensaje], (err) => { if (err) return next(err); res.status(201).json({ message: 'Enviado' }); }); };
exports.marcarMensajesLeidos = (req, res, next) => { db.execute('UPDATE mensajes_directos SET leido = TRUE WHERE emisor_id = ? AND receptor_id = ?', [req.params.otroUsuarioId, req.user.id], (err) => { if (err) return next(err); res.json({ message: 'Leídos' }); }); };