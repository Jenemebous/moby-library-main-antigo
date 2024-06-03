const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const UsuarioDAO = require('./app/daos/usuarioDAO');

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

app.use(express.static('public'));

// Servir arquivos estáticos e rotas para HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/app/Views/index.html');
});

app.get('/signup.html', (req, res) => {
    res.sendFile(__dirname + '/app/Views/signup.html');
});

app.get('/login.html', (req, res) => {
    res.sendFile(__dirname + '/app/Views/login.html');
});

app.get('/perfil.html', (req, res) => {
    res.sendFile(__dirname + '/app/Views/perfil.html');
});

app.get('/estante.html', (req, res) => {
    res.sendFile(__dirname + '/app/Views/estante.html');
});

// Rota de Login
app.post('/login', (req, res) => {
    const { nom_usuario, senha } = req.body;

    // Validação do comprimento da senha
    if (senha.length !== 8) {
        return res.status(400).send('Senha deve ter exatamente 8 caracteres');
    }

    UsuarioDAO.buscarPorUsuario(nom_usuario, (error, usuarioEncontrado) => {
        if (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).send('Erro ao processar o login');
        }
        if (!usuarioEncontrado) {
            return res.status(401).send('Usuário ou senha incorretos');
        } else {
            bcrypt.compare(senha, usuarioEncontrado.senha, (err, result) => {
                if (err) {
                    console.error('Erro ao comparar senhas:', err);
                    return res.status(500).send('Erro ao processar o login');
                }
                if (result) {
                    req.session.usuario = usuarioEncontrado;
                    res.redirect('/');
                } else {
                    res.status(401).send('Usuário ou senha incorretos');
                }
            });
        }
    });
});

// Rota de Registro
app.post('/register', (req, res) => {
    const { nom_usuario, senha } = req.body;

    // Validação do comprimento da senha
    if (senha.length !== 8) {
        return res.status(400).send('Senha deve ter exatamente 8 caracteres');
    }

    UsuarioDAO.buscarPorUsuario(nom_usuario, (error, usuarioEncontrado) => {
        if (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).send('Erro ao processar o registro');
        }
        if (usuarioEncontrado) {
            return res.status(400).send('Usuário já existe');
        }
        UsuarioDAO.adicionar(nom_usuario, senha, (error) => {
            if (error) {
                console.error('Erro ao adicionar usuário ao banco de dados:', error);
                return res.status(500).send('Erro ao processar o registro');
            }
            res.redirect('/');
        });
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
