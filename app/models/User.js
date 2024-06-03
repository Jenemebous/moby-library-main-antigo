const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const UsuarioDAO = require('../daos/usuarioDAO');


const port = 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: '1234', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
    const { nom_usuario, senha } = req.body;
    UsuarioDAO.buscarPorUsuario(nom_usuario, (error, usuarioEncontrado) => {
        if (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).send('Erro ao processar o login');
        }
        if (!usuarioEncontrado) {
            UsuarioDAO.adicionar(nom_usuario, senha, (error) => {
                if (error) {
                    console.error('Erro ao adicionar usuário ao banco de dados:', error);
                    return res.status(500).send('Erro ao processar o login');
                }
                req.session.usuario = { nom_usuario, senha };
                res.redirect('/dashboard');
            });
        } else {
            req.session.usuario = usuarioEncontrado;
            res.redirect('/dashboard');
        }
    });
});

app.get('/dashboard', (req, res) => {
    if (req.session.usuario) {
        res.send('Painel do usuário');
    } else {
        res.redirect('/');
    }
});

app.get('/usuario', (req, res) => {
    UsuarioDAO.buscarTodos((error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao buscar usuários" });
        }
        res.status(200).json(resultados);
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});