const request = require('supertest');
const app = require('./server');
const db = require('./config/db'); // Traemos la conexión a la base de datos
const bcrypt = require('bcryptjs');

let tokenAdmin = '';
let tokenFan = '';

describe('Pruebas de Integración (Rúbrica de 8 Puntos)', () => {

    // ==============================================================
    // PREPARACIÓN: Jest crea sus propios usuarios de prueba en la BD
    // ==============================================================
    beforeAll(async () => {
        const hash = await bcrypt.hash('123456', 10);
        
        // 1. Inyectamos a los usuarios de prueba si no existen
        await db.promise().execute(
            `INSERT IGNORE INTO users (username, email, password, rol) VALUES 
            ('AdminTestPDG', 'admin_test@pdg.com', ?, 'admin'),
            ('FanTestPDG', 'fan_test@pdg.com', ?, 'fan')`, 
            [hash, hash]
        );

        // 2. Aseguramos que la contraseña sea 123456 (por si ya existían)
        await db.promise().execute(
            `UPDATE users SET password = ? WHERE username IN ('AdminTestPDG', 'FanTestPDG')`,
            [hash]
        );

        // 3. Hacemos Login para sacar los Tokens reales y guardarlos
        const resAdmin = await request(app).post('/api/login').send({ username: 'AdminTestPDG', password: '123456' });
        tokenAdmin = resAdmin.body.token;

        const resFan = await request(app).post('/api/login').send({ username: 'FanTestPDG', password: '123456' });
        tokenFan = resFan.body.token;
    });

    // LIMPIEZA: Apagamos la conexión a BD al terminar para que Jest cierre limpio
    afterAll(async () => {
        await db.promise().end();
    });


    // ==============================================================
    // INICIAN LAS 8 PRUEBAS DE TU RÚBRICA
    // ==============================================================

    it('1. Login exitoso - Debería iniciar sesión y devolver un token (Status 200)', async () => {
        const res = await request(app).post('/api/login').send({
            username: 'AdminTestPDG',
            password: '123456'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('2. Login fallido - Debería devolver un error 401 si la contraseña es incorrecta', async () => {
        const res = await request(app).post('/api/login').send({
            username: 'AdminTestPDG',
            password: 'passwordIncorrecta123'
        });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('3. Acceso permitido por rol - Un Admin DEBE poder publicar Avisos Globales (Status 200)', async () => {
        const res = await request(app).post('/api/notificaciones/aviso')
            .set('Authorization', `Bearer ${tokenAdmin}`) // 🔑 Token de Admin
            .send({ mensaje: 'Mensaje de prueba automático' });
        
        expect(res.statusCode).toBe(200);
    });

    it('4. Acceso denegado por rol - Un Fan NO DEBE poder publicar Avisos Globales (Status 403)', async () => {
        const res = await request(app).post('/api/notificaciones/aviso')
            .set('Authorization', `Bearer ${tokenFan}`) // 🛑 Token de Fan
            .send({ mensaje: 'Intento de hackeo' });
        
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/Privilegios de administrador requeridos/i);
    });

    it('5. Crear registro - Un usuario debería poder crear un Foro nuevo (Status 201)', async () => {
        const res = await request(app).post('/api/foros')
            .set('Authorization', `Bearer ${tokenFan}`)
            .send({ 
                titulo: 'Foro de Prueba Jest', 
                descripcion: 'Probando la creación de foros' 
            });
        
        expect(res.statusCode).toBe(201);
    });

    it('6. Listar registros - Debería obtener toda la lista de canciones (Status 200)', async () => {
        const res = await request(app).get('/api/canciones');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('7. Validación fallida - Debería devolver 400 al intentar crear una canción sin datos obligatorios', async () => {
        const res = await request(app).post('/api/canciones')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({ titulo: 'Canción Incompleta' }); // Falta el artista a propósito
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Faltan campos/i);
    });

    it('8. Paginación o filtro - Debería filtrar las canciones usando el query param ?genero=', async () => {
        const res = await request(app).get('/api/canciones?genero=Rock');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

});