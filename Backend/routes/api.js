const express = require('express');
const router = express.Router();

// Middlewares
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

// Controladores
const authUsuario = require('../controllers/authUsuarioController');
const contenido = require('../controllers/contenidoController');
const interacciones = require('../controllers/interaccionesController');

// ------------------------------------
// RUTAS DE AUTENTICACIÓN Y USUARIO
// ------------------------------------
router.post('/register', authUsuario.register);
router.post('/login', authUsuario.login);

router.get('/perfil', verificarToken, authUsuario.getPerfil);
router.get('/perfil/publico/:username', verificarToken, authUsuario.getPerfilPublico);
router.put('/perfil/descripcion', verificarToken, authUsuario.updateDescripcion);
router.put('/perfil/privacidad', verificarToken, authUsuario.updatePrivacidad);
router.put('/perfil/foto', verificarToken, authUsuario.updateFoto);

router.get('/fans', verificarToken, authUsuario.getFans);
router.get('/mis_amigos', verificarToken, authUsuario.getMisAmigos);
router.post('/seguir/:id', verificarToken, authUsuario.toggleSeguir);

router.get('/notificaciones', verificarToken, authUsuario.getNotificaciones);
router.put('/notificaciones/:id/leido', verificarToken, authUsuario.marcarNotificacionLeida);

router.get('/mensajes/:otroUsuarioId', verificarToken, authUsuario.getMensajes);
router.post('/mensajes', verificarToken, authUsuario.enviarMensaje);
router.put('/mensajes/marcar_leidos/:otroUsuarioId', verificarToken, authUsuario.marcarMensajesLeidos);

// ------------------------------------
// RUTAS DE CONTENIDO OFICIAL (MVC)
// ------------------------------------
router.get('/banners', verificarToken, contenido.getBanners);
router.put('/banners/:posicion', verificarToken, verificarAdmin, contenido.updateBanner);

router.get('/inicio/destacados', verificarToken, contenido.getDestacados);
router.put('/inicio/destacados', verificarToken, verificarAdmin, contenido.updateDestacado);

router.get('/encuestas/activa', verificarToken, contenido.getEncuestaActiva);
router.post('/encuestas', verificarToken, verificarAdmin, contenido.crearEncuesta);
router.delete('/encuestas/:id', verificarToken, verificarAdmin, contenido.borrarEncuesta);
router.post('/encuestas/:id/votar', verificarToken, contenido.votarEncuesta);

router.post('/notificaciones/aviso', verificarToken, verificarAdmin, contenido.crearAviso);
router.get('/avisos_globales/ultimo', verificarToken, contenido.getUltimoAviso);
router.put('/avisos_globales/:id', verificarToken, verificarAdmin, contenido.updateAviso);
router.delete('/avisos_globales/:id', verificarToken, verificarAdmin, contenido.deleteAviso);

router.get('/canciones', contenido.getCanciones); // Público para el test de Jest
router.get('/canciones/:id', contenido.getCancionById);
router.post('/canciones', verificarToken, verificarAdmin, contenido.createCancion);
router.put('/canciones/:id', verificarToken, verificarAdmin, contenido.updateCancion);
router.delete('/canciones/:id', verificarToken, verificarAdmin, contenido.deleteCancion);

router.get('/tareas', contenido.getTareas);
router.post('/tareas', verificarToken, verificarAdmin, contenido.createTarea);
router.put('/tareas/:id', verificarToken, verificarAdmin, contenido.updateTareaEstado); // Status
router.put('/tareas/editar/:id', verificarToken, verificarAdmin, contenido.updateTarea);
router.delete('/tareas/:id', verificarToken, verificarAdmin, contenido.deleteTarea);

router.get('/eventos', contenido.getEventos);
router.post('/eventos', verificarToken, verificarAdmin, contenido.createEvento);
router.put('/eventos/:id', verificarToken, verificarAdmin, contenido.updateEvento);
router.delete('/eventos/:id', verificarToken, verificarAdmin, contenido.deleteEvento);

// ------------------------------------
// RUTAS DE INTERACCIONES Y COMUNIDAD
// ------------------------------------
router.get('/foros', verificarToken, interacciones.getForos);
router.post('/foros', verificarToken, interacciones.createForo);
router.put('/foros/:id/estado', verificarToken, verificarAdmin, interacciones.updateEstadoForo);
router.delete('/foros/:id', verificarToken, verificarAdmin, interacciones.deleteForo);

router.get('/sugerencias', verificarToken, interacciones.getSugerencias);
router.post('/sugerencias', verificarToken, interacciones.createSugerencia);
router.put('/sugerencias/:id', verificarToken, interacciones.updateSugerencia);
router.delete('/sugerencias/:id', verificarToken, interacciones.deleteSugerencia);

router.get('/comentarios/:tipo/:id', interacciones.getComentarios);
router.post('/comentarios', verificarToken, interacciones.createComentario);
router.put('/comentarios/:id', verificarToken, interacciones.updateComentario);
router.delete('/comentarios/:id', verificarToken, interacciones.deleteComentario);

router.get('/calificaciones/:tipo/:id', interacciones.getCalificacion);
router.get('/calificaciones/mivoto/:tipo/:id', verificarToken, interacciones.getMiVoto);
router.post('/calificaciones', verificarToken, interacciones.createCalificacion);

module.exports = router;