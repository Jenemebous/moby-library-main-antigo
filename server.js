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
    cookie: { maxAge: 600000  }
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

app.get('/visualizar.ejs', (req, res) => {
    res.sendFile(__dirname + '/app/Views/visualizar.ejs');
});
app.get('/home-logado', (req, res) => {
    // Verifica se o usuário está logado
    if (!req.session.usuario) {
        return res.redirect('/login.html');
    }

    // Passe o nome do usuário para o frontend
    const nom_usuario = req.session.nom_usuario;

    res.render(__dirname + '/app/Views/home-logado', { nom_usuario });
});

app.get('/perfil.ejs', (req, res) => {
    res.sendFile(__dirname + '/app/Views/perfil.ejs');
});

// Rota de Login

app.post('/login', (req, res) => {
    const { nom_usuario, senha } = req.body;

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
                    // Adicione o nome do usuário à sessão
                    req.session.nom_usuario = nom_usuario;
                    res.redirect('/home-logado');
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
            res.redirect('/login.html');
        });
    });
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



app.post('/adicionarLivro', (req, res) => {
    const { titulo, autor, genero, ano_de_publicacao, sinopse } = req.body;
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null; // Pega o ID do usuário da sessão

    if (!id_usuario) {
        return res.status(401).send('Usuário não está logado');
    }

    // Validação dos dados do livro
    if (!titulo || !autor || !genero || !ano_de_publicacao || !sinopse) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    LivroDAO.adicionar(titulo, autor, genero, ano_de_publicacao, sinopse, id_usuario, (error) => {
        if (error) {
            console.error('Erro ao adicionar livro:', error);
            return res.status(500).send('Erro ao adicionar livro');
        }
        res.status(200).send('Livro adicionado com sucesso');
    });
});


// Rota para buscar todos os livros



app.get('/livros', (req, res) => {
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null; // Pega o ID do usuário da sessão

    if (!id_usuario) {
        return res.status(401).send('Usuário não está logado');
    }

    // Busca apenas os livros associados ao ID do usuário atual
    LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.status(500).send('Erro ao buscar livros');
        }
        res.status(200).json(livros);
    });
});


// Rota para remover livro

app.post('/removerLivros', (req, res) => {
    const id_livro = req.body.id_livro;
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null; // Pega o ID do usuário da sessão

    if (!id_usuario) {
        return res.status(401).send('Usuário não está logado');
    }

    // Primeiro verifique se o livro pertence ao usuário
    LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.status(500).send('Erro ao buscar livros');
        }

        const livro = livros.find(livro => livro.id_livro === id_livro);
        if (!livro) {
            return res.status(403).send('Você não tem permissão para remover este livro');
        }

        // Se o livro pertence ao usuário, remova-o
        LivroDAO.remover(id_livro, (error) => {
            if (error) {
                console.error('Erro ao remover livro:', error);
                return res.status(500).send('Erro ao remover livro');
            }
            res.status(200).send('Livro removido com sucesso');
        });
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
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null; // Pega o ID do usuário da sessão

    if (!id_usuario) {
        return res.status(401).send('Usuário não está logado');
    }

    // Busca apenas os livros associados ao ID do usuário atual
    LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.status(500).send('Erro ao buscar livros');
        }
    
        res.render('visualizar', { livros });
    });
});

//

app.get('/perfil', (req, res) => {
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null; // Pega o ID do usuário da sessão

    if (!id_usuario) {
        return res.redirect('/login.html'); // Redireciona se o usuário não estiver logado
    }

    // Busca os 5 primeiros livros associados ao ID do usuário atual
    LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.status(500).send('Erro ao buscar livros');
        }

        // Limita a lista de livros aos 5 primeiros
        const cincoPrimeirosLivros = livros.slice(0, 5);

        // Renderiza a página de perfil com os 5 primeiros livros ou a mensagem de nenhum livro adicionado
        res.render(__dirname + '/app/Views/perfil', { nom_usuario: req.session.nom_usuario, livros: cincoPrimeirosLivros });
    });
});


// Rota para fazer logout
app.get('/logout', (req, res) => {
    // Destrua a sessão
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).send('Erro ao fazer logout');
        }
        // Redirecione para a página de login após o logout
        res.redirect('/login.html');
    });
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`http://localhost:${port}`);
});

