const db = require('../db/database');

class LivroDAO {
    constructor() {}

    adicionar(titulo, autor, genero, ano, sinopse, callback) {
        const sql = 'INSERT INTO livro (titulo, autor, genero, ano_de_publicacao, sinopse) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [titulo, autor, genero, ano, sinopse], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null);
        });
    }

   
    buscarTodos(callback) {
        const sql = 'SELECT * FROM livro';
        db.query(sql, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    }

    editar(id_livro, titulo, autor, sinopse, callback) {
        const sql = 'UPDATE livro SET titulo = ?, autor = ?, sinopse = ? WHERE id_livro = ?';
        db.query(sql, [titulo, autor, sinopse, id_livro], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null);
        });
    }
  
    remover(id_livro, callback) {
        const sql = 'DELETE FROM livro WHERE id_livro = ?';
        db.query(sql, [id_livro], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null);
        });
    }
    
    buscarPorTermoDePesquisa(searchTerm, callback) {
        const sql = 'SELECT * FROM livro WHERE titulo LIKE ? OR autor LIKE ?';
        const searchTermWithWildcard = '%' + searchTerm + '%';
        db.query(sql, [searchTermWithWildcard, searchTermWithWildcard], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    }
    
}


module.exports = new LivroDAO();
