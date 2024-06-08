const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const ejs = require('ejs');
const LivroDAO = require('./app/daos/livroDAO');
const UsuarioDAO = require('./app/daos/usuarioDAO');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: '1234',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(express.static('public'));
app.set('views', './app/views');
app.set('view engine', 'ejs');


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

app.get('/adicionar.html', (req, res) => {
    res.sendFile(__dirname + '/app/Views/adicionar.html');
});

app.get('/editar.html', (req, res) => {
    res.sendFile(__dirname + '/app/Views/editar.html');
});

app.get('/remover.html', (req, res) => {
    res.sendFile(__dirname + '/app/Views/remover.html');
});

app.get('/visualisar.ejs', (req, res) => {
    res.sendFile(__dirname + '/app/Views/visualizar.ejs');
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



// Rota para adicionar livro
app.post('/adicionarLivro', (req, res) => {
    const { titulo, autor, genero, ano_de_publicacao, sinopse } = req.body;

    // Validação dos dados do livro
    if (!titulo || !autor || !genero || !ano_de_publicacao || !sinopse) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    LivroDAO.adicionar(titulo, autor, genero, ano_de_publicacao, sinopse, (error) => {
        if (error) {
            console.error('Erro ao adicionar livro:', error);
            return res.status(500).send('Erro ao adicionar livro');
        }
        res.status(200).send('Livro adicionado com sucesso');
    });
});

// Rota para buscar todos os livros
app.get('/livros', (req, res) => {
    const searchTerm = req.query.search;
    if (searchTerm) {
        // Se um termo de pesquisa foi fornecido, buscar livros com base no termo de pesquisa
        LivroDAO.buscarPorTermoDePesquisa(searchTerm, (error, livros) => {
            if (error) {
                console.error('Erro ao buscar livros:', error);
                return res.status(500).send('Erro ao buscar livros');
            }
            res.status(200).json(livros);
        });
    } else {
        // Caso contrário, retornar todos os livros
        LivroDAO.buscarTodos((error, livros) => {
            if (error) {
                console.error('Erro ao buscar livros:', error);
                return res.status(500).send('Erro ao buscar livros');
            }
            res.status(200).json(livros);
        });
    }
});
// Rota para remover livro

app.post('/removerLivros', (req, res) => {
    const livroId = req.body.id_livro;

    LivroDAO.remover(livroId, (error) => {
        if (error) {
            console.error('Erro ao remover livro:', error);
            return res.status(500).send('Erro ao remover livro');
        }
        res.status(200).send('Livro removido com sucesso');
    });
});

app.post('/editarLivro', (req, res) => {
    const { id, titulo, autor, sinopse } = req.body;

    // Validação dos dados do livro
    if (!id || !titulo || !autor || !sinopse) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    LivroDAO.editar(id, titulo, autor, sinopse, (error) => {
        if (error) {
            console.error('Erro ao editar livro:', error);
            return res.status(500).send('Erro ao editar livro');
        }
        res.status(200).send('Livro editado com sucesso');
    });
});

// ejs


app.get('/visualizar', (req, res) => {
    LivroDAO.buscarTodos((error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.status(500).send('Erro ao buscar livros');
        }
    
        res.render('visualizar', { livros });
    });
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`http://localhost:${port}`);
});

