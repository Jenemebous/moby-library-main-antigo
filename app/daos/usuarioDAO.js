const db = require('../db/database');

class UsuarioDAO {
    static buscarTodos(callback) {
        db.query('SELECT * FROM users', (err, rows) => {
            if (err) {
                return callback(err);
            }
            callback(null, rows);
        });
    }

    static adicionar(nom_usuario, senha, callback) {
        db.query('INSERT INTO users (nom_usuario, senha) VALUES (?, ?)', [nom_usuario, senha], (err) => {
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    }
    
    static buscarPorUsuario(nom_usuario, callback) {
        db.query('SELECT * FROM users WHERE nom_usuario = ?', [nom_usuario], (err, rows) => {
            if (err) {
                return callback(err);
            }
            if (rows.length === 0) {
                return callback(null, null); 
            }
            callback(null, rows[0]); 
        });
    }
}

module.exports = UsuarioDAO;