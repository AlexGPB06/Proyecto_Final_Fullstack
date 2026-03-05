const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'avance_proyecto',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) console.error('Error conectando a MySQL:', err); 
    else {
        console.log('✅ Conectado a la Base de Datos MySQL (Pool)');
        connection.release();
    }
});

module.exports = db;